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
  new Function('document','localStorage','window','scrollTo','confirm',code.replace('grayAuditSeed:Math.floor(Math.random()*4294967296)>>>0','grayAuditSeed:0'))(document,localStorage,window,()=>{},()=>true);
  return {d:window.__F1_DEBUG__,get:document.getElementById,db};
 }
 function step(ctx,id){
  const {d,get}=ctx,before=d.getState();
  const legal=d.availableIds();
  assert(legal.includes(id),'Action not offered: DAY '+before.day+' '+id);
  const cap=before.day===1?7:before.day<=3?9:before.day<=5?11:13;
  assert(legal.length<=cap&&get('actions').children.length===legal.length,'Stage-scaled card maximum');
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
 for(const id of ['pickup','vibration','audit','camera0','open0'])step(eerie,id);
 assert(eerie.d.getState().day===6&&eerie.d.getState().odd===3,'Ten-comment route reaches DAY 6');
 const six=eerie.get('complaintBoard').children;
 assert(six.length>=10,'Day 6 ten reviews');
 assert(six.slice(0,10).every(x=>x.className==='complaint-ticket'&&x.children[1]?.textContent.includes('レジのご案内が丁寧でした。ありがとうございました。')),'Ten identical regular review cards');
 assert(!eerie.d.availableIds().includes('glitch6'),'No artificial DAY 6 glitch-choice');
 step(eerie,'idle');
 assert(eerie.d.getState().day===7,'DAY 7 reached');
 assert(!eerie.get('complaintBoard').children.some(x=>x.children[1]?.textContent.includes('レジのご案内が丁寧でした。ありがとうございました。')),'DAY 7 returns to normal reviews');
 assert(!eerie.get('newNotice').textContent.includes('差出人不明'),'DAY 7 has no abnormal notice');
 step(eerie,'idle');
 assert(eerie.d.getState().day8Active&&eerie.d.getState().day===8,'DAY 8 auto-start');
 assert(eerie.get('day8Title').textContent==='DAY 08 / 07','Impossible DAY 8 counter');
 eerie.d.advanceDay8();
 assert(eerie.get('day8Feedback').children.length===10,'DAY 8 ten comments return');
 const replay=app(eerie.db);replay.d.resumeCurrent();
 assert(replay.d.getState().day8Stage===1&&replay.get('day8Feedback').children.length===10,'DAY 8 progress persists after reload');
 eerie.d.advanceDay8();
 assert(eerie.get('day8Title').textContent==='DAY 08 / 07 / 08','DAY 8 UI glitches');
 eerie.d.advanceDay8();
 assert(eerie.d.getState().ending==='odd_day8'&&eerie.d.getState().finish,'Scripted ending needs no inference');
 assert(!html.includes('id="inferWho"')&&!html.includes('id="checkCustomer"'),'No deduction controls');
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
 
 const tier=app();tier.d.restart();
 assert(tier.d.availableIds().length===7,'Day 1 retains six actions plus idle');
 assert(!tier.d.availableIds().includes('queueLane'),'Queue specialization initially locked');
 step(tier,'pickup');
 assert(tier.d.availableIds().includes('queueLane'),'Queue choice unlocks special branch');
 assert(!tier.d.availableIds().includes('queueReset'),'Tier 2 locked before day 4');
 step(tier,'queueLane');step(tier,'idle');
 assert(tier.d.getState().day===4&&tier.d.availableIds().includes('queueReset'),'Tier 2 unlocks after branch choice');
 const untouched=app();untouched.d.restart();untouched.d.setState({day:2,actionCounts:{quiet:1},last:null,needsAdvance:false});
 assert(untouched.d.availableIds().includes('quietDesk'),'Noise branch unlocks from noise action');
 assert(!untouched.d.availableIds().includes('queueLane'),'Queue branch remains locked without queue experience');
 const late=app();late.d.restart();late.d.setState({day:5,last:null,actionCounts:{},needsAdvance:false});
 assert(late.d.availableIds().includes('weekendStore'),'Major late store action available');
 assert(late.d.availableIds().includes('weekendInventory'),'Major late inventory action available');
 const chain=app();chain.d.restart();chain.d.setState({day:1,vals:[4,2,1,1],attraction:7,complaintTickets:null,needsAdvance:false,days:[]});
 step(chain,'idle');
 assert(chain.d.getState().cascadeToday===true,'High unresolved load triggers cascade');
 assert(chain.d.getState().vals[1]===4,'Queue complaint spills into aisle');
 assert(chain.d.getState().issueEvents.some(x=>x.actionId==='v15Cascade'),'Cascade is documented in complaint source');
 const stable=app();stable.d.restart();stable.d.setState({day:1,vals:[2,1,1,1],attraction:7,complaintTickets:null,needsAdvance:false,days:[]});
 step(stable,'idle');
 assert(stable.d.getState().cascadeToday===false,'Low unresolved load does not cascade');
 assert(stable.d.getState().vals[1]===2,'Only normal pressure when below threshold');
 const finalDay=app();finalDay.d.restart();finalDay.d.setState({day:6,odd:0,glitchSeen:false,last:null,actionCounts:{},needsAdvance:false});
 assert(finalDay.d.availableIds().length<=13&&finalDay.d.availableIds().length>=11,'Late choice list expands');
 const v15Raw=html.split('const V15_BRANCHES=')[1].split('.map(([id,name,v15Family,tier,delta,attractionOnCompletion,desc])')[0];
 const v15Actions=JSON.parse(v15Raw);
 assert(v15Actions.length===10,'Ten specialist and major actions remain');
 v15Actions.forEach(([id,name,family,tier,delta])=>{
  assert(delta.some(x=>x<0),'Upgrade '+id+' solves a complaint');
  assert(delta.some(x=>x>0),'Upgrade '+id+' also worsens another complaint');
  assert(delta.some(x=>x<=-3),'Upgrade '+id+' provides strong improvement');
 });
 assert(JSON.stringify(v15Actions.find(x=>x[0]==='queueReset')[4])==='[-4,2,0,2]','Queue overhaul raises aisle/noise trouble');
 assert(JSON.stringify(v15Actions.find(x=>x[0]==='stockReset')[4])==='[1,1,-4,2]','Stock overhaul raises other complaints');
  function auditScenario(id,detected){
  for(let seed=0;seed<300;seed++){
   const db=new Map(),c=app(db);c.d.restart();const s=c.d.getState();
   c.d.setState({...s,grayAuditSeed:seed,day:2,attraction:7,vals:id==='dateShift'?[0,0,4,0]:[2,1,1,1],days:[{day:1,sales:50}],revenue:50});
   if(!c.d.availableIds().includes(id))continue;
   c.d.play(id);const job=c.d.getState().jobs.find(j=>j.sourceAction===id);
   if(job&&job.detected===detected)return {db,c,job};
  }throw Error('Missing test seed '+id);
 }
 function settle(item){
  item.c.d.advance();item.c.d.closeTransition();item.c.d.play('idle');item.c.d.advance();item.c.d.closeTransition();return item.c.d.getState();
 }
 const exposed=auditScenario('complaintHide',true),hidden=auditScenario('complaintHide',false);
 assert(exposed.job.chance===30&&hidden.job.chance===30,'Concealment risk starts at 30 percent');
 assert(exposed.job.roll<30&&hidden.job.roll>=30,'Stored detection is based on roll');
 const resumed=app(exposed.db);resumed.d.resumeCurrent();
 assert(resumed.d.getState().jobs.find(j=>j.sourceAction==='complaintHide').detected,'Exposure survives reload');
 resumed.get('undo').onclick();resumed.d.play('complaintHide');
 assert(resumed.d.getState().jobs.find(j=>j.sourceAction==='complaintHide').roll===exposed.job.roll,'Undo and reselect cannot reroll');
 const exposedEnd=settle(exposed),hiddenEnd=settle(hidden);
 assert(exposedEnd.grayFines===20&&exposedEnd.grayStrikes===1,'Caught policy incurs twenty fine and warning');
 assert(exposedEnd.auditEvents.length===1&&exposedEnd.auditEvents[0].day===4,'Detection only triggers on scheduled day');
 assert(hiddenEnd.grayFines===0&&hiddenEnd.grayStrikes===0&&hiddenEnd.auditEvents.length===0,'Uncaught action retains no penalty');
 const severe=auditScenario('dateShift',true),fired=settle(severe);
 assert(severe.job.chance===45,'Food tampering discovery chance');
 assert(fired.finish&&fired.endingReason==='重大な不正発覚による解任','Severe forgery causes dismissal');
 assert(fired.grayFines===40&&fired.grayStrikes===2,'Severe forgery incurs forty fee and two points');
  const legacy=new Map(),old=app(legacy);old.d.restart();
 const previous=old.d.getState();previous.version=10;previous.clueViewed=[0,1,2];previous.clues=3;
 legacy.set('f1-v10',JSON.stringify(previous));
 const newer=app(legacy);
 assert(newer.d.getState().version===11&&newer.d.getState().clues===0,'Legacy A does not unlock hidden route');
 return {checks,grayRevenue:gray.d.getState().revenue,grayComplaints:gray.d.getState().vals.reduce((a,b)=>a+b,0),cleanRevenue:clean.d.getState().revenue,cleanEnding:clean.d.getState().ending,hiddenEnding:eerie.d.getState().ending};
}
console.log('F1 PASS',JSON.stringify(test(html)));
