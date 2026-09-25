export const DEFAULT_AI_RUNTIME_POLICY=Object.freeze({
  enabled:false,
  provider:null,
  allowed_models:[],
  billing_mode:'disabled',
  daily_budget_usd:0,
  monthly_budget_usd:0,
  max_cost_per_run_usd:0,
  daily_neuron_budget:0,
  max_neurons_per_run:0,
  max_input_tokens_per_call:null,
  max_output_tokens_per_call:null,
  max_calls_per_run:0,
  require_human_approval_over_usd:0
});

function n(v,f=0){const x=Number(v);return Number.isFinite(x)?x:f}

export function canRunInference({policy,usage,request}={}){
  const p={...DEFAULT_AI_RUNTIME_POLICY,...(policy||{})};
  if(!p.enabled)return {allowed:false,reason:'runtime_disabled'};
  if(!p.provider)return {allowed:false,reason:'provider_not_configured'};
  if(!Array.isArray(p.allowed_models)||!p.allowed_models.includes(request?.model))return {allowed:false,reason:'model_not_allowed'};
  if(n(p.max_calls_per_run)<=0)return {allowed:false,reason:'run_call_budget_zero'};
  if(n(usage?.calls_this_run)>=n(p.max_calls_per_run))return {allowed:false,reason:'run_call_limit_reached'};

  if(p.billing_mode==='free_neuron_only'){
    if(n(p.daily_neuron_budget)<=0 || n(p.max_neurons_per_run)<=0)return {allowed:false,reason:'neuron_budget_zero'};
    if(n(usage?.neurons_today)>=n(p.daily_neuron_budget))return {allowed:false,reason:'daily_neuron_budget_exhausted'};
    const estimated=n(request?.estimated_neurons,-1);
    if(estimated<0)return {allowed:false,reason:'unknown_neuron_cost'};
    if(n(usage?.neurons_this_run)+estimated>n(p.max_neurons_per_run))return {allowed:false,reason:'run_neuron_limit'};
    return {allowed:true,reason:'within_free_neuron_policy'};
  }

  if(p.billing_mode==='paid_capped'){
    if(n(p.daily_budget_usd)<=0 || n(p.monthly_budget_usd)<=0)return {allowed:false,reason:'spend_budget_zero'};
    if(n(usage?.spent_today_usd)>=n(p.daily_budget_usd))return {allowed:false,reason:'daily_budget_exhausted'};
    if(n(usage?.spent_month_usd)>=n(p.monthly_budget_usd))return {allowed:false,reason:'monthly_budget_exhausted'};
    if(request?.estimated_cost_usd==null)return {allowed:false,reason:'unknown_cost'};
    if(n(p.max_cost_per_run_usd)<=0)return {allowed:false,reason:'run_cost_budget_zero'};
    if(n(usage?.spent_this_run_usd)+n(request.estimated_cost_usd)>n(p.max_cost_per_run_usd))return {allowed:false,reason:'run_cost_limit'};
    return {allowed:true,reason:'within_paid_policy'};
  }

  return {allowed:false,reason:'billing_mode_disabled'};
}

export function usageSummary(events=[]){
  return events.reduce((a,e)=>{
    a.calls+=1;
    a.input_tokens+=n(e.input_tokens);
    a.output_tokens+=n(e.output_tokens);
    a.neurons+=n(e?.metadata?.neurons);
    a.estimated_cost_usd+=n(e.estimated_cost_usd);
    a.actual_cost_usd+=n(e.actual_cost_usd);
    return a;
  },{calls:0,input_tokens:0,output_tokens:0,neurons:0,estimated_cost_usd:0,actual_cost_usd:0});
}
