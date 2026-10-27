/* F1 v0.18 pure main-photo mapping; no browser or images required.
   node f1/tests/v018_scene_selection.cjs
   A manifest-only dry run: it does NOT assert that images exist yet.
*/
'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const lib=require(path.join(__dirname,'..','store_scene_v018.js'));
let checks=0;
const test=(value,why)=>{checks++;assert(value,why)};
test(lib.FILES.length===34,'34 planned full-store photos');
test(new Set(lib.FILES).size===34,'No duplicate filenames');
test(lib.FILES.every(x=>/^main-[a-z-]+\.webp$/.test(x)),'Filename conventions');

let states=0;
const hit=new Set();
for(let q=0;q<6;q++)for(let a=0;a<6;a++)for(let st=0;st<6;st++)for(let n=0;n<6;n++)for(let attraction=0;attraction<=10;attraction++){
 const state={complaints:[q,a,st,n],attraction,day:2};
 const x=lib.resolve(state),y=lib.resolve({...state});
 test(Boolean(x&&lib.FILES.includes(x.file)),'Manifest image for '+JSON.stringify(state));
 test(x.file===y.file,'Deterministic rendering at '+JSON.stringify(state));
 hit.add(x.file);states++;
}
test(states===14256,'Exhaustive complaint × attraction states');
const resolve=(v,attr=7,extra={})=>lib.resolve({complaints:v,attraction:attr,day:2,...extra})?.file;
test(resolve([0,0,0,0],7)==='main-base-orderly.webp','Low issue, orderly floor');
test(resolve([0,0,0,0],9)==='main-base-busy.webp','High footfall');
test(resolve([0,0,0,0],2)==='main-base-underused.webp','Low footfall');
test(resolve([2,1,0,0])==='main-checkout-mild.webp','Mild checkout problem');
test(resolve([3,1,0,0])==='main-checkout-moderate.webp','Moderate checkout');
test(resolve([4,1,0,0])==='main-checkout-severe.webp','Severe checkout');
test(resolve([4,3,1,0])==='main-checkout-aisle-moderate.webp','Two-issue moderate');
test(resolve([4,4,1,0])==='main-checkout-aisle-severe.webp','Two severe issues');
test(resolve([3,4,1,0])==='main-checkout-aisle-moderate.webp','Pair order stable');
test(resolve([0,0,0,0],7,{completedActions:['register']})==='main-improved-register-added.webp','Visible checkout layout improvement');
test(resolve([0,0,0,0],7,{completedActions:['weekendStore']})==='main-improved-renovated.webp','Major renovation visible');
test(resolve([5,5,0,0],7,{completedActions:['weekendStore']})==='main-checkout-aisle-severe.webp','Unresolved severe issue cannot be covered by renovation');
test(resolve([2,4,0,0],7,{completedActions:['register']})==='main-aisle-severe.webp','Current issue more important than prior action');
test(resolve([0,0,0,0],7,{ending:'normal_success'})==='main-outcome-success.webp','Weekly outcome');
test(resolve([0,0,0,0],7,{ending:'normal_strain'})==='main-outcome-decline.webp','Decline outcome');
test(lib.resolve({complaints:[0,0,0,0],attraction:5,day:8})===null,'Dedicated DAY 8 image retained');
test(lib.resolve({complaints:[0,0,0,0],attraction:5,day:7,ending:'odd_day8'})===null,'Uncanny route not overridden');

for(const [arr,attraction] of [[[6,0,0,0],5],[[1,-1,0,0],5],[[1,1.2,0,0],5],[[0,0,0],5],[[0,0,0,0],11]]){
 assert.throws(()=>lib.resolve({complaints:arr,attraction}),Error);checks++;
}
console.log(JSON.stringify({status:'PASS',checks,states,uniqueActiveFiles:hit.size,allPlannedFiles:lib.FILES.length},null,2));
