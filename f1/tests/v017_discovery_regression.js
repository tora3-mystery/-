/* F1 v0.17: text-highlight discovery, three daily investigations, save, undo.
 * Run: node f1/tests/v017_discovery_regression.js
 * DOM runtime test; physical Safari and actual page layout need separate QA.
 */
'use strict';
const fs=require('node:fs'),path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const code=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
if(!code)throw Error('No game script');
const storage=new Map();let checks=0;
function test(ok,label){checks++;if(!ok)throw Error('F1 v0.17 check '+checks+': '+label)}
function boot(){
 const map=new Map();
 function el(){
  const flags=new Set(['hidden']),attrs={};return{children:[],textContent:'',innerHTML:'',className:'',src:'',style:{},value:'',open:false,
   classList:{contains:x=>flags.has(x),add:(...xs)=>xs.forEach(x=>flags.add(x)),remove:(...xs)=>xs.forEach(x=>flags.delete(x)),toggle:(x,b)=>b?flags.add(x):flags.delete(x)},
   append(...a){this.children.push(...a)},replaceChildren(...a){this.children=a},
   setAttribute:(k,v)=>attrs[k]=v,getAttribute:k=>attrs[k]??null,focus(){}};
 }
 const document={body:el(),createElement:el,getElementById:id=>{if(!map.has(id))map.set(id,el());return map.get(id)}};
 const localStorage={getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v)},window={};
 new Function('document','localStorage','window','scrollTo','confirm',code)(document,localStorage,window,()=>{},()=>true);
 return {api:window.__F1_DEBUG__,get:document.getElementById};
}
const complaint=(id,metric,body)=>({id,metric,body,day:1,customer:id,status:'open',closedDay:null,replies:[]});
let x=boot();x.api.restart();
x.api.setState({...x.api.getState(),complaintTickets:[
 complaint('reviewA',0,'昨日はレジに20分並びました。通路まで列が伸びていて、カートが通れませんでした。'),
 complaint('reviewB',2,'夕食の材料がまた品切れでした。'),
 complaint('reviewC',3,'案内放送が繰り返され、店内で会話ができません。')
]});
const underlines=x.get('complaintBoard').children[0].children[1].children.filter(n=>n.className==='complaint-focus').map(n=>n.textContent);
test(underlines.length===2,'Only two highlights in example complaint');
test(underlines[0]==='レジに20分並びました'&&underlines[1]==='カートが通れませんでした','Highlight exact requested spans');
test(x.api.focus('reviewA','レジに20分並びました'),'First focus');
test(x.api.focus('reviewA','カートが通れませんでした'),'Multiple focus targets in one customer letter');
test(x.api.focus('reviewB','夕食の材料がまた品切れ'),'Third focus');
test(x.api.getState().focusKeys.length===3,'Three daily limit');
test(!x.api.focus('reviewC','案内放送が繰り返され'),'Fourth focus rejected');
test(x.api.focus('reviewA','レジに20分並びました'),'Repeated focus is free');
test(x.api.getState().focusKeys.length===3,'Repeated focus does not spend a use');
test(['register','pickup','lane','eveningRestock'].every(id=>x.api.availableIds().includes(id)),'Two underlines in one letter share a three-policy budget');
x=boot();test(x.api.getState().focusKeys.length===3,'Investigation save/restore');
x.api.resumeCurrent();
test(x.get('investigationCount').textContent.includes('あと0箇所'),'Resume shows no more investigations');
x.api.play('idle');test(x.api.getState().needsAdvance,'End-day selection');
x.get('undo').onclick();
test(x.api.getState().focusKeys.length===3&&!x.api.getState().needsAdvance,'Undo policy does not refund investigations');
x.api.play('idle');x.api.advance();x.api.closeTransition();
test(x.get('investigationCount').textContent.includes('あと3箇所'),'Next day resets remaining count');
test(x.api.getState().discoveredActions.includes('lane'),'Discovered alternatives persist into next day');
console.log('PASS F1 v0.17 discovery '+checks+' checks');
