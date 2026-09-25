import assert from 'node:assert/strict';
import { runAutonomousReasoningCycle, selectAffectedCaseIds } from '../../engine/brain/autonomous-cycle.mjs';
import { selectChallengeLenses } from '../../engine/brain/reasoning-lenses.mjs';
import { PROVIDER, DATA_CLASS } from '../../engine/ai/routing-policy.mjs';

const baseCase={
  id:'case-a',
  title:'Public corridor signal',
  data_class:DATA_CLASS.PUBLIC,
  evidence_tier:3,
  commercial_state:'signal',
  rights_status:'clear',
  expected_gp:5000,
  recurring_gp:0,
  cash_need:0,
  time_to_cash_days:21,
  monetization_mechanism:'advisory fee',
  blockers:[{id:'b1',label:'Buyer confirmation',status:'open',priority:1,controllable:true,action:'Confirm buyer requirement'}],
  account_id:101,
  partner_id:202,
  strategic_value:'corridor option'
};

const previous=[{subject_type:'case',subject_key:'case-a',predicate:'buyer_intent',value:'unknown',evidence_tier:4}];
const current=[{subject_type:'case',subject_key:'case-a',predicate:'buyer_intent',value:'public_signal',evidence_tier:3}];

const affected=selectAffectedCaseIds({
  cases:[baseCase],
  delta:{meaningful_change_count:1,added:[],changed:[{after:current[0]}],stale:[]}
});
assert.deepEqual(affected,['case-a']);

const lenses=selectChallengeLenses(baseCase,{...baseCase,money_band:'NEXT',action_band:'NOW'},4);
assert.ok(lenses.includes('AUDITOR'));
assert.ok(lenses.includes('RED_TEAM'));
assert.ok(lenses.length<=4);

const inferPersona=async ({role,provider,model})=>({
  provider,model,latency_ms:5,usage:{input_tokens:10,output_tokens:5},
  decision:{
    persona_role:role,
    stance:role==='RED_TEAM'?'conditional':'support',
    position:role==='RED_TEAM'?'Proceed only if source support remains explicit':'Proceed within evidence boundary',
    why:['Structured evidence gate is preserved'],
    risks:role==='RED_TEAM'?['Signal may not equal buyer intent']:[],
    conditions:role==='RED_TEAM'?['Reconfirm buyer intent before commercial promotion']:[],
    confidence:'medium',
    dissent:[],
    hard_stop:{active:false,domain:null,reason:null}
  }
});

const publicRun=await runAutonomousReasoningCycle({
  previous_observations:previous,
  current_observations:current,
  cases:[baseCase],
  provider:PROVIDER.GEMINI_FREE,
  model:'gemini-3.8-flash',
  inferPersona,
  force:false,
  max_challenge_lenses:4,
  now:new Date('2026-09-25T18:00:00Z')
});
assert.equal(publicRun.brain_version,'brain-v0.2-autonomous-cycle');
assert.deepEqual(publicRun.trigger.affected_case_ids,['case-a']);
assert.equal(publicRun.cases[0].status,'reasoned_with_external_inference');
assert.equal(publicRun.cases[0].persona_views.length,6);
assert.ok(publicRun.cases[0].challenge_views.length>=2);
assert.equal(publicRun.cases[0].integrated_recommendation.disposition,'PROCEED_WITH_CONDITIONS');
assert.equal(publicRun.safeguards.commercial_truth_auto_upgrade,false);
assert.equal(publicRun.safeguards.external_action_auto_execute,false);

const privateCase={...baseCase,id:'case-private',data_class:DATA_CLASS.CONFIDENTIAL_COMMERCIAL};
const privateRun=await runAutonomousReasoningCycle({
  previous_observations:[],
  current_observations:[],
  cases:[privateCase],
  provider:PROVIDER.GEMINI_FREE,
  model:'gemini-3.8-flash',
  inferPersona,
  force:true,
  now:new Date('2026-09-25T18:00:00Z')
});
assert.equal(privateRun.cases[0].status,'reasoned_deterministically');
assert.equal(privateRun.cases[0].external_inference_allowed,false);
assert.equal(privateRun.cases[0].persona_views.length,0);
assert.equal(privateRun.cases[0].integrated_recommendation.source,'deterministic_brain');

console.log(JSON.stringify({
  passed:true,
  checks:15,
  public_external_reasoning:true,
  confidential_gemini_free_blocked:true,
  human_authority_preserved:true
},null,2));
