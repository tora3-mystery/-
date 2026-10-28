/* F1 v0.19.6: confirmation, replay variability, and human-day finale. DOM mock, not physical browser. */
'use strict';
const fs=require('node:fs'),path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const photo=fs.readFileSync(path.join(__dirname,'..','store_scene_v018.js'),'utf8');
const js=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
if(!js)throw Error('Inline game script missing');
function el(){
 const c=new Set(['hidden']),attrs={};
 return {className:'',innerHTML:'',textContent:'',src:'',style:{},children:[],disabled:false,
  classList:{add:(...v)=>v.forEach(x=>c.add(x)),remove:(...v)=>v.forEach(x=>c.delete(x)),
   toggle:(x,on)=>on?c.add(x):c.delete(x),contains:x=>c.has(x)},
  append(...v){this.children.push(...v)},replaceChildren(...v){this.children=v},
  setAttribute:(k,v)=>attrs[k]=v,getAttribute:k=>attrs[k]??null,focus(){}};
}
function boot(saved=new Map()){
 const nodes=new Map(),window={};
 const document={body:el(),createElement:el,getElementById:id=>{if(!nodes.has(id))nodes.set(id,el());return nodes.get(id)}};
 const localStorage={getItem:k=>saved.get(k)??null,setItem:(k,v)=>saved.set(k,v)};
 new Function('window','module',photo)(window,{exports:{}});
 new Function('document','localStorage','window','scrollTo','confirm',js)(document,localStorage,window,()=>{},()=>true);
 return {api:window.__F1_DEBUG__,get:document.getElementById,db:saved};
}
let checks=0;
function ok(x,label){checks++;if(!x)throw Error('v0196 check '+checks+': '+label)}
const letter={id:'reviewA',metric:0,body:'昨日はレジに20分並びました。通路まで列が伸びていて、カートが通れませんでした。',
 customer:'reviewA',day:1,status:'open',replies:[]};
const start=boot();start.api.restart();start.api.setState({...start.api.getState(),complaintTickets:[letter]});
ok(start.api.focus('reviewA','レジに20分並びました'),'Tap a real complaint underline');
const card=[...start.get('actions').children,...start.get('moreActionsBody').children].find(x=>x.innerHTML.includes('予約受取窓口'));
ok(!!card,'Find a policy card by name');
const old=JSON.stringify(start.api.getState());
card.onclick();
ok(!start.get('policyConfirm').classList.contains('hidden'),'Preview opens');
ok(old===JSON.stringify(start.api.getState()),'Preview cannot commit a policy');
ok(start.get('policyConfirmImpacts').children.length===5,'Preview lists five metrics');
ok(start.get('policyConfirmImpacts').children[1].children[1].textContent.includes('2 → 1'),'Preview calculates real severity delta');
ok(start.get('policyConfirmForecast').textContent.includes('自然悪化'),'Forecast distinguishes uncontrollable changes');
start.get('policyConfirmNo').onclick();
ok(start.get('policyConfirm').classList.contains('hidden')&&old===JSON.stringify(start.api.getState()),'Cancel is reversible');
card.onclick();start.get('policyConfirmYes').onclick();
ok(start.api.getState().day===2&&start.api.getState().days.length===1,'Confirm advances exactly one day');
ok(!start.api.getState().needsAdvance&&start.get('overlay').classList.contains('hidden'),'No duplicate daily-report dialog');
ok(!start.get('dayTransition').classList.contains('hidden'),'Next morning result appears');
ok(start.get('transitionDecision').textContent.includes('予約受取窓口')&&!start.get('transitionDecision').textContent.includes('改善'),'Action name only in heading');
ok(start.get('transitionChanges').children.some(x=>x.textContent.includes('不満度')),'Per-indicator impact displayed');
ok(start.get('transitionChanges').children.every(x=>!x.textContent.includes('負担度')),'No old burden label');
const variants=new Set();let extraCount=0;
for(let seed=1;seed<=64;seed++){
 const x=boot();x.api.restart();
 x.api.setState({...x.api.getState(),complaintTickets:[letter],policySeed:seed,
  discoveredActions:[],randomBonusIds:[],randomBonusDays:[],focusHistory:[],focusKeys:[],focusDay:0});
 ok(x.api.focus('reviewA','レジに20分並びました'),'Seed '+seed+' discovers core policy');
 const state=x.api.getState(),bonus=(state.randomBonusIds||[]).join(',');
 variants.add(bonus);if(bonus)extraCount++;
 ok(['register','pickup'].every(id=>state.discoveredActions.includes(id))&&state.discoveredActions.length===2,'Exactly two matching policies, regardless of seed');
 const reload=boot(new Map([['f1-v10',JSON.stringify(state)]]));reload.api.resumeCurrent();
 ok(JSON.stringify(reload.api.getState().randomBonusIds)===JSON.stringify(state.randomBonusIds),'Save restores same seeded extra');
 reload.api.focus('reviewA','レジに20分並びました');
 ok(JSON.stringify(reload.api.getState().randomBonusIds)===JSON.stringify(state.randomBonusIds),'Repeating underline never re-rolls');
}
ok(variants.size===1&&extraCount===0,'One tap never generates unrelated bonus policies');
const end=boot();end.api.restart();end.api.setState({...end.api.getState(),finish:true,ending:'normal_strain'});
const again=end.get('ending').children.find(x=>x.textContent==='もう一度営業する');
ok(!!again,'Replay button present');again.onclick();
ok(!end.get('intro').classList.contains('hidden')&&!end.get('start').classList.contains('hidden')&&
 !end.get('startOver').classList.contains('hidden'),'Game over offers DAY 0 and DAY 1');
const d=boot();d.api.restart();d.api.setState({...d.api.getState(),day:8,odd:3,day8Active:true,
 day8OpeningPending:true,day8Revealed:false,finish:false,revenue:360,
 days:Array.from({length:7},(_,i)=>({day:i+1,sales:50}))});d.api.resumeCurrent();
ok(d.get('transitionTitle').innerHTML.includes('人曜日'),'Opening is already corrupted');
ok(d.get('transitionScore').textContent==='88人'&&d.get('transitionDecision').textContent.includes('第8営業日')&&
 d.get('transitionTotal').textContent.includes('縺ｧ■繧ｫ件'),
 'Human-day opening uses the wrong sales unit and an unreadable checkout count');
d.api.closeTransition();
ok(d.get('day8Meters').children[0].innerHTML.includes('石')&&
 d.get('day8Meters').children[0].innerHTML.includes('88,888/5'),'Stone replaces queue and overflows cap');
ok(d.get('day8Meters').children[3].innerHTML.includes('818181/5'),'Other indicators exceed the scale');
ok(d.get('day8Ledger').textContent.includes('繧ｫﾞ■縺ｮ件'),'Business bulletin uses intentional mojibake');
const voices=d.get('day8Feedback').children.map(x=>x.children[1].textContent);
ok(new Set(voices).size>=8,'Ten comments contain diverse surreal writing');
ok(voices[7].includes('譁ｯ縺ｮ'),'One customer letter includes corrupted text');
ok(d.get('day8Help').classList.contains('hidden'),'Corrupted help does not open automatically');
const stableDay8=JSON.stringify(d.api.getState());
d.get('help').onclick();
ok(!d.get('day8Help').classList.contains('hidden'),'Human-day help button opens corrupted guide');
ok(html.includes('id="day8HelpHeading"')&&html.includes('遊び方（参照先：譁ｯ縺ｮ人曜日）'),'Help modal markup has scrambled heading');
ok(html.includes('id="day8HelpClose"')&&html.includes('閉じて売場に戻る'),'Help provides a readable exit');
d.get('day8HelpClose').onclick();
ok(d.get('day8Help').classList.contains('hidden')&&JSON.stringify(d.api.getState())===stableDay8,
 'Closing broken help preserves state and player can continue');
ok(d.get('day8Offers').children.length===0,'Choice unavailable before final question');
d.api.advanceDay8();ok(!d.api.getState().finish,'Cannot bypass customer question');
const ask=d.get('day8Feedback').children[9].children[1].children.find(x=>x.textContent==='終わりはありますか');
ok(!!ask&&typeof ask.onclick==='function','Final customer underline is clickable');
ask.onclick();
ok(d.get('day8Offers').children.length===10&&d.api.getState().day8Revealed,'Ten responses revealed');
ok(d.get('day8Offers').children.every(x=>x.textContent==='自らを捧げる'),'All responses have same disturbing label');
const save=JSON.stringify(d.api.getState());
for(let i=0;i<10;i++){
 const q=boot(new Map([['f1-v10',save]]));q.api.resumeCurrent();
 ok(q.get('day8Offers').children.length===10,'Unlocked response persists on reload');
 q.get('day8Offers').children[i].onclick();
 ok(q.api.getState().ending==='odd_day8'&&q.api.getState().finish,'Response '+i+' reaches hidden ending');
 const result=q.get('ending').children.find(x=>x.className==='outcome');
 ok(!!result&&result.innerHTML.includes('8/7日間'),'Report disguises corrupt metrics');
 ok(q.get('ending').children.some(x=>x.className==='ending-media'),'Newspaper/forum format matches normal ending');
}
console.log('PASS F1 v0196: '+checks+' checks, '+variants.size+' random alternatives in 64 seeds');
