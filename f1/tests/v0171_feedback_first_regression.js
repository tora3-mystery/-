/* F1 v0.17.1 — playable loop must start from customer feedback, never a prefilled policy catalog.
 * Run: node f1/tests/v0171_feedback_first_regression.js
 * In-memory DOM test; does not replace actual browser/mobile review.
 */
'use strict';
const fs=require('node:fs'),path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const script=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
if(!script)throw Error('Missing script');
let checks=0;
const check=(yes,n)=>{checks++;if(!yes)throw Error('F1 v0171 regression '+checks+': '+n)};
function boot(db=new Map()){
 const nodes=new Map();
 const node=()=>{const classes=new Set(['hidden']),attrs={};return{children:[],textContent:'',innerHTML:'',className:'',style:{},open:false,src:'',value:'',
   classList:{contains:k=>classes.has(k),add:(...x)=>x.forEach(k=>classes.add(k)),remove:(...x)=>x.forEach(k=>classes.delete(k)),toggle:(k,x)=>x?classes.add(k):classes.delete(k)},
   append(...x){this.children.push(...x)},replaceChildren(...x){this.children=x},
   getAttribute:k=>attrs[k]??null,setAttribute:(k,v)=>attrs[k]=v,focus(){}};
 };
 const document={body:node(),createElement:node,getElementById:id=>{if(!nodes.has(id))nodes.set(id,node());return nodes.get(id)}};
 const localStorage={getItem:k=>db.get(k)??null,setItem:(k,v)=>db.set(k,v)},window={};
 new Function('document','localStorage','window','scrollTo','confirm',script)(document,localStorage,window,()=>{},()=>true);
 return{api:window.__F1_DEBUG__,get:document.getElementById,db};
}
function customer(id,metric,body){return{id,metric,body,customer:id,day:1,status:'open',closedDay:null,replies:[]}}
const a=boot();a.api.restart();
check(html.includes('id="day0Panel"')&&html.includes('id="day0Investigate"')&&html.includes('id="day0Apply"'),'Interactive DAY 0 onboarding');
check(!html.includes('<ol class="intro-jobs"><li>ご意見の下線部分をタップ'),'No repeated tutorial instructions');
check(!html.includes('+(impact?'),'Avoid duplicating textual action impacts next to numeric effect chips');
check(a.api.availableIds().length===1&&a.api.availableIds()[0]==='idle','No prefilled policy before reading customer feedback');
const ordinary=a.api.getState().complaintTickets.find(x=>x.metric===3);
const shrineText='商店街の神社で商売繁盛を祈願したらどうですか';
check(!!ordinary&&ordinary.body.includes(shrineText),'Day 1 has a normal customer complaint mentioning a local shrine');
check(a.api.focus(ordinary.id,shrineText),'Tap a customer phrase to discover ordinary shrine visit');
check(a.api.availableIds().includes('shrine'),'Ordinary shrine is unlocked immediately after investigation');
const rewarded=a.get('complaintBoard').children.flatMap(c=>c.children).find(c=>c.className?.includes('discovery-award'));
check(!!rewarded,'New policy triggers an inline visual reward');
check(rewarded.children[0]?.textContent==='対応案を1件発見！','Reward shows one new policy');
check(a.get('actions').children.some(c=>c.className?.includes('discovery-new-action')),'Corresponding policy card receives the entrance animation');
check(a.api.focus(ordinary.id,shrineText),'Repeated phrase review succeeds');
check(!a.get('complaintBoard').children.some(c=>c.children.some(x=>x.className?.includes('discovery-award'))),'Repeat does not fake a new discovery');
a.api.restart();
check(a.get('moneyDetail').textContent==='本部目標：今週の売上500万円','Condensed HUD instead of formulas/fines');
check(!a.get('moneyDetail').textContent.includes('基礎30'),'No unwanted formula on HUD');
a.api.setState({...a.api.getState(),complaintTickets:[
 customer('reviewA',0,'昨日はレジに20分並びました。通路まで列が伸びていて、カートが通れませんでした。'),
 customer('reviewB',2,'夕食の材料がまた品切れでした。'),
 customer('reviewC',3,'案内放送が繰り返され、店内で会話ができません。')
]});
const highlights=a.get('complaintBoard').children[0].children[1].children.filter(n=>n.className==='complaint-focus').map(n=>n.textContent);
check(highlights.length===2,'Exactly two highlighted phrases in same customer comment');
check(highlights[0]==='レジに20分並びました'&&highlights[1]==='カートが通れませんでした','Highlight the two specified meaningful spans');
check(a.api.focus('reviewA','レジに20分並びました'),'First clicked phrase');
check(['register','staff','queueExpress','pickup'].every(id=>a.api.availableIds().includes(id)),'One phrase discovers multiple usable policies');
check(a.get('actions').children.some(c=>c.innerHTML.includes('有人レジを増設')),'Discovered policy visible in actual action cards');
check(a.api.focus('reviewA','カートが通れませんでした'),'Second phrase same complaint');
check(a.api.focus('reviewB','夕食の材料がまた品切れ'),'Third phrase from another complaint');
check(a.api.getState().focusKeys.length===3,'Only three investigations spent');
check(!a.api.focus('reviewC','案内放送が繰り返され'),'Fourth new phrase must be blocked');
check(a.api.focus('reviewA','レジに20分並びました'),'Repeat inspection free');
check(a.api.getState().focusKeys.length===3,'Repeat does not increase three');
const b=boot(a.db);b.api.resumeCurrent();
check(b.api.getState().focusKeys.length===3,'Save and resume remembers three consumed');
check(b.get('investigationCount').textContent.includes('あと0箇所'),'Counter shows zero remaining');
b.api.play('idle');
b.get('undo').onclick();
check(b.api.getState().focusKeys.length===3,'Undo action does not replenish investigations');
b.api.play('idle');b.api.advance();b.api.closeTransition();
check(b.get('investigationCount').textContent.includes('あと3箇所'),'Day increment refreshes quota');
check(b.api.focus('reviewA','レジに20分並びました'),'Same phrase repeat across days is free');
check(b.api.getState().focusKeys.length===3||b.api.getState().focusKeys.length===0,'Historic repeat does not consume a fresh investigation');
const c=boot();c.api.restart();
const shrineSource=c.api.getState().complaintTickets.find(t=>t.metric===3);
check(!c.api.availableIds().includes('shrine'),'Ordinary shrine cannot be chosen without examining a complaint');
check(c.api.focus(shrineSource.id,shrineText),'Discover local shrine from noise-related complaint');
check(c.api.availableIds().includes('shrine'),'Ordinary shrine available after tapping');
const productSource=c.api.getState().complaintTickets.find(x=>x.body.includes('見掛けない商品'));
check(!!productSource&&c.api.focus(productSource.id,'見掛けない商品がありました'),'Additional mystery-product investigation');
check(c.api.availableIds().includes('productCheck'),'Product response is discovered');
c.api.play('productCheck');c.api.advance();c.api.closeTransition();
check(c.api.getState().day===2,'Reached DAY2');
check(!c.api.availableIds().includes('inspectBack'),'The rear inspection is not default');
check(c.api.focus('f17-back-review','裏手の社の周りが暗く'),'Discover rear of store from ordinary complaint');
check(c.api.availableIds().includes('inspectBack'),'Immediately available once discovered');
c.api.play('inspectBack');c.api.advance();c.api.closeTransition();
check(c.api.availableIds().includes('audit')&&c.api.availableIds().includes('removeShrine'),'Resulting shrine visit/demolition fork');
c.api.play('audit');c.api.advance();c.api.closeTransition();
check(!c.api.availableIds().includes('removeShrine'),'Shrine removal blocked after visiting');
c.api.play('camera0');c.api.advance();c.api.closeTransition();
check(c.get('complaintBoard').children.filter(x=>x.children[1]?.textContent.includes('変な客がいます')).length===5,'Five identical customer complaints');
c.api.play('open0');c.api.advance();c.api.closeTransition();
check(c.get('complaintBoard').children.filter(x=>x.children[1]?.textContent.includes('レジのご案内が丁寧')).length===10,'Ten identical gratitude posts');
c.api.play('idle');c.api.advance();c.api.closeTransition();
check(c.get('complaintBoard').children.every(x=>!x.children[1]?.textContent.includes('レジのご案内が丁寧')),'DAY7 returns to normal');
c.api.play('idle');c.api.advance();
check(c.api.getState().day8Active,'DAY8 automatically after sacrifice');
const later=boot();later.api.restart();
const originalNoise=later.api.getState().complaintTickets.find(x=>x.metric===3);
later.api.play('idle');later.api.advance();later.api.closeTransition();
later.api.play('idle');later.api.advance();later.api.closeTransition();
check(later.api.getState().day===3,'Reached DAY 3 without visiting ordinary shrine');
check(!later.api.availableIds().includes('shrine'),'Uninspected shrine is still hidden on DAY 3');
check(later.api.focus(originalNoise.id,shrineText),'Older customer comment can be inspected later');
check(later.api.availableIds().includes('shrine'),'Shrine is offered immediately even if first discovered on DAY 3');
console.log('PASS F1 feedback-first '+checks+' assertions');
