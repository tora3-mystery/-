const assert = require('node:assert/strict');
const L=require('./logic.js');
const arr=L.allArrangements();
assert.equal(arr.length,360,'6P4');
const counts={success:0,small:0,bus:0,sealed:0};
const causes={};
for(const order of arr){const r=L.classify(order);assert.ok(counts.hasOwnProperty(r.world),`unknown ${r.world} ${order}`);assert.equal(typeof r.text,'string');assert.ok(r.text.length>20);assert.equal(r.trace.length,4);counts[r.world]++;causes[r.cause]=(causes[r.cause]||0)+1;}
assert.equal(counts.success,1,'single winning ordering');
assert.deepEqual(L.classify(L.CORRECT).world,'success');
assert.equal(L.classify(L.INITIAL).world,'bus');
assert.equal(L.classify(['D','A','B','C']).world,'bus'); // invalid opening doesn't happen; old line later closes
assert.equal(L.classify(['A','D','B','C']).world,'sealed');
assert.equal(L.classify(['A','B','D','C']).world,'sealed');
assert.equal(L.classify(['E','B','F','C']).world,'small');
assert.equal(L.classify(['A','B','C','E']).world,'bus');
assert.equal(L.classify(['A','B','C','D','E']).world,'pending');
assert.equal(L.classify(['A','A','C','D']).world,'pending');
console.log(JSON.stringify({total:arr.length,counts,causes,passed:true},null,2));
