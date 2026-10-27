#!/usr/bin/env node
'use strict';
/* Run: node proposals/village-review/tests/evolution_graph_audit.cjs */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const db=JSON.parse(fs.readFileSync(path.join(root,'evolution-db.json'),'utf8'));
const targets=JSON.parse(fs.readFileSync(path.join(root,'ASSET_TARGETS.json'),'utf8'));
const script=html.match(/<script>([\s\S]*?)<\/script>/);
assert(script,'Main JavaScript not found');
const assetIds=new Set(targets.items.map(i=>i.id));
const stage2=new Map(db.stage2.map(r=>[r.id,r]));
assert.equal(stage2.size,96);assert.equal(db.stage3.length,576);
assert.equal(new Set(db.stage3.map(x=>x.kind+':'+x.name)).size,576,'Duplicated final names');
const store={};
function createHarness(){
 const nodes={},el=id=>nodes[id]||(nodes[id]={innerHTML:'',textContent:'',value:'',style:{},
  classList:{add(){},remove(){}},addEventListener(){},querySelectorAll(){return []},setAttribute(){},scrollIntoView(){}});
 const ctx={document:{getElementById:el,querySelectorAll(){return []}},
  localStorage:{getItem:k=>store[k]||null,setItem:(k,v)=>{store[k]=v}},
  location:{search:'?qa=1',href:'https://test.invalid/v1/'},navigator:{},window:{},confirm:()=>true,console,Date,Math};
 vm.runInNewContext(script[1],ctx,{timeout:30000,filename:'index.html'});
 return ctx.window.__VILLAGE_QA__
}
const qa=createHarness();
assert.equal(qa.evolutionRegister(db),true,'Evolution DB rejected');
assert.equal(qa.v1AcceptManifest(targets),true,'Asset inventory rejected');
const stageSeeds={};
for(let n=1;n<=1000&&(stageSeeds.plain===undefined||stageSeeds.island===undefined);n++){
 const seed=Math.imul(n,2654435761)>>>0;qa.generate(seed);const state=qa.getState();
 if(state.terrain==='plain'&&stageSeeds.plain===undefined)stageSeeds.plain=seed;
 if(state.terrain==='island'&&state.facilities.some(f=>f.kind==='harbor')&&stageSeeds.island===undefined)stageSeeds.island=seed
}
assert.notEqual(stageSeeds.plain,undefined);assert.notEqual(stageSeeds.island,undefined);
let traversals=0;const seenImages=new Set();
for(const final of db.stage3){
 const first=stage2.get(final.from),second=stage2.get(final.second);
 assert(first&&second,final.id+' missing predecessor');
 qa.generate(final.kind==='harbor'?stageSeeds.island:stageSeeds.plain);
 const state=qa.getState();
 const fac=final.kind==='harbor'?state.facilities.find(f=>f.kind==='harbor'):state.facilities.find(f=>f.kind!=='harbor');
 assert(fac,final.id+' missing suitable land facility');
 Object.assign(fac,{kind:final.kind,name:'テスト施設',stage:1,progress:4.85,funds:92,pressure:0,
  routeScores:{},directionScores:{},secondDirectionScores:{},firstDirection:null,secondDirection:null,visualRoute:null,
  aspectLevels:{[first.facet]:first.target==='more'?75:25}});
 state.candidates=[fac.id];
 qa.post(fac.id,first.facet,5);
 let after=qa.getState().facilities.find(f=>f.id===fac.id);
 assert.equal(after.stage,2,final.id+' stage two not reached');
 assert.equal(after.firstDirection,first.id,final.id+' wrong first direction');
 assert.equal(qa.evolutionRecord(after)?.id,first.id,final.id+' wrong intermediate state');
 after.progress=6.4;after.funds=92;after.pressure=0;
 after.aspectLevels[second.facet]=second.target==='more'?75:25;
 qa.getState().candidates=[after.id];
 qa.post(after.id,second.facet,5);
 after=qa.getState().facilities.find(f=>f.id===fac.id);
 assert.equal(after.stage,3,final.id+' stage three not reached');
 assert.equal(after.secondDirection,second.id,final.id+' wrong next direction');
 assert.equal(qa.evolutionRecord(after)?.id,final.id,final.id+' terminal mismatch');
 assert(qa.groundQA().length===0,final.id+' malformed map');
 const image=qa.v1FacilityId(after);
 assert(assetIds.has(image),final.id+' lacks an existing image mapping');
 seenImages.add(image);traversals++;
}
let gentle=0;
for(const kind of db.facilityKinds)for(let facet=0;facet<3;facet++)for(const high of [false,true])for(const rating of [2,4]){
 qa.generate(kind==='harbor'?stageSeeds.island:stageSeeds.plain);const st=qa.getState();
 const f=kind==='harbor'?st.facilities.find(f=>f.kind==='harbor'):st.facilities.find(f=>f.kind!=='harbor');
 f.kind=kind;f.aspectLevels={[facet]:high?75:25};f.funds=80;f.pressure=0;st.candidates=[f.id];
 for(let n=0;n<3;n++){
  const before=qa.aspectLevel(f,facet);qa.post(f.id,facet,rating);
  const after=qa.aspectLevel(f,facet);
  if(rating===2)assert(high?after>=55:after<=50,'Star 2 must converge, not oscillate');
  else assert(high?after>=before:after<=before,'Star 4 must preserve selected state');
  if(n<2)qa.getState().candidates=[f.id]
 }
 gentle++;
}
const report={status:'PASS',stage2:stage2.size,finalRecords:db.stage3.length,terminalPathsVerified:traversals,
 star2And4Cases:gentle,uniqueImagesReused:seenImages.size,saveCompatibility:'covered by qa_bridge.cjs',
 validation:'Deterministic state/DOM simulation; not physical browser test'};
console.log(JSON.stringify(report,null,2));
