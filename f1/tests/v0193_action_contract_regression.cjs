/* F1 v0.19.3: all 50 real selectable policies, DOM-model test. */
'use strict';
const fs=require('node:fs'),path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const photo=fs.readFileSync(path.join(__dirname,'..','store_scene_v018.js'),'utf8');
const script=html.match(/<script>\s*(\(\(\)=>[\s\S]*?)<\/script>/)?.[1];
if(!script)throw Error('Game JS not found');
const injected=script.replace(/\}\)\(\);\s*$/, "window.__POLICIES__=options.map(x=>({...x}));})();");
if(injected===script)throw Error('Test-only action instrumentation failed');
function el(){
 const c=new Set(['hidden']);
 return {children:[],textContent:'',innerHTML:'',className:'',style:{},
 classList:{contains:x=>c.has(x),add:(...v)=>v.forEach(x=>c.add(x)),remove:(...v)=>v.forEach(x=>c.delete(x)),toggle:(x,on)=>on?c.add(x):c.delete(x)},
 append(...v){this.children.push(...v)},replaceChildren(...v){this.children=v},setAttribute(){},getAttribute(){return null},focus(){}};
}
function boot(){
 const nodes=new Map(),memory=new Map(),win={};
 const doc={body:el(),createElement:el,getElementById:id=>{if(!nodes.has(id))nodes.set(id,el());return nodes.get(id)}};
 new Function('window','module',photo)(win,{exports:{}});
 new Function('document','window','localStorage','scrollTo','confirm',injected)(
 doc,win,{getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,v)},()=>{},()=>true);
 return {api:win.__F1_DEBUG__,policies:win.__POLICIES__,get:doc.getElementById};
}
let checks=0;
function ok(test,reason){checks++;if(!test)throw Error('Action contract '+checks+': '+reason)}
const app=boot();app.api.restart();
const policies=app.policies,all=policies.map(p=>p.id);
ok(policies.length===50,'Exactly 50 implemented policies');
ok(html.includes('class="practice-end-banner"')&&html.includes('1日に調べられる下線は3箇所まで'),'Day 0 priority instruction');
ok(app.get('meters').children[1].innerHTML.includes('通路混雑'),'Aisle crowding');
ok(app.get('moneyDetail').textContent.includes('4項目の不満度は各0〜5'),'Dissatisfaction versus letters');
ok(html.includes("'/10　不満度 '"),'Sales report separates attraction and dissatisfaction');
ok(policies.find(p=>p.id==='display').desc.includes('通路混雑そのものは変わらない'),'Sign action explains correct effect');
for(const id of ['complaintHide','stockCover'])ok(policies.find(p=>p.id===id).desc.includes('帳票上'),'Gray reporting clarified '+id);
ok(html.includes('明日も新たなご意見が届き'),'Idle may still worsen naturally');
const clamp=x=>Math.max(0,Math.min(5,x));
for(const p of policies){
 const x=boot(),day=Math.max(p.min||1,Math.min(4,p.max||7)),counts={};
 if(['audit','removeShrine'].includes(p.id)){counts.inspectBack=1;counts.productCheck=1}
 if(p.v15Family){
  const families={queue:['register','staff'],aisle:['lane','floorcheck'],stock:['receive','forecast'],noise:['quiet','vibration']};
  families[p.v15Family].forEach(id=>counts[id]=1);
  if(p.tier===2)counts[({queue:'queueLane',aisle:'aisleGuide',stock:'stockTeam',noise:'quietDesk'})[p.v15Family]]=1;
 }
 if(p.kind==='major')counts.register=1;
 const s=x.api.getState();
 x.api.setState({...s,day,vals:[2,2,2,2],attraction:9,days:Array.from({length:day-1},(_,i)=>({day:i+1,sales:65})),
 revenue:65*(day-1),jobs:[],last:null,actionCounts:counts,discoveredActions:all,
 odd:p.kind==='odd'?p.oddReq:0,complaintTickets:null});
 ok(x.api.availableIds().includes(p.id),'Can unlock '+p.id);
 const before=x.api.getState();
 x.api.play(p.id);
 ok(x.api.getState().vals.join(',')===before.vals.join(','),'No premature effect '+p.id);
 x.api.advance();
 const after=x.api.getState(),target=p.delta.map((v,i)=>clamp(before.vals[i]+v)-before.vals[i]);
 ok(JSON.stringify(after.openingReport?.effect)===JSON.stringify(target),'Four-category effect '+p.id);
 const attraction=Math.max(0,Math.min(10,before.attraction+(p.attractionOnCompletion||0)))-before.attraction;
 ok(after.openingReport?.attraction===attraction,'Attraction effect '+p.id);
}
console.log('PASS F1 v0193 policy audit '+checks+' assertions (50 policies)');
