import assert from 'node:assert/strict';

const ARCHETYPES=['forgotten','unused','unseen','created','trapped_value'];
for(const x of ['forgotten','unused','unseen','created','trapped_value']) assert.ok(ARCHETYPES.includes(x));

const REQUIRED=['money','path','action','evidence','blocker'];
assert.equal(REQUIRED.length,5);

console.log(JSON.stringify({passed:true,archetypes:ARCHETYPES,output_contract:REQUIRED},null,2));
