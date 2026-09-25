import { DATA_CLASS } from '../ai/routing-policy.mjs';

function s(v){return String(v??'').trim()}
function n(v,f=null){if(v===null||v===undefined||v==='')return f;const x=Number(v);return Number.isFinite(x)?x:f}
function arr(v){return Array.isArray(v)?v:[]}

const EVIDENCE_TIER=Object.freeze({
  private_evidence:2,
  public_corroborated:3,
  qualified:3,
  hypothesis:4,
  assumption:4,
  unknown:5
});

const TTC_DAYS=Object.freeze({
  '0-7d':7,
  '8-30d':30,
  '31-90d':90,
  '90+d':120,
  unknown:9999
});

function commercialState(financialState){
  const x=s(financialState).toLowerCase();
  if(['actual','collected'].includes(x))return 'collected';
  if(['contracted_receivable','contracted'].includes(x))return 'contracted';
  if(['invoiced'].includes(x))return 'invoiced';
  if(['qualified_pipeline','qualified'].includes(x))return 'qualified';
  if(['early_pipeline','pipeline'].includes(x))return 'pipeline';
  if(['forecast'].includes(x))return 'forecast';
  if(['upside'].includes(x))return 'hypothesis';
  return 'signal';
}

function amountLooksLikeAtlasCapture(row={}){
  const basis=s(row.amount_basis).toLowerCase();
  const state=s(row.money_state).toLowerCase();
  if(!Number.isFinite(Number(row.amount_value)))return false;
  return /gross.?profit|\bgp\b|margin|commission|success fee|advisory fee|implementation fee|atlas capture/.test(basis) ||
    ['gross_margin','commission','fee','atlas_capture','net_margin'].includes(state);
}

function moneyStatement(row={}){
  const amount=n(row.amount_value,null);
  const currency=s(row.amount_currency)||'USD';
  const state=s(row.financial_state)||'unpriced';
  if(amount!==null)return `${currency} ${amount.toLocaleString('en-US')} · ${state.replaceAll('_',' ')} · basis: ${s(row.amount_basis)||'not stated'}`;
  return `${state.replaceAll('_',' ')} · amount not yet evidenced`;
}

export function opportunityRadarRowToBrainCase(row={}){
  const key=s(row.opportunity_key);
  if(!key)throw new Error('opportunity_key is required');
  const evidenceState=s(row.evidence_state).toLowerCase()||'unknown';
  const amountIsCapture=amountLooksLikeAtlasCapture(row);
  const evidenceTier=EVIDENCE_TIER[evidenceState]??5;
  const accounts=arr(row.account_ids).map(String).filter(Boolean);

  return {
    id:key,
    title:s(row.title)||key,
    data_class:DATA_CLASS.CONFIDENTIAL_COMMERCIAL,
    account_id:accounts[0]?Number(accounts[0]):null,
    account_ids:accounts,
    corridor_names:arr(row.corridor_names),
    requirement_theme:s(row.requirement_theme)||null,
    monetization_mechanism:arr(row.money_mechanisms).join(', ')||null,
    expected_gp:amountIsCapture ? n(row.amount_value,0) : 0,
    recurring_gp:0,
    cash_need:0,
    currency:s(row.amount_currency)||'USD',
    money_statement:moneyStatement(row),
    evidence_tier:evidenceTier,
    commercial_state:commercialState(row.financial_state),
    rights_status:'unknown',
    control:s(row.controllability)||'unknown',
    time_to_cash_days:TTC_DAYS[s(row.time_to_cash_band).toLowerCase()]??9999,
    strategic_value:s(row.strategic_value)||null,
    data_gain:'high',
    next_action:s(row.next_action)||null,
    path:s(row.path_summary)?[{label:s(row.path_summary),status:'planned'}]:[],
    blockers:s(row.blocker)?[{
      id:'primary-blocker',
      label:s(row.blocker),
      status:'open',
      priority:1,
      controllable:s(row.controllability).toLowerCase()!=='low',
      action:s(row.next_action)||null,
      basis:'private.opportunity_radar current blocker'
    }]:[],
    unknowns:arr(row.assumption_notes).map(s).filter(Boolean),
    learning_target:'Update the recommendation when the next action produces new evidence or an observed outcome.',
    source_metadata:{
      source:'private.opportunity_radar',
      archetype:s(row.archetype)||null,
      evidence_state:evidenceState,
      confidence:s(row.confidence)||null,
      financial_state:s(row.financial_state)||null,
      money_state:s(row.money_state)||null,
      amount_confidence:s(row.amount_confidence)||null,
      amount_used_as_expected_gp:amountIsCapture
    }
  };
}

export function opportunityRadarRowsToBrainCases(rows=[]){
  return arr(rows).map(opportunityRadarRowToBrainCase);
}
