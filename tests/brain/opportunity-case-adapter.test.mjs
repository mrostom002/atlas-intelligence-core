import assert from 'node:assert/strict';
import { opportunityRadarRowToBrainCase, opportunityRadarRowsToBrainCases } from '../../engine/brain/opportunity-case-adapter.mjs';
import { DATA_CLASS } from '../../engine/ai/routing-policy.mjs';

const unpricedRow={
  opportunity_key:'connectbase-federated-seller',
  title:'Federated seller',
  account_ids:['4657'],
  corridor_names:['Egypt-MENA'],
  money_mechanisms:['transaction_fee','reseller_margin'],
  path_summary:'Prove one RFQ loop.',
  next_action:'Confirm federation economics.',
  blocker:'Rights not agreed.',
  evidence_state:'public_corroborated',
  confidence:'high',
  controllability:'high',
  time_to_cash_band:'unknown',
  strategic_value:'very_high',
  financial_state:'early_pipeline',
  amount_value:null,
  amount_currency:null,
  amount_confidence:'unknown',
  money_state:'unknown',
  assumption_notes:['No attributable GP yet']
};
const unpriced=opportunityRadarRowToBrainCase(unpricedRow);
assert.equal(unpriced.data_class,DATA_CLASS.CONFIDENTIAL_COMMERCIAL);
assert.equal(unpriced.evidence_tier,3);
assert.equal(unpriced.commercial_state,'pipeline');
assert.equal(unpriced.expected_gp,0);
assert.equal(unpriced.account_id,4657);
assert.match(unpriced.money_statement,/amount not yet evidenced/i);

const captureRow={
  opportunity_key:'example-capture',
  title:'Example',
  account_ids:['10','20'],
  money_mechanisms:['commission'],
  evidence_state:'private_evidence',
  financial_state:'qualified_pipeline',
  amount_value:12000,
  amount_currency:'USD',
  amount_basis:'Atlas commission / gross profit',
  amount_confidence:'verified',
  money_state:'commission',
  time_to_cash_band:'8-30d',
  controllability:'high'
};
const capture=opportunityRadarRowToBrainCase(captureRow);
assert.equal(capture.evidence_tier,2);
assert.equal(capture.commercial_state,'qualified');
assert.equal(capture.expected_gp,12000);
assert.equal(capture.time_to_cash_days,30);
assert.equal(capture.source_metadata.amount_used_as_expected_gp,true);

const revenueAmountNotGp=opportunityRadarRowToBrainCase({
  opportunity_key:'customer-contract-value',
  evidence_state:'private_evidence',
  financial_state:'contracted_receivable',
  amount_value:500000,
  amount_currency:'USD',
  amount_basis:'customer contract value',
  money_state:'contract_value'
});
assert.equal(revenueAmountNotGp.expected_gp,0);

const batch=opportunityRadarRowsToBrainCases([captureRow,unpricedRow]);
assert.equal(batch.length,2);
assert.equal(batch[0].id,'example-capture');
assert.equal(batch[1].id,'connectbase-federated-seller');

console.log(JSON.stringify({
  passed:true,
  checks:12,
  conservative_amount_mapping:true,
  private_default:true
},null,2));
