#!/usr/bin/env node
'use strict';
// V1 Work asset integration: deterministic logic / simulated DOM only.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const script=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert(script,'Game script must be present');
const original=JSON.parse(fs.readFileSync(path.join(root,'assets/asset-manifest.json'),'utf8'));
const db=JSON.parse(fs.readFileSync(path.join(root,'evolution-db.json'),'utf8'));
const groups=['coastal','stage1-small','final-refinement'].map(folder=>
 JSON.parse(fs.readFileSync(path.join(root,'assets/proposals',folder,'asset-list.json'),'utf8')));
function harness(storage={}){
 const nodes={},get=id=>nodes[id]||(nodes[id]={innerHTML:'',textContent:'',style:{},value:'',
  classList:{add(){},remove(){}},addEventListener(){},querySelectorAll(){return []},setAttribute(){},scrollIntoView(){}});
 const win={},env={document:{getElementById:get,querySelectorAll(){return []}},window:win,
  localStorage:{getItem:k=>storage[k]||null,setItem:(k,v)=>storage[k]=v},
  location:{search:'?qa=1',href:'https://test.invalid/v1/'},navigator:{},console,Date,Math,confirm:()=>true};
 vm.runInNewContext(script,env,{filename:'index.html',timeout:30000});
 return {qa:win.__VILLAGE_QA__,get,storage}
}
const {qa:q,get}=harness();
assert.equal(q.evolutionRegister(db),true);
assert.equal(q.v1AcceptManifest(original),true,'Do not alter existing 145-asset manifest');
assert.equal(q.v1ExpectedAssets().size,145);
assert.equal(q.v1ExpectedProposalAssets().size,44);
q.generate(2601);
let f=q.getState().facilities[0];
assert(q.v1FacilityId(f).startsWith('facility:'),'Absent proposals should use legacy images');
const invalid=JSON.parse(JSON.stringify(groups));
invalid[0].files.pop();
assert.equal(q.v1AcceptProposals(invalid),false,'Reject incomplete 43-asset files');
assert.equal(q.proposalStatus().count,0);
assert.equal(q.v1AcceptProposals(groups),true);
assert.equal(q.proposalStatus().count,44);
const coastal=['shrine','scenic','inn','lodge'],modes=['low','high','reform'];
let coastalCases=0,smallCases=0,finalCases=0,historicalCases=0;
for(const kind of coastal)for(const stage of [2,3])for(const mode of modes){
 q.generate(250);const state=q.getState();state.terrain='coast';
 f=state.facilities[0];Object.assign(f,{kind,stage,open:true,coastalStage:stage,coastalMode:mode,
   coastalHistory:{[stage]:{mode}},stageFocus:'sea',lastFactKey:3});
 const expected='proposal:coastal:'+kind+':'+mode+':'+stage;
 assert.equal(q.v1FacilityId(f),expected,'Sea branch art mismatch');
 assert.equal(q.v1FacilityStageId(f,stage,kind==='scenic'?'conservation':'retreat'),expected);
 coastalCases++;
 if(stage===3){
  f.coastalHistory[2]={mode:'low'};
  assert.equal(q.v1FacilityStageId(f,2,'retreat'),'proposal:coastal:'+kind+':low:2','Historical image lost');
  historicalCases++;
 }
}
for(const kind of db.facilityKinds){
 q.generate(250);f=q.getState().facilities[0];Object.assign(f,{kind,stage:1,smallStage1:true});
 assert.equal(q.v1FacilityId(f),'proposal:small:'+kind+':1');
 f.smallStage1=false;
 assert.equal(q.v1FacilityId(f),'facility:'+kind+':base:1');
 smallCases++;
}
for(const [kind,route] of [['scenic','conservation'],['scenic','park'],['robot','research'],['robot','coexist']]){
 q.generate(250);f=q.getState().facilities[0];Object.assign(f,{kind,stage:3,visualRoute:route,
   coastalHistory:{},coastalStage:null,stageFocus:'tech',lastFactKey:0,firstDirection:null,secondDirection:null});
 assert.equal(q.v1FacilityId(f),'proposal:final:'+kind+':'+route+':3');
 finalCases++;
}
let villages=0,reviews=0;
for(let seed=1;seed<=120;seed++){
 q.generate(Math.imul(seed,2654435761)>>>0);
 for(let month=0;month<12;month++){
  const state=q.getState(),id=state.candidates[(seed+month)%state.candidates.length];
  const ff=state.facilities.find(x=>x.id===id),fact=q.factsFor(ff),ix=(seed+month)%fact.length;
  q.post(id,ix,[1,2,3,4,5][(seed+month)%5]);
  assert.equal(q.groundQA().length,0);
  assert.equal(q.getState().month,month+1);
  assert.equal(q.proposalStatus().count,44);
  reviews++;
 }
 assert.equal(q.getState().completed,true);villages++;
}
// Saved new play state can be migrated and preserves additional stage-one preference.
{
 const store={};const h=harness(store),local=h.qa;
 local.evolutionRegister(db);local.v1AcceptManifest(original);local.v1AcceptProposals(groups);
 local.generate(1124);
 const state=local.getState(),facility=state.facilities[0];
 facility.stage=1;facility.smallStage1=true;
 store['village-review-prototype-v010']=JSON.stringify(state);
 const h2=harness(store),opened=h2.qa;
 opened.evolutionRegister(db);opened.v1AcceptManifest(original);opened.v1AcceptProposals(groups);
 const after=opened.getState().facilities.find(x=>x.id===facility.id);
 assert.equal(opened.v1FacilityId(after),'proposal:small:'+facility.kind+':1','Small stage art not restored');
}
assert.equal(coastalCases,24);assert.equal(smallCases,16);assert.equal(finalCases,4);
console.log(JSON.stringify({status:'PASS',registered:44,coastalCases,smallCases,finalCases,historicalCases,
 villages,reviews,legacyAssets:original.items.length,manifestFallback:'PASS',saveRestore:'PASS'},null,2));
