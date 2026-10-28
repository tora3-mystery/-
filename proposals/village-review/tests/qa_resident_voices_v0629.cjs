#!/usr/bin/env node
'use strict';
// Resident voices / optional portrait roster regression. Mock DOM + deterministic game logic.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),html=fs.readFileSync(path.join(root,'index.html'),'utf8'),
 script=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert(script,'Game script missing');
const db=JSON.parse(fs.readFileSync(path.join(root,'evolution-db.json'),'utf8'));
const manifest=JSON.parse(fs.readFileSync(path.join(root,'assets/asset-manifest.json'),'utf8'));
const nodes={},get=id=>nodes[id]||(nodes[id]={innerHTML:'',textContent:'',value:'',style:{},
 classList:{add(){},remove(){}},querySelectorAll(){return []},addEventListener(){},scrollIntoView(){},setAttribute(){}});
const win={},ctx={window:win,document:{getElementById:get,querySelectorAll(){return []}},
 localStorage:{getItem(){return null},setItem(){}},location:{search:'?qa=1',href:'https://example.invalid/'},
 navigator:{},confirm:()=>true,console,Date,Math};
vm.runInNewContext(script,ctx,{timeout:30000,filename:'index.html'});
const q=win.__VILLAGE_QA__;
assert.equal(q.evolutionRegister(db),true);
assert.equal(q.v1AcceptManifest(manifest),true);
assert.equal(q.residentStatus().count,0,'New portraits must remain optional');
const ids=['resident-young-woman','resident-young-man','resident-middle-woman','resident-middle-man',
 'resident-senior-woman','resident-senior-man','resident-student','resident-worker',
 'resident-carpenter','resident-festival','resident-walker','resident-shopper'];
const fake={count:12,files:ids.map(id=>({id,png:id+'.png',webp:id+'.webp',width:256,height:256,
 pngSha256:'a'.repeat(64),webpSha256:'b'.repeat(64),pngBytes:12000,webpBytes:4500}))};
const partial=JSON.parse(JSON.stringify(fake));partial.files.pop();
assert.equal(q.v1AcceptResidentAssets(partial),false,'Missing portrait must fail closed');
assert.equal(q.residentStatus().count,0);
const before=q.v1PersonId('村民：「夕飯の帰りに寄りました。」');
assert.equal(before,'person:villager','Without Work files show the old safe face');
const allVoices=new Set(),allSpeakers=new Set(),allNewIds=new Set(),perMonth=[];
for(let i=1;i<=120;i++){
 q.generate((i*147123+i)>>>0);
 for(let month=0;month<12;month++){
  const state=q.getState(),rng=state.rng,voices=q.voices();
  assert.equal(JSON.stringify(voices),JSON.stringify(q.voices()),'Voices must not reroll on redraw');
  assert.equal(state.rng,rng,'Voice generation must not change gameplay RNG');
  assert.equal(voices.length,2,'Two residents per month');
  assert.notEqual(voices[0],voices[1],'Resident voices must be distinct');
  for(const v of voices){
   assert.match(v,/^[^：「]+：「[^」]+」$/);
   allVoices.add(v);allSpeakers.add(v.split('：「')[0]);
   const face=q.v1PersonId(v);
   assert(face.startsWith('person:'),'Portrait ID format');
  }
  perMonth.push(voices);
  const next=state.candidates[(i+month)%state.candidates.length];
  const f=state.facilities.find(x=>x.id===next);
  const facts=q.factsFor(f),idx=(i+month)%facts.length;
  const station=q.voice(f),snapshot=q.voice(f);
  assert.equal(station,snapshot,'Facility voice must not reroll on redraw');
  assert.match(station,/^[^：「]+：「[^」]+」$/);
  q.post(next,idx,[1,2,3,4,5][(i+month)%5]);
 }
 assert.equal(q.getState().completed,true,'Every village must reach year end');
}
assert(allVoices.size>220,'Village commentary should exhibit meaningful variety');
assert(allSpeakers.size>=25,'Speaker roles should be diverse');
assert.equal(q.v1AcceptResidentAssets(fake),true,'Full 12 portrait manifest should load');
for(let seed=1;seed<=600;seed++){
 q.generate(seed*231);
 const v=q.voices();
 for(const phrase of [...v,'散歩中の人：「天気がいいですね。」','年配の住民：「昔から住んでいます。」',
   '地元の学生：「学校帰りです。」','村の大工：「手入れをします。」','祭りの世話役：「片づけを手伝います。」',
   '働く住民：「朝から仕事です。」','買い物帰りの住民：「お店に寄ります。」']){
  const selected=q.v1PersonId(phrase,seed%2);
  if(selected.startsWith('person:resident-'))allNewIds.add(selected.slice('person:'.length));
 }
}
assert.equal(allNewIds.size,12,'All 12 new portrait IDs should be reachable');
console.log(JSON.stringify({status:'PASS',villages:120,months:1440,villageVoiceVariations:allVoices.size,
 speakerLabels:allSpeakers.size,optionalPortraits:12,reachedPortraitIds:[...allNewIds].sort(),
 incompleteManifestRejected:true,stableAcrossRedraw:true,gameRngUnchanged:true},null,2));
