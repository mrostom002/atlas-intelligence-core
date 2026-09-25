import assert from 'node:assert/strict';
import {
  buildGeminiPublicOsintRequest,
  assertGeminiFreePublicOnly,
  assertPublicWebUrl,
  atlasPublicObservationSchema,
  GEMINI_PUBLIC_OSINT_MODEL,
  GEMINI_INTERACTIONS_ENDPOINT
} from '../../engine/ai/providers/gemini-public-osint.mjs';

assert.equal(assertGeminiFreePublicOnly({data_class:'public'}),true);
assert.throws(()=>assertGeminiFreePublicOnly({data_class:'confidential_commercial'}));
assert.throws(()=>assertGeminiFreePublicOnly({data_class:'public',contains_private_material:true}));

assert.equal(assertPublicWebUrl('https://example.com/a'),'https://example.com/a');
assert.throws(()=>assertPublicWebUrl('file:///secret'));
assert.throws(()=>assertPublicWebUrl('http://localhost:8787/x'));
assert.throws(()=>assertPublicWebUrl('http://127.0.0.1/x'));
assert.throws(()=>assertPublicWebUrl('http://10.1.2.3/x'));
assert.throws(()=>assertPublicWebUrl('http://192.168.1.2/x'));

const schema=atlasPublicObservationSchema();
const req=buildGeminiPublicOsintRequest({
  urls:['https://example.com/a','https://example.com/b'],
  instruction:'Extract public infrastructure observations.',
  schema
});
assert.equal(req.model,GEMINI_PUBLIC_OSINT_MODEL);
assert.equal(req.endpoint,GEMINI_INTERACTIONS_ENDPOINT);
assert.equal(req.body.model,GEMINI_PUBLIC_OSINT_MODEL);
assert.equal(req.body.store,false);
assert.equal(req.body.tools[0].type,'url_context');
assert.equal(req.body.response_format.mime_type,'application/json');
assert.deepEqual(req.body.response_format.schema,schema);
assert.ok(req.body.input.includes('untrusted DATA'));
assert.ok(req.body.input.includes('https://example.com/a'));
assert.throws(()=>buildGeminiPublicOsintRequest({urls:Array(21).fill('https://example.com'),instruction:'x',schema}));

console.log(JSON.stringify({passed:true,checks:19,model:GEMINI_PUBLIC_OSINT_MODEL,api:'interactions'},null,2));
