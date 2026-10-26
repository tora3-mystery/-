/* F1 v0.14 runtime regression: run using node f1/tests/v014_runtime_regression.js */
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
function test(html){
 const code=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
 if(!code)throw Error('Game script missing');
 new Function(code);
 let checks=0;
 const assert=(v,m)=>{checks++;if(!v)throw Error('F1 v0.14 check '+checks+': '+m)};
 function app(db=new Map()){
  const ids=new Map();
  function node(){
   const flags=new Set(['hidden']),attributes={};
   return {className:'',innerHTML:'',textContent:'',src:'',style:{},value:'',children:[],
    classList:{contains:k=>flags.has(k),add:(...a)=>a.forEach(x=>flags.add(x)),remove:(...a)=>a.forEach(x=>flags.delete(x)),toggle:(k,f)=>f?flags.add(k):flags.delete(k)},
    append(...a){this.children.push(...a)},replaceChildren(...a){this.children=a},
    getAttribute:k=>attributes[k]??null,setAttribute:(k,v)=>attributes[k]=v,focus(){}};
  }
  const document={body:node(),createElement:node,getElementById:id=>{if(!ids.has(id))ids.set(id,node());return ids.get(id)}};
  const localStorage={getItem:k=>db.get(k)??null,setItem:(k,v)=>db.set(k,v)},window={};
  new Function('document','localStorage','window','scrollTo','confirm',code)(document,localStorage,window,()=>{},()=>true);
  return {d:window.__F1_DEBUG__,get:document.getElementById,db};
 }
 function step(ctx,id){
  const {d,get}=ctx,before=d.getState();
  const legal=d.availableIds();
  assert(legal.includes(id),'Action not offered: DAY '+before.day+' '+id);
  assert(legal.length<=7&&get('actions').children.length===legal.length,'Seven-card maximum');
  for(const item of get('actions').children)assert((item.innerHTML.match(/class="effect-chip/g)||[]).length===5,'Metric chips');
  d.play(id);const chosen=d.getState(),sale=Math.max(0,30+10*before.attraction-10*before.vals.reduce((a,b)=>a+b,0));
  assert(chosen.days.at(-1).sales===sale&&chosen.revenue===before.revenue+sale,'Revenue calculation');
  assert(chosen.attraction===before.attraction&&chosen.vals.join(',')===before.vals.join(','),'Next-day policy');
  d.advance();const after=d.getState();
  assert(after.vals.every(x=>x>=0&&x<=5)&&after.attraction<=10,'Stat limits');
  assert(after.complaintTickets.filter(x=>x.status==='open').length===after.vals.reduce((a,b)=>a+b,0),'Official complaint ledger');
  if(!get('dayTransition').classList.contains('hidden')){
   assert(get('transitionDecision').textContent.includes(chosen.last.name),'Decision shown next morning');
   d.closeTransition();
  }
  return after;
 }
 function route(path){
  const c=app();c.d.restart();
  for(const id of path){if(c.d.getState().finish)break;step(c,id)}
  return c;
 }
 assert(!html.includes('id="anomalyComplaints"'),'Highlighting fake complaints must be removed');
 assert(!html.includes('記録 A：差出人不明のご意見'),'Spurious clue must be removed');
 const clean=route(['pickup','vibration','floorcheck','delivery','quiet','display','quiet']);
 assert(clean.d.getState().ending!=='normal_success','Routine-only route should be hard');
 const gray=route(['pickup','complaintHide','delivery','vibration','floorcheck','quiet','stockCover']);
 assert(gray.d.getState().ending==='normal_success','Gray-assisted win must be reachable');
 assert(gray.d.getState().revenue===570&&gray.d.getState().vals.reduce((a,b)=>a+b,0)===2,'Calibrated gray victory');
 assert(gray.get('ending').children.some(x=>x.className==='ending-media'),'Newspaper plus forum');
 const two=app();two.d.restart();step(two,'pickup');step(two,'complaintHide');
 assert(two.d.availableIds().includes('audit'),'Eerie choice and gray should coexist');
 assert(two.d.availableIds().some(x=>['dateShift','stockCover'].includes(x)),'Gray action not displaced');
 const idle=app();idle.d.restart();
 for(let i=0;i<7&&!idle.d.getState().finish;i++)step(idle,'idle');
 assert(idle.d.getState().ending==='normal_strain','Doing nothing no longer wins');
 const zero=app();zero.d.restart();zero.d.setState({day:3,attraction:0,vals:[5,5,5,5],days:[{day:1,sales:50},{day:2,sales:10}],revenue:60});
 step(zero,'idle');
 assert(zero.d.getState().endingReason==='店長解任・営業停止','Zero-day firing');
 const eerie=app();eerie.d.restart();
 const eeriePath=['pickup','vibration','audit','camera0','open0','glitch6','idle'];
 for(const id of eeriePath){
  const after=step(eerie,id),rows=eerie.get('oddEvidenceList').children;
  if(after.odd===2&&after.clues===0){
   assert(rows.length===1,'First clue is the CCTV footage, not missing feedback');
   rows[0].children[0].onclick();
  }
  if(after.odd===3&&after.clues===1){
   assert(rows.length===2,'Second clue is the shrine paper');
   rows[1].children[0].onclick();
  }
 }
 assert(eerie.d.getState().clues===2,'Exactly two clues required');
 assert(!eerie.get('finalChoice').classList.contains('hidden'),'Final eerie choice');
 assert(eerie.get('finalAnomalyComplaints').children.length===10,'Ten repetitive reviews');
 assert(eerie.get('finalAnomalyComplaints').children.every(x=>x.className==='complaint-ticket'),'Unusual reviews look exactly like normal cards');
 eerie.d.startInference();eerie.d.resolveInference('self','yesterday');
 assert(eerie.d.getState().ending==='odd_hidden','Hidden ending via two clues');
 const standard=app();standard.d.restart();
 for(const id of eeriePath)step(standard,id);
 standard.d.finalDecision('stop');
 assert(standard.d.getState().ending==='odd_stop','Stop ending');
 const extended=app();extended.d.restart();
 for(const id of eeriePath)step(extended,id);
 extended.d.finalDecision('day8');assert(extended.d.getState().day8Active,'Human day');
 extended.d.finishDay8('book');
 assert(extended.d.getState().ending==='odd_missing','Eerie continuation ending');
 const legacy=new Map(),old=app(legacy);old.d.restart();
 const previous=old.d.getState();previous.version=10;previous.clueViewed=[0,1,2];previous.clues=3;
 legacy.set('f1-v10',JSON.stringify(previous));
 const newer=app(legacy);
 assert(newer.d.getState().version===11&&newer.d.getState().clues===0,'Legacy A does not unlock hidden route');
 return {checks,grayRevenue:gray.d.getState().revenue,grayComplaints:2,cleanEnding:clean.d.getState().ending,hiddenEnding:eerie.d.getState().ending};
}
console.log('F1 PASS',JSON.stringify(test(html)));
