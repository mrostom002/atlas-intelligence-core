import { buildDailyDelta } from '../compounding/daily-delta.mjs';
import { buildMoneyRadar, classifyOpportunity } from '../compounding/money-radar.mjs';

const VALID_OUTCOMES=new Set(['progressed','stalled','won','lost','delivered','collected','no_response','invalidated']);

function n(v,f=null){const x=Number(v);return Number.isFinite(x)?x:f}
function s(v){return String(v??'').trim()}
function arr(v){return Array.isArray(v)?v:[]}

export function classifyMoneyClaim(input={}){
  const evidence=n(input.evidence_tier,5);
  const state=s(input.commercial_state).toLowerCase();
  const rights=s(input.rights_status||'clear').toLowerCase();
  if(['blocked','prohibited'].includes(rights)) return {class:'blocked',label:'Blocked by rights/permission',count_as_revenue:false};
  if(state==='collected' && evidence<=1) return {class:'collected_cash',label:'Collected cash',count_as_revenue:true};
  if(['contracted','invoiced'].includes(state) && evidence<=1) return {class:'contracted_revenue',label:'Contracted Atlas revenue',count_as_revenue:true};
  if(n(input.expected_gp,0)>0 && evidence<=3) return {class:'qualified_capture',label:'Qualified Atlas capture',count_as_revenue:false};
  if(s(input.monetization_mechanism)) return {class:'monetization_hypothesis',label:'Monetization hypothesis',count_as_revenue:false};
  return {class:'unpriced',label:'Unpriced / not yet monetized',count_as_revenue:false};
}

export function evidenceConfidence(tier){
  const t=n(tier,5);
  if(t<=1)return 'very_high';
  if(t===2)return 'high';
  if(t===3)return 'medium';
  if(t===4)return 'low';
  return 'very_low';
}

function actionableBlockers(input={}){
  return arr(input.blockers)
    .filter(b=>s(b.status||'open').toLowerCase()!=='resolved')
    .sort((a,b)=>(n(a.priority,99)-n(b.priority,99)) || Number(Boolean(b.controllable))-Number(Boolean(a.controllable)));
}

export function chooseNextAction(input={}){
  const blockers=actionableBlockers(input);
  const preferred=blockers.find(b=>b.controllable!==false && s(b.action));
  if(preferred) return {
    action:s(preferred.action),
    blocker_id:s(preferred.id)||null,
    basis:s(preferred.basis)||'highest-priority controllable blocker',
    human_approval_required:true
  };
  const fallback=s(input.next_action);
  return {
    action:fallback || 'Obtain the missing evidence required to advance this case.',
    blocker_id:null,
    basis:fallback?'case-provided next action':'no controllable path is sufficiently evidenced',
    human_approval_required:true
  };
}

export function derivePath(input={}){
  const steps=arr(input.path).map((x,i)=>typeof x==='string'?{order:i+1,label:x,status:'planned'}:{order:i+1,...x});
  const blockers=actionableBlockers(input);
  return {
    steps,
    blockers:blockers.map(b=>({id:s(b.id)||null,label:s(b.label)||s(b.id),status:s(b.status||'open'),controllable:b.controllable!==false,priority:n(b.priority,99)}))
  };
}

export function deriveUnknowns(input={}){
  const explicit=arr(input.unknowns).map(s).filter(Boolean);
  const blockers=actionableBlockers(input).filter(b=>s(b.status||'open')!=='resolved').map(b=>s(b.label)||s(b.id)).filter(Boolean);
  return [...new Set([...explicit,...blockers])];
}

export function deriveMoney(input={}){
  const claim=classifyMoneyClaim(input);
  const expectedGp=n(input.expected_gp,0);
  const recurringGp=n(input.recurring_gp,0);
  const cashNeed=n(input.cash_need,0);
  const statement=s(input.money_statement) || (
    claim.class==='qualified_capture'
      ? `${input.currency||'USD'} ${expectedGp.toLocaleString('en-US')} qualified Atlas capture`
      : claim.label
  );
  return {
    claim,
    statement,
    expected_gp:expectedGp||null,
    recurring_gp:recurringGp||null,
    cash_need:cashNeed||0,
    currency:s(input.currency||'USD'),
    evidence_tier:n(input.evidence_tier,5),
    confidence:evidenceConfidence(input.evidence_tier),
    forecast_eligible:claim.count_as_revenue===true
  };
}

export function deriveActionabilityBand(input={}){
  const rights=s(input.rights_status||'clear').toLowerCase();
  if(['blocked','prohibited'].includes(rights))return 'BLOCKED';
  const evidence=n(input.evidence_tier,5);
  const blockers=actionableBlockers(input);
  if(blockers.some(b=>b.controllable!==false) && evidence<=3)return 'NOW';
  if(s(input.monetization_mechanism) || s(input.strategic_value))return 'BUILD';
  return 'WATCH';
}

export function buildCaseDecision(input={}){
  if(!s(input.id)) throw new Error('Case id is required');
  const money=deriveMoney(input);
  const action=chooseNextAction(input);
  const path=derivePath(input);
  const unknowns=deriveUnknowns(input);
  const band=deriveActionabilityBand(input);
  const moneyPriority=classifyOpportunity({
    expected_gp:n(input.expected_gp,0),
    recurring_gp:n(input.recurring_gp,0),
    time_to_cash_days:n(input.time_to_cash_days,9999),
    cash_need:n(input.cash_need,0),
    evidence_tier:n(input.evidence_tier,5),
    data_gain:s(input.data_gain||'low'),
    control:s(input.control||'unknown'),
    rights_status:s(input.rights_status||'clear')
  });
  return {
    case_id:s(input.id),
    title:s(input.title)||s(input.id),
    band,
    action_band:band,
    money_band:moneyPriority.band,
    money_priority_reasons:moneyPriority.reasons,
    money,
    path,
    action,
    unknowns,
    commercial_state:s(input.commercial_state||'signal'),
    evidence_tier:n(input.evidence_tier,5),
    evidence_confidence:evidenceConfidence(input.evidence_tier),
    rights_status:s(input.rights_status||'clear'),
    learning_target:s(input.learning_target)||null,
    brain_rules:[
      'FACT != RELATIONSHIP != PIPELINE != COMMITMENT != CONTRACTED REVENUE',
      'weak evidence cannot be upgraded silently',
      'recommended actions require human authorization',
      'personal/confidential data stays internal unless rights explicitly permit otherwise'
    ]
  };
}

export function buildLearningRecord({decision,outcome}={}){
  if(!decision?.case_id) throw new Error('Decision is required');
  const type=s(outcome?.type).toLowerCase();
  if(!VALID_OUTCOMES.has(type)) throw new Error(`Unsupported outcome: ${type||'(empty)'}`);
  const signal = ['won','delivered','collected'].includes(type) ? 'positive'
    : ['lost','invalidated'].includes(type) ? 'negative'
    : ['progressed'].includes(type) ? 'progress'
    : 'neutral';
  return {
    case_id:decision.case_id,
    decision_band:decision.band,
    recommended_action:decision.action.action,
    outcome_type:type,
    outcome_signal:signal,
    outcome_at:outcome?.outcome_at||new Date().toISOString(),
    evidence_ref:outcome?.evidence_ref||null,
    notes:s(outcome?.notes)||null,
    proposed_observations:arr(outcome?.observations),
    human_review_required:true,
    auto_mutation_allowed:false
  };
}

export function runBrain({previous_observations=[],current_observations=[],cases=[],outcomes=[],now=new Date()}={}){
  const delta=buildDailyDelta(previous_observations,current_observations,now);
  const decisions=cases.map(buildCaseDecision);
  const radarInput=cases.map(c=>({
    id:c.id,
    expected_gp:n(c.expected_gp,0),
    recurring_gp:n(c.recurring_gp,0),
    time_to_cash_days:n(c.time_to_cash_days,9999),
    cash_need:n(c.cash_need,0),
    evidence_tier:n(c.evidence_tier,5),
    data_gain:s(c.data_gain||'low'),
    control:s(c.control||'unknown'),
    rights_status:s(c.rights_status||'clear')
  }));
  const money_radar=buildMoneyRadar(radarInput);
  const learning=outcomes.map(o=>{
    const d=decisions.find(x=>x.case_id===o.case_id);
    return d?buildLearningRecord({decision:d,outcome:o}):null;
  }).filter(Boolean);
  return {
    generated_at:now.toISOString(),
    delta,
    decisions,
    money_radar,
    learning,
    safeguards:{
      human_authority_preserved:true,
      commercial_truth_auto_upgrade:false,
      external_data_rights_required:true
    }
  };
}
