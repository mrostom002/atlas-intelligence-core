import assert from 'node:assert/strict';
import { DEFAULT_AI_RUNTIME_POLICY, canRunInference, usageSummary } from '../../engine/ai/usage-policy.mjs';

assert.equal(canRunInference({policy:DEFAULT_AI_RUNTIME_POLICY,usage:{},request:{model:'x',estimated_cost_usd:0.1}}).reason,'runtime_disabled');

const enabled={
  enabled:true,
  provider:'example',
  allowed_models:['model-a'],
  billing_mode:'paid_capped',
  daily_budget_usd:5,
  monthly_budget_usd:50,
  max_cost_per_run_usd:1,
  max_calls_per_run:6
};

assert.equal(canRunInference({policy:enabled,usage:{calls_this_run:0,spent_today_usd:0,spent_month_usd:0,spent_this_run_usd:0},request:{model:'model-b',estimated_cost_usd:.1}}).reason,'model_not_allowed');
assert.equal(canRunInference({policy:enabled,usage:{calls_this_run:0,spent_today_usd:0,spent_month_usd:0,spent_this_run_usd:0},request:{model:'model-a'}}).reason,'unknown_cost');
assert.equal(canRunInference({policy:enabled,usage:{calls_this_run:6,spent_today_usd:0,spent_month_usd:0,spent_this_run_usd:0},request:{model:'model-a',estimated_cost_usd:.1}}).reason,'run_call_limit_reached');
assert.equal(canRunInference({policy:enabled,usage:{calls_this_run:0,spent_today_usd:5,spent_month_usd:5,spent_this_run_usd:0},request:{model:'model-a',estimated_cost_usd:.1}}).reason,'daily_budget_exhausted');
assert.equal(canRunInference({policy:enabled,usage:{calls_this_run:0,spent_today_usd:0,spent_month_usd:0,spent_this_run_usd:.95},request:{model:'model-a',estimated_cost_usd:.1}}).reason,'run_cost_limit');
assert.equal(canRunInference({policy:enabled,usage:{calls_this_run:0,spent_today_usd:0,spent_month_usd:0,spent_this_run_usd:0},request:{model:'model-a',estimated_cost_usd:.1}}).allowed,true);

const s=usageSummary([{input_tokens:100,output_tokens:20,estimated_cost_usd:.02,actual_cost_usd:.02},{input_tokens:50,output_tokens:10,estimated_cost_usd:.01,actual_cost_usd:.01}]);
assert.equal(s.calls,2);assert.equal(s.input_tokens,150);assert.equal(s.actual_cost_usd,.03);

console.log(JSON.stringify({passed:true,checks:9},null,2));
