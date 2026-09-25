export const AI_PROVIDER_TYPES=Object.freeze(['openai','anthropic','google','local','mock']);

export const PERSONA_DECISION_SCHEMA=Object.freeze({
  required:['persona_role','position','why','risks','conditions','confidence','dissent'],
  stance:['support','challenge','conditional','block','neutral'],
  confidence:['very_high','high','medium','low','very_low']
});

function arr(v){return Array.isArray(v)?v:[]}
function str(v){return String(v??'').trim()}

export function buildPersonaInferenceRequest({
  persona,
  caseSnapshot,
  evidenceContext=[],
  priorOutcomes=[],
  policyContext={}
}={}){
  if(!persona?.role) throw new Error('Persona role is required.');
  if(!caseSnapshot?.case_id && !caseSnapshot?.id) throw new Error('Case snapshot is required.');
  return {
    contract_version:'atlas-persona-v1',
    persona:{role:persona.role,mandate:persona.mandate,primary_questions:arr(persona.primary_questions)},
    case_snapshot:caseSnapshot,
    evidence_context:evidenceContext,
    prior_outcomes:priorOutcomes,
    policy_context:{
      evidence_law:'FACT != RELATIONSHIP != PIPELINE != COMMITMENT != CONTRACTED REVENUE',
      human_authority:true,
      external_action_requires_approval:true,
      ...policyContext
    },
    output_schema:{
      persona_role:persona.role,
      stance:'support|challenge|conditional|block|neutral',
      position:'string',
      why:['string'],
      risks:['string'],
      conditions:['string'],
      confidence:'very_high|high|medium|low|very_low',
      dissent:[{against_role:'string|null',issue:'string',severity:'material|minor'}],
      hard_stop:{active:'boolean',domain:'string|null',reason:'string|null'}
    }
  };
}

export function validatePersonaDecision(input,expectedRole){
  const x=input||{};
  const role=str(x.persona_role);
  if(expectedRole && role!==expectedRole) throw new Error(`Persona role mismatch: expected ${expectedRole}, got ${role||'(empty)'}`);
  if(!PERSONA_DECISION_SCHEMA.stance.includes(str(x.stance))) throw new Error('Invalid persona stance.');
  if(!str(x.position)) throw new Error('Persona position is required.');
  if(!PERSONA_DECISION_SCHEMA.confidence.includes(str(x.confidence))) throw new Error('Invalid confidence class.');
  return {
    persona_role:role,
    stance:str(x.stance),
    position:str(x.position),
    why:arr(x.why).map(str).filter(Boolean),
    risks:arr(x.risks).map(str).filter(Boolean),
    conditions:arr(x.conditions).map(str).filter(Boolean),
    confidence:str(x.confidence),
    dissent:arr(x.dissent).map(d=>({
      against_role:str(d?.against_role)||null,
      issue:str(d?.issue),
      severity:['material','minor'].includes(str(d?.severity))?str(d.severity):'material'
    })).filter(d=>d.issue),
    hard_stop:{
      active:Boolean(x.hard_stop?.active),
      domain:str(x.hard_stop?.domain)||null,
      reason:str(x.hard_stop?.reason)||null
    }
  };
}

export function providerEnvelope({provider,model,request,response,latency_ms=null,usage=null}={}){
  if(!AI_PROVIDER_TYPES.includes(provider)) throw new Error('Unsupported AI provider type.');
  return {
    provider,
    model:str(model)||null,
    request_contract:request?.contract_version||null,
    response,
    latency_ms,
    usage,
    generated_at:new Date().toISOString()
  };
}
