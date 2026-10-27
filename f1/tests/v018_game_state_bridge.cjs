/* F1 v0.18 pre-integration contract: completed actions, special routes,
   fixed-camera QA flags and staged asset readiness. No images required.
   node f1/tests/v018_game_state_bridge.cjs
*/
'use strict';
const assert=require('node:assert/strict'),path=require('node:path');
const lib=require(path.join(__dirname,'..','store_scene_v018.js'));
let checks=0;
const ok=(v,msg)=>{checks++;assert(v,msg);};
const state=(extra={})=>({
 day:1,vals:[0,0,0,0],attraction:7,visuals:[],actionCounts:{},
 appliedToday:[],odd:0,day8Active:false,finish:false,ending:null,
 ...extra
});
ok(lib.P1_FILES.length===3,'Exactly three P1 candidates');
ok(lib.P1_FILES.every(x=>lib.FILES.includes(x)),'P1 names belong to the full asset manifest');
const empty=lib.assetCoverage([],'P1');
ok(!empty.ready&&empty.missing.length===3,'Before Work delivery all P1 images remain missing');
ok(lib.assetCoverage(lib.P1_FILES,'P1').ready,'All three P1 filenames supplied');
ok(!lib.assetCoverage(lib.P1_FILES,'ALL').ready,'Three P1 images do not count as all remaining images');
ok(lib.assetCoverage(lib.FILES,'ALL').ready,'All 34 filenames supplied');
assert.throws(()=>lib.assetCoverage([],'none'));checks++;

const pending=lib.resolveGameState(state({actionCounts:{register:1}}));
ok(pending.file==='main-base-orderly.webp','An action selected today cannot visually finish today');
ok(!pending.requiresFixtureQA,'A pending action has not yet changed permanent equipment');

const applied=lib.resolveGameState(state({
 day:2,actionCounts:{register:1},visuals:[{id:'register',day:2}]
}));
ok(applied.file==='main-improved-register-added.webp','Applied register installation enables the correct reference');
ok(applied.fixtureReview.length===0,'The dedicated installed-register image requires no additional register overlay');
const early=lib.resolveGameState(state({
 day:2,visuals:[{id:'register',day:3}]
}));
ok(early.file==='main-base-orderly.webp','Future visual job is not treated as completed');
const problem=lib.resolveGameState(state({
 day:4,vals:[4,3,0,0],visuals:[{id:'register',day:2}],
 actionCounts:{register:1}
}));
ok(problem.file==='main-checkout-aisle-severe.webp','Worst current problem takes priority over past installation');
ok(problem.requiresFixtureQA,'History conflict explicitly flagged for compositing/QA');
ok(problem.fixtureReview.includes('additional-register'),'Register fixture needs validation across state pictures');

const multiple=lib.resolveGameState(state({
 day:6,vals:[4,3,2,0],visuals:[
 {id:'register',day:2},{id:'pickup',day:3},{id:'self',day:5}
 ]}));
ok(multiple.requiresFixtureQA&&multiple.fixtureReview.length===3,
 'Multiple structural measures are all captured for quality review');
ok(lib.resolveGameState(state({day:7,odd:3}))===null,'Masked DAY 7 retains original ordinary photo');
ok(lib.resolveGameState(state({day:8,day8Active:true}))===null,'DAY 8 retains extraordinary photo');
ok(lib.resolveGameState(state({day:5,ending:'odd_day8',finish:true}))===null,
 'Odd ending retains original art');
ok(lib.resolveGameState(state({day:4,appliedToday:[{kind:'odd',id:'audit'}]}))===null,
 'Rear shrine visit uses original photo');
ok(lib.resolveGameState(state({day:7,odd:0,finish:true,ending:'normal_success'})).file==='main-outcome-success.webp',
 'Normal success ending photo');
ok(lib.resolveGameState(state({day:7,odd:0,finish:true,ending:'normal_strain'})).file==='main-outcome-decline.webp',
 'Normal decline ending photo');
let counted=0;
for(let q=0;q<6;q++)for(let a=0;a<6;a++)for(let st=0;st<6;st++)for(let n=0;n<6;n++)for(let attraction=0;attraction<=10;attraction++){
 const p=lib.resolveGameState(state({day:4,vals:[q,a,st,n],attraction,
  actionCounts:{register:1},
  visuals:[{id:'register',day:3}]
 }));
 ok(lib.FILES.includes(p.file),'State must have a valid planned filename');
 ok(p.derivedFrom==='applied-visual-history','Only applied-state bridge is used');
 ok(!p.requiresFixtureQA||p.fixtureReview.includes('additional-register'),
 'Structural conflict must remain explicitly marked');
 counted++;
}
ok(counted===14256,'All daily 4-axis × attraction combinations checked');
console.log('PASS F1 v018 game-state bridge '+checks+' checks / '+counted+' state combinations');
