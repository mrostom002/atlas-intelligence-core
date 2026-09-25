import assert from 'node:assert/strict';
import { DATA_CLASS, PROVIDER, allowedProviders, preferredProvider, shouldFanOut, aiOutputEvidenceClass } from '../../engine/ai/routing-policy.mjs';

assert.equal(preferredProvider(DATA_CLASS.PUBLIC),PROVIDER.GEMINI_FREE);
assert.ok(allowedProviders(DATA_CLASS.PUBLIC).includes(PROVIDER.CLOUDFLARE));
assert.ok(!allowedProviders(DATA_CLASS.INTERNAL_SANITIZED).includes(PROVIDER.GEMINI_FREE));
assert.deepEqual(allowedProviders(DATA_CLASS.RESTRICTED_SECRET),[]);
assert.deepEqual(allowedProviders(DATA_CLASS.CONFIDENTIAL_COMMERCIAL,{rightsPermitAI:false}),[]);
assert.ok(allowedProviders(DATA_CLASS.CONFIDENTIAL_COMMERCIAL,{rightsPermitAI:true,googleCloudVerified:true}).includes(PROVIDER.GOOGLE_CLOUD));
assert.equal(shouldFanOut({dataClass:DATA_CLASS.PUBLIC,importance:'high',task:'osint'}),true);
assert.equal(shouldFanOut({dataClass:DATA_CLASS.CONFIDENTIAL_COMMERCIAL,importance:'high',task:'osint'}),false);
assert.equal(aiOutputEvidenceClass().evidence,false);
console.log(JSON.stringify({passed:true,checks:9,public_primary:PROVIDER.GEMINI_FREE},null,2));
