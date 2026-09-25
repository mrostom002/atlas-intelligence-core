import assert from 'node:assert/strict';
import fs from 'node:fs';

const source=fs.readFileSync('supabase/functions/atlas-public-intelligence-gemini/index.ts','utf8');

assert.ok(source.includes('ATLAS_PUBLIC_RUNTIME_TOKEN'));
assert.ok(source.includes('x-atlas-runtime-token'));
assert.ok(source.includes('crypto.subtle.digest("SHA-256"'));
assert.ok(source.includes('await secureEqual(configuredRuntimeToken, presentedRuntimeToken)'));
assert.ok(source.includes('caller.auth.getUser()'));
assert.ok(source.includes('.from("allowed_users")'));
assert.ok(source.includes('input?.data_class !== "public"'));
assert.ok(source.includes('input?.contains_private_material === true'));
assert.ok(source.includes('promotion: "human_review_required"'));
assert.ok(source.includes('upstream_store: false'));
assert.ok(!source.includes('ATLAS_PUBLIC_RUNTIME_TOKEN ='));

console.log(JSON.stringify({
  passed:true,
  checks:11,
  auth_modes:['runtime-secret','supabase-user-jwt'],
  data_boundary:'public-only'
},null,2));
