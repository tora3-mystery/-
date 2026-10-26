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
 assert(clean.d.getState().ending==='normal_success'&&clean.d.getState().revenue===500,'A carefully planned clean route may just reach the success threshold');
 const gray=route(['pickup','complaintHide','delivery','vibration','floorcheck','quiet','stockCover']);
 assert(gray.d.getState().ending==='normal_success','Gray-assisted win must be reachable');
 assert(gray.d.getState().revenue===610&&gray.d.getState().vals.reduce((a,b)=>a+b,0)===3,'Calibrated gray victory');
 assert(gray.d.getState().revenue-clean.d.getState().revenue>=100,'Moral-gray advantage must be substantial');
 assert(gray.get('ending').children.some(x=>x.className==='ending-media'),'Newspaper plus forum');
 const lowComplaint=route(['pickup','vibration','floorcheck','display','forecast','floorcheck','quiet']);
 const highComplaint=route(['pickup','quiet','delivery','vibration','floorcheck','shrine','receive']);
 const lowState=lowComplaint.d.getState(),highState=highComplaint.d.getState();
 assert(lowState.revenue===490&&lowState.vals.reduce((a,b)=>a+b,0)===2,'Low complaint near-miss setup');
 assert(highState.revenue===490&&highState.vals.reduce((a,b)=>a+b,0)===4,'High complaint near-miss setup');
 assert(lowState.ending==='normal_customer'&&highState.ending==='normal_customer','Equal sales do not punish lower complaints');
 const endingHead=c=>c.get('ending').children[1].textContent;
 assert(endingHead(lowComplaint).includes('お客様の声は改善'),'Near-miss low-complaint title');
 assert(endingHead(highComplaint).includes('課題も残る'),'Near-miss high-complaint title');
 const headline=c=>c.get('ending').children[5].children[0].children[1].textContent;
 assert(headline(lowComplaint).includes('苦情減少'),'Near-miss low-complaint newspaper');
 assert(headline(highComplaint).includes('残る苦情'),'Near-miss high-complaint newspaper');
 function boundary(revenue,counts){
  const c=app();c.d.restart();
  const vals=counts===2?[1,1,0,0]:counts===4?[1,1,1,1]:[2,2,2,1];
  const today=Math.max(0,30+70-counts*10);
  c.d.setState({day:7,odd:0,attraction:7,vals,revenue:revenue-today,days:Array.from({length:6},(_,i)=>({day:i+1,sales:0})),jobs:[],used:[],actionCounts:{},complaintTickets:null,finish:false,ending:null,needsAdvance:false});
  assert(c.d.availableIds().includes('idle'),'Boundary route can finish');
  c.d.play('idle');c.d.advance();return c.d.getState().ending;
 }
 assert(boundary(479,2)==='normal_strain','479 with few complaints remains below near-miss threshold');
 assert(boundary(480,2)==='normal_customer','480 with few complaints receives near-miss ending');
 assert(boundary(499,2)==='normal_customer','499 with few complaints receives near-miss ending');
 assert(boundary(500,2)==='normal_success','500 with few complaints remains success');
 assert(boundary(480,4)==='normal_customer','480 with unresolved complaints stays customer ending');
 assert(boundary(500,4)==='normal_success','500 with four complaints remains success');
 assert(boundary(500,7)==='normal_customer','500 with seven complaints is not full success');
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

 const undoDb=new Map(),undoBefore=app(undoDb);
 undoBefore.d.restart();undoBefore.d.play('pickup');
 assert(undoBefore.d.getState().needsAdvance&&typeof undoBefore.d.getState().undoSnapshot==='string','Undo state saved during closing');
 const undoReloaded=app(undoDb);undoReloaded.d.resumeCurrent();
 assert(!undoReloaded.get('undo').classList.contains('hidden'),'Undo button available after reload');
 undoReloaded.get('undo').onclick();
 assert(undoReloaded.d.getState().day===1&&undoReloaded.d.getState().days.length===0&&undoReloaded.d.getState().revenue===0,'Undo restored original day after reload');
 assert(undoReloaded.d.getState().undoSnapshot===null,'Undo snapshot cleared after rollback');
 undoReloaded.d.play('pickup');undoReloaded.d.advance();
 assert(undoReloaded.d.getState().undoSnapshot===null,'Undo snapshot cleared after day advance');
 const oldInterruptedDb=new Map();const oldInterrupted={...undoBefore.d.getState(),undoSnapshot:null};
 oldInterruptedDb.set('f1-v10',JSON.stringify(oldInterrupted));
 const oldInterruptedApp=app(oldInterruptedDb);oldInterruptedApp.d.resumeCurrent();
 assert(oldInterruptedApp.get('undo').classList.contains('hidden'),'Old interrupted saves do not show broken undo');
 assert(gray.d.getState().jobs.every(x=>x.id!=='stockCover-risk'),'End-of-week gray backlash has been settled');
  const legacy=new Map(),old=app(legacy);old.d.restart();
 const previous=old.d.getState();previous.version=10;previous.clueViewed=[0,1,2];previous.clues=3;
 legacy.set('f1-v10',JSON.stringify(previous));
 const newer=app(legacy);
 assert(newer.d.getState().version===11&&newer.d.getState().clues===0,'Legacy A does not unlock hidden route');
 return {checks,grayRevenue:gray.d.getState().revenue,grayComplaints:gray.d.getState().vals.reduce((a,b)=>a+b,0),cleanRevenue:clean.d.getState().revenue,cleanEnding:clean.d.getState().ending,hiddenEnding:eerie.d.getState().ending};
}
console.log('F1 PASS',JSON.stringify(test(html)));
