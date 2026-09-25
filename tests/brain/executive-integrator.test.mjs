import assert from 'node:assert/strict';
import { validatePersonaDecision, buildPersonaInferenceRequest } from '../../engine/ai/provider-contract.mjs';
import { integrateExecutiveDecision } from '../../engine/brain/executive-integrator.mjs';

const persona={role:'CFO',mandate:'Cash truth',primary_questions:['Can we fund it?']};
const req=buildPersonaInferenceRequest({persona,caseSnapshot:{case_id:'x'}});
assert.equal(req.persona.role,'CFO');
assert.equal(req.policy_context.human_authority,true);

const base={case_id:'x',money:{statement:'Qualified capture'},action_band:'NOW',money_band:'BUILD',action:{action:'Do the next thing'}};
const views=[
 {persona_role:'CEO',stance:'support',position:'Proceed',why:['Strategic fit'],risks:[],conditions:[],confidence:'high',dissent:[],hard_stop:{active:false}},
 {persona_role:'CFO',stance:'challenge',position:'Proceed only after payment protection',why:['Cash'],risks:['Working capital'],conditions:['Upfront payment'],confidence:'high',dissent:[{against_role:'CEO',issue:'Timing before cash protection',severity:'material'}],hard_stop:{active:false}},
 {persona_role:'CTO',stance:'support',position:'Technically sound',why:['Architecture'],risks:[],conditions:[],confidence:'medium',dissent:[],hard_stop:{active:false}},
 {persona_role:'CCO',stance:'support',position:'Customer path exists',why:['Demand'],risks:[],conditions:[],confidence:'medium',dissent:[],hard_stop:{active:false}},
 {persona_role:'COO',stance:'conditional',position:'Delivery requires named owner',why:['Execution'],risks:[],conditions:['Named delivery owner'],confidence:'high',dissent:[],hard_stop:{active:false}},
 {persona_role:'CIO',stance:'support',position:'Intelligence gain is valuable',why:['Data'],risks:[],conditions:[],confidence:'high',dissent:[],hard_stop:{active:false}}
];
views.forEach(v=>validatePersonaDecision(v,v.persona_role));
const integrated=integrateExecutiveDecision({caseDecision:base,personaViews:views});
assert.equal(integrated.disposition,'PROCEED_WITH_CONDITIONS');
assert.equal(integrated.material_dissent.length,1);
assert.ok(integrated.unresolved_conditions.includes('Upfront payment'));

const blocked=integrateExecutiveDecision({caseDecision:base,personaViews:views.map(v=>v.persona_role==='CIO'?{...v,stance:'block',hard_stop:{active:true,domain:'data_rights',reason:'No rights to use source'}}:v)});
assert.equal(blocked.disposition,'HOLD');
assert.equal(blocked.hard_stops[0].role,'CIO');

console.log(JSON.stringify({passed:true,checks:8},null,2));
