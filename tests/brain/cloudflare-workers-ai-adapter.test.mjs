import assert from 'node:assert/strict';
import { buildWorkersAIRequest, sanitizeCaseForSandbox, CLOUDFLARE_SANDBOX_MODEL } from '../../engine/ai/providers/cloudflare-workers-ai.mjs';

const clean=sanitizeCaseForSandbox({
  case_id:'x',
  title:'Case X',
  evidence_tier:2,
  money_statement:'Unpriced',
  raw_email_body:'SECRET',
  personal_note:'PRIVATE',
  blockers:['Need quote']
});
assert.equal(clean.case_id,'x');
assert.equal(clean.raw_email_body,undefined);
assert.equal(clean.personal_note,undefined);

const req=buildWorkersAIRequest({messages:[{role:'user',content:'test'}]});
assert.equal(req.model,CLOUDFLARE_SANDBOX_MODEL);
assert.equal(req.options.gateway.id,'atlas-brain');
assert.equal(req.input.reasoning.effort,'medium');

console.log(JSON.stringify({passed:true,checks:5,model:CLOUDFLARE_SANDBOX_MODEL},null,2));
