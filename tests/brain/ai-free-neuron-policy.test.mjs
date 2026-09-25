import assert from 'node:assert/strict';
import { canRunInference } from '../../engine/ai/usage-policy.mjs';

const free={
  enabled:true,
  provider:'cloudflare-workers-ai',
  allowed_models:['m'],
  billing_mode:'free_neuron_only',
  daily_neuron_budget:1000,
  max_neurons_per_run:300,
  max_calls_per_run:6,
  daily_budget_usd:0,
  monthly_budget_usd:0,
  max_cost_per_run_usd:0
};

assert.equal(canRunInference({policy:free,usage:{calls_this_run:0,neurons_today:100,neurons_this_run:0},request:{model:'m',estimated_neurons:35}}).allowed,true);
assert.equal(canRunInference({policy:free,usage:{calls_this_run:0,neurons_today:1000,neurons_this_run:0},request:{model:'m',estimated_neurons:35}}).reason,'daily_neuron_budget_exhausted');
assert.equal(canRunInference({policy:free,usage:{calls_this_run:0,neurons_today:100,neurons_this_run:280},request:{model:'m',estimated_neurons:35}}).reason,'run_neuron_limit');
assert.equal(canRunInference({policy:free,usage:{calls_this_run:0,neurons_today:100,neurons_this_run:0},request:{model:'m'}}).reason,'unknown_neuron_cost');

console.log(JSON.stringify({passed:true,checks:4},null,2));
