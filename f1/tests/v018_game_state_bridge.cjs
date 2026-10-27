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
ok(applied.file==='main-base-orderly.webp','Store panorama stays fixed after the installation');
ok(applied.fixturesReportedSeparately&&applied.fixtureReview.includes('additional-register'),
 'Permanent layout is reported separately from the whole-store image');
ok(!applied.requiresFixtureQA,'No overlay of extra equipment is attempted');
const early=lib.resolveGameState(state({
 day:2,visuals:[{id:'register',day:3}]
}));
ok(early.file==='main-base-orderly.webp','Future visual job is not treated as completed');
const problem=lib.resolveGameState(state({
 day:4,vals:[4,3,0,0],visuals:[{id:'register',day:2}],
 actionCounts:{register:1}
}));
ok(problem.file==='main-checkout-aisle-severe.webp','Worst current problem takes priority over past installation');
ok(!problem.requiresFixtureQA,'Current-state photo never attempts structural compositing');
ok(problem.fixturesReportedSeparately&&problem.fixtureReview.includes('additional-register'),'Register remains in separate operational history');

const multiple=lib.resolveGameState(state({
 day:6,vals:[4,3,2,0],visuals:[
 {id:'register',day:2},{id:'pickup',day:3},{id:'self',day:5}
 ]}));
ok(!multiple.requiresFixtureQA&&multiple.fixturesReportedSeparately&&multiple.fixtureReview.length===3,
 'Several lasting measures are tracked separately and never composited onto panoramas');
ok(lib.resolveGameState(state({day:7,odd:3}))===null,'Masked DAY 7 retains original ordinary photo');
ok(lib.resolveGameState(state({day:8,day8Active:true}))===null,'DAY 8 retains extraordinary photo');
ok(lib.resolveGameState(state({day:5,ending:'odd_day8',finish:true}))===null,
 'Odd ending retains original art');
ok(lib.resolveGameState(state({day:4,appliedToday:[{kind:'odd',id:'audit'}]}))===null,
 'Rear shrine visit uses original photo');
ok(lib.resolveGameState(state({day:7,odd:0,finish:true,ending:'normal_success'}))===null,
 'Normal success retains original ending photo');
ok(lib.resolveGameState(state({day:7,odd:0,finish:true,ending:'normal_strain'}))===null,
 'Normal decline retains original ending photo');
let counted=0;
for(let q=0;q<6;q++)for(let a=0;a<6;a++)for(let st=0;st<6;st++)for(let n=0;n<6;n++)for(let attraction=0;attraction<=10;attraction++){
 const p=lib.resolveGameState(state({day:4,vals:[q,a,st,n],attraction,
  actionCounts:{register:1},
  visuals:[{id:'register',day:3}]
 }));
 ok(lib.FILES.includes(p.file),'State must have a valid planned filename');
 ok(p.derivedFrom==='current-complaint-state','Panorama depends on current complaints, not fixture history');
 ok(!p.requiresFixtureQA&&p.fixtureReview.includes('additional-register'),
 'Persistent register belongs to separate operational indicators, not scene overlay');
 counted++;
}
ok(counted===14256,'All daily 4-axis × attraction combinations checked');
const report={day:2,odd:0,finish:false,appliedToday:[{id:'register'}]};
ok(lib.transitionPhotoForGameState(report)?.file==='main-improved-register-added.webp',
 'Register result photo is one-time in the morning report');
ok(lib.transitionPhotoForGameState({...report,appliedToday:[]})===null,
 'Register result photo does not persist into later days');
ok(lib.transitionPhotoForGameState({...report,odd:2})===null,
 'Odd route does not show ordinary installation report');
ok(lib.operationalIndicators(state({day:3,vals:[1,2,3,4],
 visuals:[{id:'register',day:2}]})).registerInstalled,
 'Reported register installation persists');
ok(!lib.operationalIndicators(state({day:1,visuals:[{id:'register',day:2}]})).registerInstalled,
 'Not-yet-completed register installation is not reported');
ok(lib.P3_FILES.length===23&&lib.PRODUCTION_FILES.length===29,
 'P3 must make 23 photos rather than historical 28');
console.log('PASS F1 v018 game-state bridge '+checks+' checks / '+counted+' state combinations');
