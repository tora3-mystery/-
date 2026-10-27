/* F1 v0.16.1: unobtrusive horror posts, identity uniqueness and DAY 8 regression.
 * Run: node f1/tests/v0161_horror_regression.js
 * DOM runtime test; it does not replace real mobile/browser visual inspection.
 */
'use strict';
const fs=require('node:fs'),path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const script=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
if(!script)throw Error('Game script not found');
let checks=0;
function check(value,reason){checks++;if(!value)throw Error('F1 horror regression '+checks+': '+reason);}
function element(){
 const flags=new Set(['hidden']),attrs={};
 return {children:[],textContent:'',innerHTML:'',value:'',src:'',style:{},className:'',open:false,
  classList:{contains:x=>flags.has(x),add:(...a)=>a.forEach(x=>flags.add(x)),remove:(...a)=>a.forEach(x=>flags.delete(x)),toggle:(x,on)=>on?flags.add(x):flags.delete(x)},
  append(...c){this.children.push(...c)},replaceChildren(...c){this.children=c},
  setAttribute:(k,v)=>attrs[k]=v,getAttribute:k=>attrs[k]??null,focus(){}};
}
const nodes=new Map(),memory=new Map();
const document={body:element(),createElement:element,getElementById:id=>{
 if(!nodes.has(id))nodes.set(id,element());return nodes.get(id);
}};
const get=document.getElementById,window={};
const localStorage={getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,v)};
new Function('document','localStorage','window','scrollTo','confirm',script)(
 document,localStorage,window,()=>{},()=>true);
const api=window.__F1_DEBUG__;
function advance(id){
 check(api.availableIds().includes(id),'Missing action '+id+' at DAY '+api.getState().day);
 api.play(id);api.advance();
 if(!get('dayTransition').classList.contains('hidden'))api.closeTransition();
}
function specialCards(){
 return get('complaintBoard').children.map(c=>({
  customer:c.children[0]?.children[0]?.textContent||'',
  body:c.children[1]?.textContent||''
 })).filter(x=>/レジの近くに、ずっと立っている人|変な客がいます|レジのご案内が丁寧でした/.test(x.body));
}
api.restart();
// DAY 1 product inspection must precede the rear-shrine choice.
const product=api.getState().complaintTickets.find(x=>x.body.includes('見掛けない商品'));
check(!!product&&api.focus(product.id,'見掛けない商品がありました'),'First product discovery');
advance('productCheck');
check(api.focus('f17-back-review','裏手の社の周りが暗く'),'DAY 2 phrase inspection');
advance('inspectBack');api.setState({...api.getState(),policySeed:0});advance('audit');
let posts=specialCards();
check(api.getState().day===4,'First special review must appear on DAY 4 in the earliest route');
check(posts.length===1&&posts[0].body.includes('レジの近くに、ずっと立っている人がいました。'),'DAY 4 plain concern');
advance('camera0');
posts=specialCards();
check(api.getState().day===5,'Second stage must appear on DAY 5 in the earliest route');
check(posts.length===5,'Exactly five complaints at stage two');
check(posts.every(p=>p.body.includes('変な客がいます。')),'All five complaints must have identical text');
check(new Set(posts.map(p=>p.customer)).size===5,'All five complaints must have distinct customer names');
advance('open0');
posts=specialCards();
check(api.getState().day===6,'Third stage must appear on DAY 6 in the earliest route');
check(posts.length===10,'Exactly ten review posts at stage three');
check(posts.every(p=>p.body.includes('レジのご案内が丁寧でした。ありがとうございました。')),'Preserve the original praise text');
check(new Set(posts.map(p=>p.customer)).size===10,'Ten distinct customers');
check(!get('dailyReport').children.some(p=>p.textContent.includes('差出人不明')),'Daily report must not narrate anomaly');
advance('idle');
check(api.getState().day===7,'Return to DAY 7');
check(specialCards().length===0,'Normal reviews only on DAY 7');
check(!get('transitionTotal').textContent.includes('システム判定：正常'),'DAY 7 must not announce normality');
advance('idle');
check(api.getState().day8Active&&api.getState().day===8,'Sacrifice route must automatically enter DAY 8');
api.advanceDay8();
check(get('day8Feedback').children.length===10,'Ten ordinary praise comments return on DAY 8');
console.log('PASS F1 horror regression '+checks+' checks');
