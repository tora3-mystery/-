#!/usr/bin/env node
'use strict';
// Self-contained V1 game-engine + asset-handshake regression.
// Run: node proposals/village-review/tests/qa_bridge.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const targets = JSON.parse(fs.readFileSync(path.join(root, 'ASSET_TARGETS.json'), 'utf8'));
const script = html.match(/<script>([\s\S]*?)<\/script>/);
assert(script, 'Cannot locate the V1 game script');
assert.equal(targets.items.length, 145, 'Expected 145 art targets');
function createHarness(sharedStore) {
  const els = {};
  const get = id => els[id] || (els[id] = {
    innerHTML:'', textContent:'',value:'',style:{},scrollTop:0,
    classList:{add(){},remove(){}},addEventListener(){},
    querySelectorAll(){return []},setAttribute(){},scrollIntoView(){}
  });
  const store = sharedStore || {};
  const context = {
    document:{getElementById:get,querySelectorAll(){return []}},
    localStorage:{getItem:key=>store[key] || null,setItem:(key,value)=>{store[key]=value}},
    window:{},navigator:{},location:{search:'?qa=1',href:'https://example.invalid/v1/'},
    confirm:()=>true,console,Date,Math
  };
  vm.runInNewContext(script[1],context,{filename:'v1/index.html',timeout:30000});
  const qa = context.window.__VILLAGE_QA__;
  assert(qa&&qa.generate&&qa.post, 'QA hooks not available');
  return {qa,get};
}
const {qa,get}=createHarness();
assert.equal(qa.artStatus().ready,false);
assert.equal((get('map').innerHTML.match(/data-v1src/g)||[]).length,0,'Assets requested without manifest');
assert.equal(qa.v1AcceptManifest({items:targets.items.slice(0,144)}),false,'Incomplete manifest accepted');
assert.equal(qa.v1AcceptManifest({items:targets.items}),true,'Valid manifest rejected');
assert.equal(qa.artStatus().size,145);
qa.generate(718);
assert.equal(qa.timeName(0),'2027年4月','Arrival must not be displayed in March');
const facilityForArt=qa.getState().facilities[0];
const stageOneResult=qa.v1ResultVisual({kind:'big',facilityId:facilityForArt.id,stage:1,icon:'🏠'});
assert(stageOneResult.includes('facilities/'+facilityForArt.kind+'/base-0.webp'),'Stage 0 image missing in evolution');
assert(stageOneResult.includes('facilities/'+facilityForArt.kind+'/base-1.webp'),'Stage 1 image missing in evolution');
facilityForArt.stage=3;
const historicStageOne=qa.v1ResultVisual({kind:'big',facilityId:facilityForArt.id,stage:1,icon:'🏠'});
assert(historicStageOne.includes('facilities/'+facilityForArt.kind+'/base-1.webp'),'Historical event artwork must remain tied to recorded stage');
const targetIds = new Set(targets.items.map(x=>x.id));
const terrain = {},endings={},statistics={villages:0,reviews:0,artIds:0};
const strategies = [
  (_,seed)=>(seed%5)+1,
  ()=>5,
  ()=>1,
  ()=>3,
  (month)=>month%2===0?2:4
];
for(let seed=1;seed<=250;seed++){
  const strategy=strategies[seed%strategies.length];
  qa.generate(Math.imul(seed,2654435761)>>>0);
  let state=qa.getState();terrain[state.terrain]=(terrain[state.terrain]||0)+1;
  assert.equal(qa.groundQA().length,0,'Invalid initial terrain');
  assert(get('map').innerHTML.includes('v1Backdrop'),'Missing map background asset');
  for(let month=0;month<12;month++){
    state=qa.getState();
    const id=state.candidates[(seed+month)%state.candidates.length];
    const facility=state.facilities.find(x=>x.id===id);
    assert(facility&&facility.open,'Missing eligible target');
    const facts=qa.factsFor(facility);
    qa.post(id,month%facts.length,strategy(month,seed));
    state=qa.getState();
    assert.equal(state.month,month+1);
    const periodIndex=month+3;
    assert.equal(qa.timeName(month+1),(2027+Math.floor(periodIndex/12))+'年'+((periodIndex%12)+1)+'月','History month mismatch');
    assert.equal(qa.groundQA().length,0,'Invalid terrain after update');
    for(const building of state.facilities){
      const assetId=qa.v1FacilityId(building);
      assert(targetIds.has(assetId),'Unknown art '+assetId);
      statistics.artIds++;
    }
    statistics.reviews++;
  }
  assert(state.completed,'Village did not finish after twelve reviews');
  const ending=qa.annual().main.name;endings[ending]=(endings[ending]||0)+1;
  const report=qa.report();
  assert(report.includes('村民たちの本音'),'Missing resident voices from annual report');
  statistics.villages++;
}
assert.equal(Object.keys(terrain).length,5,'Not all terrain kinds were sampled');
// Save/reload regression: keep an in-progress 6-month game, then finish it.
const persisted={};
let trial=createHarness(persisted),tqa=trial.qa;
tqa.generate(112233);
for(let month=0;month<6;month++){
 const st=tqa.getState(),id=st.candidates[0],f=st.facilities.find(x=>x.id===id);
 tqa.post(id,month%tqa.factsFor(f).length,5);
}
assert.equal(tqa.getState().month,6);
trial=createHarness(persisted);tqa=trial.qa;
assert.equal(tqa.getState().month,6,'Reload lost progress');
assert.equal(tqa.getState().reviewHistory.length,6,'Reload lost reviews');
for(let month=6;month<12;month++){
 const st=tqa.getState(),id=st.candidates[0],f=st.facilities.find(x=>x.id===id);
 tqa.post(id,month%tqa.factsFor(f).length,4);
}
assert(tqa.getState().completed,'Reloaded run must finish');
trial=createHarness(persisted);tqa=trial.qa;
assert(tqa.getState().completed&&tqa.getState().annualDue,'Final review must be preserved on reload');
assert(trial.get('modal').innerHTML.includes('口コミが反映'),'Final review modal must reopen');
console.log(JSON.stringify({status:'PASS',terrain,statistics,endings,saveResume:'PASS',arrivalDate:'PASS',stageArt:'PASS'},null,2));
