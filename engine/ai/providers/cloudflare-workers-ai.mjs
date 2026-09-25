export const CLOUDFLARE_SANDBOX_MODEL='@cf/openai/gpt-oss-20b';

export function buildWorkersAIRequest({messages,max_tokens=1800,reasoning_effort='medium'}={}){
  if(!Array.isArray(messages)||!messages.length) throw new Error('messages are required');
  return {
    model:CLOUDFLARE_SANDBOX_MODEL,
    input:{
      messages,
      max_tokens,
      reasoning:{effort:reasoning_effort}
    },
    options:{
      gateway:{id:'atlas-brain'},
      log_usage:true
    }
  };
}

export function sanitizeCaseForSandbox(caseSnapshot={}){
  const allow=[
    'case_id','title','commercial_state','evidence_tier','evidence_confidence',
    'action_band','money_band','money_statement','rights_status',
    'path','blockers','unknowns','learning_target'
  ];
  const out={};
  for(const k of allow) if(caseSnapshot[k]!==undefined) out[k]=caseSnapshot[k];
  return out;
}

export function cloudflareUsageEvent({brain_run_id=null,recommendation_id=null,persona_role=null,model=CLOUDFLARE_SANDBOX_MODEL,response={},latency_ms=null,status='success'}={}){
  const usage=response?.usage||{};
  return {
    brain_run_id,
    recommendation_id,
    persona_role,
    provider:'cloudflare-workers-ai',
    model,
    provider_request_id:response?.request_id||null,
    request_kind:'executive_persona',
    status,
    input_tokens:usage?.prompt_tokens??usage?.input_tokens??null,
    output_tokens:usage?.completion_tokens??usage?.output_tokens??null,
    cached_input_tokens:usage?.cached_tokens??usage?.cached_input_tokens??null,
    estimated_cost_usd:null,
    actual_cost_usd:null,
    latency_ms,
    metadata:{gateway:'atlas-brain'}
  };
}
