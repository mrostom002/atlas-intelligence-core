import { runBrain } from './brain-v0.mjs';
import { EXECUTIVE_PERSONAS } from './executive-committee.mjs';
import { integrateExecutiveDecision } from './executive-integrator.mjs';
import { CHALLENGE_LENSES, selectChallengeLenses } from './reasoning-lenses.mjs';
import { buildPersonaInferenceRequest, validatePersonaDecision } from '../ai/provider-contract.mjs';
import { DATA_CLASS, allowedProviders } from '../ai/routing-policy.mjs';

function arr(v){return Array.isArray(v)?v:[]}
function s(v){return String(v??'').trim()}
function ids(v){return new Set(arr(v).map(x=>s(x)).filter(Boolean))}

export function observationCaseRefs(observation={}){
  const out=new Set();
  for(const key of ['case_id','case_key','subject_key']) if(observation[key]) out.add(s(observation[key]));
  if(observation.account_id!=null) out.add('account:'+s(observation.account_id));
  if(observation.partner_id!=null) out.add('partner:'+s(observation.partner_id));
  if(observation.corridor_id!=null) out.add('corridor:'+s(observation.corridor_id));
  return out;
}

function caseRefs(caseInput={}){
  const out=new Set([s(caseInput.id)]);
  if(caseInput.account_id!=null)out.add('account:'+s(caseInput.account_id));
  if(caseInput.partner_id!=null)out.add('partner:'+s(caseInput.partner_id));
  if(caseInput.corridor_id!=null)out.add('corridor:'+s(caseInput.corridor_id));
  return out;
}

function changedObservations(delta={}){
  return [
    ...arr(delta.added),
    ...arr(delta.changed).map(x=>x?.after).filter(Boolean),
    ...arr(delta.stale)
  ];
}

export function selectAffectedCaseIds({cases=[],delta={},force=false}={}){
  if(force)return cases.map(x=>s(x.id)).filter(Boolean);
  if(!Number(delta?.meaningful_change_count||0))return [];
  const changed=changedObservations(delta);
  const changedRefs=new Set(changed.flatMap(x=>[...observationCaseRefs(x)]));
  if(!changedRefs.size)return [];
  return cases
    .filter(c=>[...caseRefs(c)].some(ref=>changedRefs.has(ref)))
    .map(c=>s(c.id))
    .filter(Boolean);
}

function safeDataClass(caseInput={}){
  const value=s(caseInput.data_class);
  return Object.values(DATA_CLASS).includes(value) ? value : DATA_CLASS.CONFIDENTIAL_COMMERCIAL;
}

function deterministicRecommendation(decision){
  return {
    source:'deterministic_brain',
    disposition:decision.action_band==='BLOCKED'?'HOLD':'REVIEW',
    recommended_action:decision.action,
    unresolved_conditions:arr(decision.path?.blockers).map(x=>x.label||x.id).filter(Boolean),
    hard_stops:decision.action_band==='BLOCKED'?[{role:'DETERMINISTIC_GATE',domain:'rights_or_policy',reason:'Case is blocked by deterministic controls.'}]:[],
    material_dissent:[],
    human_approval_required:true,
    rule:'Deterministic fallback only; no external model inference was permitted or available.'
  };
}

function providerAllowed(dataClass,provider,policyOptions){
  return allowedProviders(dataClass,policyOptions).includes(provider);
}

async function runViews({
  roles,
  roleCatalog,
  decision,
  caseInput,
  evidenceContext,
  priorOutcomes,
  policyContext,
  provider,
  model,
  inferPersona
}){
  const views=[];
  const usage=[];
  for(const role of roles){
    const persona=roleCatalog[role];
    if(!persona)continue;
    const request=buildPersonaInferenceRequest({
      persona,
      caseSnapshot:{...caseInput,...decision},
      evidenceContext,
      priorOutcomes,
      policyContext
    });
    const result=await inferPersona({provider,model,request,role});
    const raw=result?.decision??result?.response??result;
    const validated=validatePersonaDecision(raw,role);
    views.push(validated);
    usage.push({
      role,
      provider:result?.provider||provider,
      model:result?.model||model||null,
      usage:result?.usage||null,
      latency_ms:result?.latency_ms??null
    });
  }
  return {views,usage};
}

export async function runAutonomousReasoningCycle({
  previous_observations=[],
  current_observations=[],
  cases=[],
  outcomes=[],
  evidence_context_by_case={},
  prior_outcomes_by_case={},
  provider=null,
  model=null,
  inferPersona=null,
  provider_policy={},
  force=false,
  max_challenge_lenses=4,
  now=new Date()
}={}){
  const deterministic=runBrain({
    previous_observations,
    current_observations,
    cases,
    outcomes,
    now
  });
  const affected=ids(selectAffectedCaseIds({cases,delta:deterministic.delta,force}));
  const results=[];

  for(const decision of deterministic.decisions){
    const caseInput=cases.find(x=>s(x.id)===decision.case_id)||{};
    if(!affected.has(decision.case_id)){
      results.push({
        case_id:decision.case_id,
        status:'unchanged',
        deterministic_decision:decision,
        integrated_recommendation:null,
        persona_views:[],
        challenge_views:[],
        usage:[]
      });
      continue;
    }

    const dataClass=safeDataClass(caseInput);
    const allowed=Boolean(
      provider &&
      typeof inferPersona==='function' &&
      providerAllowed(dataClass,provider,provider_policy)
    );

    if(!allowed){
      results.push({
        case_id:decision.case_id,
        status:'reasoned_deterministically',
        data_class:dataClass,
        external_inference_allowed:false,
        deterministic_decision:decision,
        integrated_recommendation:deterministicRecommendation(decision),
        persona_views:[],
        challenge_views:[],
        usage:[],
        human_approval_required:true
      });
      continue;
    }

    const evidenceContext=arr(evidence_context_by_case[decision.case_id]);
    const priorOutcomes=arr(prior_outcomes_by_case[decision.case_id]);
    const policyContext={
      data_class:dataClass,
      model_output_is_evidence:false,
      commercial_truth_auto_upgrade:false,
      human_authority:true
    };

    const executiveRoles=Object.values(EXECUTIVE_PERSONAS).filter(x=>x.status==='active').map(x=>x.role);
    const executive=await runViews({
      roles:executiveRoles,
      roleCatalog:EXECUTIVE_PERSONAS,
      decision,
      caseInput,
      evidenceContext,
      priorOutcomes,
      policyContext,
      provider,
      model,
      inferPersona
    });

    const challengeRoles=selectChallengeLenses(caseInput,decision,max_challenge_lenses);
    const challenge=await runViews({
      roles:challengeRoles,
      roleCatalog:CHALLENGE_LENSES,
      decision,
      caseInput,
      evidenceContext,
      priorOutcomes,
      policyContext,
      provider,
      model,
      inferPersona
    });

    const integrated=integrateExecutiveDecision({
      caseDecision:decision,
      personaViews:executive.views,
      challengeViews:challenge.views
    });

    results.push({
      case_id:decision.case_id,
      status:'reasoned_with_external_inference',
      data_class:dataClass,
      external_inference_allowed:true,
      deterministic_decision:decision,
      integrated_recommendation:integrated,
      persona_views:executive.views,
      challenge_views:challenge.views,
      usage:[...executive.usage,...challenge.usage],
      human_approval_required:true
    });
  }

  return {
    brain_version:'brain-v0.2-autonomous-cycle',
    generated_at:now.toISOString(),
    trigger:{
      force:Boolean(force),
      meaningful_change_count:deterministic.delta.meaningful_change_count,
      affected_case_ids:[...affected]
    },
    deterministic,
    cases:results,
    safeguards:{
      model_output_is_evidence:false,
      commercial_truth_auto_upgrade:false,
      external_action_auto_execute:false,
      human_authority_preserved:true,
      fail_closed_on_unapproved_data_route:true
    }
  };
}
