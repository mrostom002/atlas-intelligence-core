import { validatePersonaDecision } from '../ai/provider-contract.mjs';

const ACTIVE_ORDER=['CEO','CFO','CTO','CCO','COO','CIO'];
function uniq(items){return [...new Set(items.filter(Boolean))]}

export function integrateExecutiveDecision({caseDecision,personaViews=[],challengeViews=[]}={}){
  if(!caseDecision?.case_id) throw new Error('Case decision is required.');

  const views=personaViews
    .map(v=>validatePersonaDecision(v,v.persona_role))
    .sort((a,b)=>ACTIVE_ORDER.indexOf(a.persona_role)-ACTIVE_ORDER.indexOf(b.persona_role));
  const challengers=challengeViews.map(v=>validatePersonaDecision(v,v.persona_role));
  const allViews=[...views,...challengers];

  const hardStops=allViews.filter(v=>v.hard_stop.active || v.stance==='block');
  const materialDissent=allViews.flatMap(v=>v.dissent.filter(d=>d.severity==='material').map(d=>({from:v.persona_role,...d})));
  const conditions=uniq(allViews.flatMap(v=>v.conditions));

  let disposition='PROCEED';
  if(hardStops.length) disposition='HOLD';
  else if(conditions.length || views.some(v=>['challenge','conditional'].includes(v.stance))) disposition='PROCEED_WITH_CONDITIONS';

  return {
    integrator_version:'atlas-executive-integrator-v1',
    case_id:caseDecision.case_id,
    disposition,
    money:caseDecision.money,
    action_band:caseDecision.action_band,
    money_band:caseDecision.money_band,
    recommended_action:caseDecision.action,
    unresolved_conditions:conditions,
    hard_stops:hardStops.map(v=>({role:v.persona_role,domain:v.hard_stop.domain,reason:v.hard_stop.reason||v.position})),
    material_dissent:materialDissent,
    persona_positions:views.map(v=>({role:v.persona_role,stance:v.stance,position:v.position,confidence:v.confidence})),
    challenge_positions:challengers.map(v=>({role:v.persona_role,stance:v.stance,position:v.position,confidence:v.confidence})),
    human_approval_required:true,
    rule:'No majority vote. Executive or challenge-lens hard-stops can dominate the integrated recommendation.'
  };
}
