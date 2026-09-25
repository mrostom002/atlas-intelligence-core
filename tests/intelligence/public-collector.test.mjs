import assert from 'node:assert/strict';
import { validatePublicItem, observationCandidate, shouldPromote } from '../../engine/intelligence/public-collector.mjs';

const item=validatePublicItem({
  url:'https://example.com/news?id=1&utm_source=test#x',
  title:'Public announcement',
  source_snapshot:'Company announced a new data-center site.',
  data_class:'public'
});
assert.ok(item.canonical_url.includes('id=1'));
assert.ok(!item.canonical_url.includes('utm_source'));
assert.equal(item.public_data,true);
assert.equal(item.content_hash.length,64);

assert.throws(()=>validatePublicItem({url:'file:///secret',data_class:'public'}));
assert.throws(()=>validatePublicItem({url:'https://example.com',data_class:'confidential'}));

const obs=observationCandidate({
 item_id:'x',predicate:'announced',relevance_score:80,source_authority_tier:2,
 topics:['datacenter','bogus']
});
assert.deepEqual(obs.topics,['datacenter']);
assert.equal(shouldPromote(obs).eligible,true);
assert.equal(shouldPromote(obs).automatic,false);
assert.equal(shouldPromote({...obs,relevance_score:40}).eligible,false);

console.log(JSON.stringify({passed:true,checks:10},null,2));
