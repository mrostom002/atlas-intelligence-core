import test from 'node:test';
import assert from 'node:assert/strict';
import { buildCaseDecision, buildLearningRecord } from '../../engine/brain/brain-v0.mjs';

test('brain keeps synthetic pipeline separate from contracted revenue',()=>{
  const decision=buildCaseDecision({
    id:'synthetic-public-opportunity',
    title:'Synthetic public infrastructure opportunity',
    evidence_tier:3,
    commercial_state:'qualified_pipeline',
    monetization_mechanism:'orchestration fee',
    expected_gp:25000,
    recurring_gp:0,
    time_to_cash_days:45,
    cash_need:1000,
    data_gain:'medium',
    control:'partial',
    rights_status:'clear',
    blockers:[{
      id:'customer-confirmation',
      label:'Customer confirmation missing',
      status:'open',
      controllable:true,
      priority:1,
      action:'Obtain written customer confirmation.'
    }]
  });
  assert.equal(decision.money.claim.class,'qualified_capture');
  assert.equal(decision.money.forecast_eligible,false);
  assert.equal(decision.action.human_approval_required,true);
  assert.match(decision.action.action,/written customer confirmation/i);
});

test('learning records never auto-mutate commercial truth',()=>{
  const decision=buildCaseDecision({
    id:'synthetic-case',
    evidence_tier:4,
    commercial_state:'signal',
    monetization_mechanism:'future service'
  });
  const record=buildLearningRecord({decision,outcome:{type:'progressed',notes:'Synthetic test outcome'}});
  assert.equal(record.human_review_required,true);
  assert.equal(record.auto_mutation_allowed,false);
});
