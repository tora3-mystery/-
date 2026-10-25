/* F1 v0.9 independent model self-test.
 * Run from repository root: node f1/tests/v09_model_selftest.js
 * Does not exercise f1/index.html, browser or the supernatural ending controller.
 */
'use strict';
const assert=require('node:assert/strict');
const {f1NewEconomy,f1AvailableActions,f1TakeAction,f1ProjectedSales}=require('../ECONOMY_ENGINE_V09.js');
const catalog=require('../ACTIONS_V09_CATALOG.json');
const {resolveF1Scene,F1_SCENE_FILES}=require('../SCENE_RESOLVER_V09.js');
assert.equal(catalog.actions.length,31);
assert.equal(catalog.actions.filter(x=>x.active).length,27);
assert.equal(F1_SCENE_FILES.length,15);
assert.equal(f1ProjectedSales(f1NewEconomy()),50);
const routes=[
  {name:'N1 good store',ids:['pickup','vibration','farmer','rest','display','floorcheck','rest'],ending:'normal_success',day:7},
  {name:'N2 loved but complained',ids:['pickup','vibration','farmer','rest','display','gourmet','discount'],ending:'normal_customer',day:7},
  {name:'N3 weak weekly sales',ids:['pickup','quiet','display','quiet','floorcheck','quiet','floorcheck'],ending:'normal_strain',day:7},
  {name:'Closed by promotions',ids:['discount','sampling','gourmet','sale'],ending:'normal_strain',reason:'閉店',day:4},
  {name:'Manager removed',ids:['quiet','lane','early','limit','early'],ending:'normal_strain',reason:'店長交代',day:5}
];
for(const row of routes){
 let s=f1NewEconomy();
 for(const id of row.ids){
  const options=f1AvailableActions(s,catalog);
  assert.equal(options.length,6,row.name+': 6-choice menu');
  assert(options.some(x=>x.id===id),row.name+': '+id+' must be offered');
  const former=s.totalSales;
  s=f1TakeAction(s,catalog,id);
  assert.equal(s.totalSales-former,s.days.at(-1).sales,row.name+': sales accounting');
  assert(s.attraction>=0&&s.attraction<=10,row.name+': attraction bounds');
  assert(s.complaints.every(n=>Number.isInteger(n)&&n>=0&&n<=5),row.name+': complaint bounds');
 }
 assert.equal(s.ending,row.ending,row.name+': ending');
 assert.equal(s.days.length,row.day,row.name+': ending day');
 if(row.reason)assert.equal(s.endingReason,row.reason,row.name+': ending reason');
}
const sceneCases=[
  [{day:1,attraction:7,complaintsByCategory:[2,1,1,1],gameStarted:false},'store-normal.jpg'],
  [{day:3,attraction:7,complaintsByCategory:[3,1,1,0]},'store-queue.jpg'],
  [{day:3,attraction:7,complaintsByCategory:[1,3,1,0]},'store-aisle.jpg'],
  [{day:3,attraction:7,complaintsByCategory:[0,0,4,0]},'store-stock.jpg'],
  [{day:3,attraction:7,complaintsByCategory:[0,0,0,4]},'store-noise.jpg'],
  [{day:4,attraction:9,complaintsByCategory:[0,1,0,0]},'store-thriving.jpg'],
  [{day:4,attraction:10,complaintsByCategory:[3,2,2,1]},'store-popular-chaos.jpg'],
  [{day:4,attraction:2,complaintsByCategory:[0,0,1,0]},'store-underused.jpg'],
  [{day:4,attraction:2,complaintsByCategory:[2,2,1,0]},'store-declining.jpg'],
  [{day:4,attraction:7,complaintsByCategory:[1,1,1,1],inConstructionResult:true},'store-construction.jpg'],
  [{day:4,attraction:7,complaintsByCategory:[2,1,1,1],anomalyLevel:1},'store-odd1.jpg'],
  [{day:5,attraction:7,complaintsByCategory:[2,1,1,1],anomalyLevel:2},'store-odd2.jpg'],
  [{day:6,attraction:7,complaintsByCategory:[2,1,1,1],anomalyLevel:3},'store-odd3.jpg'],
  [{day:7,attraction:7,complaintsByCategory:[2,1,1,1],anomalyLevel:3,glitchSeen:true,sundayRevealed:false},'store-normal.jpg'],
  [{day:8,attraction:7,complaintsByCategory:[2,1,1,1],anomalyLevel:3},'store-human-day.jpg'],
  [{day:7,attraction:10,complaintsByCategory:[4,2,1,0],ending:'normal_customer'},'store-popular-chaos.jpg'],
  [{day:4,attraction:1,complaintsByCategory:[3,1,1,1],ending:'normal_strain',endingReason:'店長交代'},'store-declining.jpg'],
  [{day:4,attraction:9,complaintsByCategory:[4,2,1,0],ending:'normal_strain',endingReason:'閉店'},'store-closed.jpg'],
  [{day:7,attraction:8,complaintsByCategory:[0,1,0,0],ending:'odd_hidden'},'store-normal.jpg'],
];
for(const [input,expected] of sceneCases){
 assert.equal(resolveF1Scene(input),expected,JSON.stringify(input));
}
const seen=new Set(sceneCases.map(([input])=>resolveF1Scene(input)));
assert.equal(seen.size,15,'all 15 scenes reachable');
console.log('PASS F1 v0.9 economy: '+routes.length+' named routes; '+sceneCases.length+' scene fixtures; 15 scene states.');
console.log('NOT COVERED: existing f1/index.html, image files, browser QA, full X1-X4 supernatural controller and deployment.');
