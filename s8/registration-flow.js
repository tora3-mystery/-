"use strict";
/* S8 v0.7.0 - visible registration review, elective credit ledger and button dispatch. */
(function(){
const $id=id=>document.getElementById(id);
const optionalTarget=year=>window.S8_OPTIONAL_TARGETS[state.faculty][year-1];
const electiveCourse=r=>!r.required&&r.course?.type!=="required"&&!(r.course?.annual&&state.semester%2===0);
function ensureElectives(){
 if(!state)return;
 if(state.electiveLedger&&typeof state.electiveLedger==="object"&&Number.isFinite(state.electiveCredits))return;
 let baseline=0;
 if((state.credits||0)>0){
  // Previous versions stored combined credits. Reconstruct as well as possible
  // using the stored mandatory grade history (all required courses are 2 credits).
  const completedRequired=new Set();
  for(const h of state.history||[])for(const r of h.required||[])
   if((r.status||"").includes("取得"))completedRequired.add(r.id);
  const completedNow=(state.results||[]).slice(0,state.revealIndex||0);
  for(const r of completedNow)if(r.pass&&r.required)completedRequired.add(r.canonicalId);
  baseline=Math.max(0,state.credits-completedRequired.size*2);
 }
 state.electiveBaseline=baseline;
 state.electiveLedger={};
 // Do not re-count completed current-term passes already included in the legacy base.
 if(state.phase==="reveal")for(const r of (state.results||[]).slice(0,state.revealIndex||0))
  if(r.pass&&electiveCourse(r))state.electiveLedger[r.canonicalId||r.id]=0;
 state.electiveCredits=baseline
}
function syncElectives(){
 if(!state)return;
 ensureElectives();
 if(state.phase==="reveal")for(const r of (state.results||[]).slice(0,state.revealIndex||0)){
  if(!r.pass||!electiveCourse(r))continue;
  const id=r.canonicalId||r.id;
  if(!(id in state.electiveLedger))state.electiveLedger[id]=r.credits;
 }
 const total=(state.electiveBaseline||0)+Object.values(state.electiveLedger).reduce((a,b)=>a+(Number(b)||0),0);
 if(total!==state.electiveCredits){state.electiveCredits=total;save()}
}
const originalStart=start;
start=function(seed){originalStart(seed);if(!state)return;state.electiveLedger={};state.electiveCredits=0;state.electiveBaseline=0;state.reviewOpen=false;save();render()};
const originalStep=stepReveal;
stepReveal=function(){const before=state?.revealIndex;originalStep();if(state&&state.revealIndex!==before){syncElectives();renderReveal()}};
const originalRenderReveal=renderReveal;
renderReveal=function(){syncElectives();originalRenderReveal()};
const originalEnd=endReveal;
endReveal=function(){syncElectives();originalEnd();syncElectives();if(state?.phase==="reveal"&&state.revealIndex===state.results.length)renderReveal()};
const originalRender=render;
render=function(){if(state)ensureElectives();originalRender();if(state?.phase==="registration")$id("register-btn").textContent="申請内容を確認する →";if(state?.reviewOpen)renderReview()};
function riskDetails(c){
 const registered=allRegistered().filter(x=>x.id!==c.id).concat(c);
 const used=new Set(getActivityBlocks());let credits=0;
 for(const x of registered){credits+=x.credits;for(const p of x.slots)used.add(p)}
 const lectureSlots=new Set(registered.flatMap(x=>x.slots));
 const blocks=new Set(getActivityBlocks()),breakdown=[];
 const add=(name,n)=>{if(n)breakdown.push({name,n})};
 const base=97-(c.diff-1)*9+FACULTIES[state.faculty].risk+ACTIVITIES[state.activity].modifier;
 add("サークルのレポート適性",state.activity==="club"&&c.method==="レポート"?4:0);
 add("1限の負担",c.slots.some(p=>p%5===0)?-9:0);
 add("土曜の負担",c.slots.some(p=>Math.floor(p/5)===5)?-12:0);
 const adjacency=c.slots.reduce((count,p)=>count+(p%5>0&&p%5!==2&&lectureSlots.has(p-1)?1:0)+(p%5<4&&p%5!==1&&lectureSlots.has(p+1)?1:0),0);
 add("昼休み以外の連続授業（"+adjacency+"隣接）",-8*adjacency);
 const perDay=Array.from({length:6},()=>0);for(const p of lectureSlots)perDay[Math.floor(p/5)]++;
 add("同一日の3コマ以上",c.slots.some(p=>perDay[Math.floor(p/5)]>=3)?-8:0);
 add("同一日の4コマ以上",c.slots.some(p=>perDay[Math.floor(p/5)]>=4)?-8:0);
 const pressure=Math.max(0,used.size-7);
 add("週の拘束コマ数",-(pressure*2.3+Math.pow(Math.max(0,used.size-12),1.65)*1.9));
 add("登録単位が12単位超", -Math.max(0,credits-12)*1.7);
 add("学年が上がった負担",-Math.floor(state.semester/2)*4);
 add("通年科目の中間評価",c.type==="annualCarry"?(c.midtermOk?9:-10):0);
 add("卒業旅行の影響",state.travelEvent?.active&&state.semester===7?-(state.travelEvent.penalty||0):0);
 add("キャンパス間移動",-((window.S8_MOBILITY_PENALTY?.(c))||0));
 add("課外活動の直前",c.slots.some(p=>p%5<4&&blocks.has(p+1))?4:0);
 const present=new Set([...lectureSlots,...blocks]);
 let gap=0;
 for(const p of c.slots){
  const earlier=[...lectureSlots].filter(t=>Math.floor(t/5)===Math.floor(p/5)&&t<p);
  if(!earlier.length)continue;
  let free=0;for(let t=Math.max(...earlier)+1;t<p;t++)if(!present.has(t))free++;
  gap=Math.max(gap,free)
 }
 add("空きコマ後の帰宅リスク",gap?(gap===1?-6:-9):0);
 // These modifiers are applied by the other module layers after the base calculation.
 const busy=new Set([...lectureSlots,...blocks]);
 add("前日が全休",c.slots.some(p=>Math.floor(p/5)>0&&![...busy].some(t=>Math.floor(t/5)===Math.floor(p/5)-1))?5:0);
 add("再履修の経験",(state.failedRequired||[]).some(f=>f.canonicalId===c.canonicalId)?4:0);
 add("前学期の優秀生",state.honorBoostTerm===state.semester?6:0);
 const skills=(state.skills||[]),count=id=>skills.filter(x=>x.id===id).length;
 add("過去問の蓄積",count("past_exams")*5);
 add("朝活の習慣",c.slots.some(p=>p%5===0)?count("morning_routine")*8:0);
 add("土曜の常連",c.slots.some(p=>Math.floor(p/5)===5)?count("saturday_special")*10:0);
 add("レポート職人",["レポート","課題"].includes(c.method)?count("report_hacks")*7:0);
 add("試験対策ノート",c.method==="試験"?count("exam_tactics")*8:0);
 add("教授のクセを研究",c.diff>=4?count("professor_notes")*6:0);
 add("詰め込まない勇気",count("minimalism")&&creditLoad()<=14?8:0);
 if(count("night_shift")){
  add("夜型：午後",c.slots.some(p=>p%5>=3)?8:0);
  add("夜型：朝の負担",c.slots.some(p=>p%5===0)?-5:0)
 }
 if(count("weekend_reset"))add("週休の達人",c.slots.some(p=>Math.floor(p/5)>0&&![...busy].some(t=>Math.floor(t/5)===Math.floor(p/5)-1))?5:0);
 add("カンニングによる取得率上昇",skills.some(x=>x.id==="cheating"&&x.year+1===Math.floor(state.semester/2)+1)?50:0);
 add("3限の昼休み明け",c.slots.some(p=>p%5===2)?6:0);
 // Base aptitude skill, selected at admission or acquired in an annual draft.
 if((window.S8_SUBJECT_TAGS?.(c)||c.aptitudeTags||[]).some(tag=>skills.some(sk=>sk.id===tag)))add("得意分野（パソコン・数学・英語）",6);
 const final=passChance(c);
 // The real chance function also uses staged rounding, movement penalties,
 // 5–98% caps and potentially the 100% compulsory study skill.
 const expected=Math.round(base+breakdown.reduce((a,x)=>a+x.n,0));
 const adjust=final-expected;
 return {base,breakdown,final,adjust,guaranteed:final===100,probabilityCap:final===98};
}
function reviewAlternatives(current){
 if(!state||state.phase!=="registration")return[];
 const original=state.selectedIds.slice();
 state.selectedIds=original.filter(id=>id!==current.id);
 try{
  return state.offers.filter(c=>c.type!=="required"&&c.type!=="annualCarry"&&c.id!==current.id&&!state.selectedIds.includes(c.id)&&allowed(c).ok)
   .sort((a,b)=>passChance(b)-passChance(a))
 }finally{state.selectedIds=original}
}
function closeReplacement(){
 const box=$id("review-replacements");if(box){box.replaceChildren();box.classList.add("hidden")}
}
function openReplacement(currentId){
 const current=state?.offers?.find(c=>c.id===currentId),box=$id("review-replacements");
 if(!current||!box||!state.reviewOpen)return;
 const candidates=reviewAlternatives(current);if(!candidates.length)return;
 box.replaceChildren();
 const wrap=document.createElement("div");wrap.className="review-replacement-body";
 const heading=document.createElement("h3");heading.textContent="「"+current.name+"」の代わりに登録する講義";
 const detail=document.createElement("p");detail.textContent="時間割・前提条件を満たす候補のみ表示。選ぶと元の講義を解除し、この画面の確率を再計算します。";
 wrap.append(heading,detail);
 for(const c of candidates){
  const b=document.createElement("button");b.type="button";b.className="review-alternative";
  // Preview odds for the post-swap schedule, not the old course still selected.
  const previous=state.selectedIds.slice();
  state.selectedIds=previous.filter(id=>id!==currentId);
  let newChance;
  try{newChance=passChance(c)}finally{state.selectedIds=previous}
  const overallChance=c.lottery?Math.round(c.lottery*newChance/100):newChance;
  b.textContent=c.name+"｜"+c.credits+"単位｜難度★"+c.diff+"｜単位取得見込 "+overallChance+"%"+(c.lottery?"（抽選"+c.lottery+"%込み）":"");
  b.onclick=()=>{
   const before=state.selectedIds.slice();
   state.selectedIds=before.filter(id=>id!==currentId);
   if(!allowed(c).ok){state.selectedIds=before;closeReplacement();renderReview();return}
   state.selectedIds.push(c.id);
   closeReplacement();save();renderReview();
   showToast("「"+current.name+"」を「"+c.name+"」に変更しました。")
  };
  wrap.append(b)
 }
 const close=document.createElement("button");close.type="button";close.className="secondary";
 close.textContent="変更せずに戻る";close.onclick=closeReplacement;wrap.append(close);
 box.append(wrap);box.classList.remove("hidden");box.scrollTop=0
}
function reviewRow(c){
 const chance=riskDetails(c);
 const row=document.createElement("div");row.className="review-course";
 const head=document.createElement("div");head.className="review-course-heading";
 const title=document.createElement("strong");title.textContent=(c.type==="required"?"★必修 ":"")+c.name+"（"+c.credits+"単位）";
 const pct=document.createElement("span");pct.className="review-percent"+(chance.final<45?" low":"");const lottery=Number.isFinite(c.lottery)?c.lottery:null;
 const overall=lottery===null?chance.final:Math.round(lottery*chance.final/100);
 pct.textContent="単位取得見込 "+overall+"%"+(lottery===null?"":"（抽選込み）");
 head.append(title,pct);row.append(head);
 const details=document.createElement("details");details.className="review-breakdown";
 const summary=document.createElement("summary");summary.textContent="取得率の計算内訳を見る";details.append(summary);
 const base=document.createElement("div");base.textContent="基本取得率（難度・学部・活動） "+chance.base.toFixed(1)+"%";details.append(base);
 for(const part of chance.breakdown){
  const x=document.createElement("div");x.textContent=part.name+" "+(part.n>0?"+":"")+part.n.toFixed(1)+"ポイント";details.append(x)
 }
 if(chance.adjust){const x=document.createElement("div");x.textContent=chance.guaranteed?"必修予習の100%保証・補正の適用順 "+(chance.adjust>=0?"+":"")+chance.adjust.toFixed(1)+"ポイント":"その他の補正・上限・丸めによる差分 "+(chance.adjust>=0?"+":"")+chance.adjust.toFixed(1)+"ポイント";details.append(x)}
 if(lottery!==null){
  const select=document.createElement("div");
  select.textContent="履修抽選の当選率 "+lottery+"%（当選した場合のみ成績を判定）";
  details.append(select)
 }
 const total=document.createElement("b");
 total.textContent=lottery===null?"最終取得率 "+chance.final+"%（この数値を成績抽選に使用）":
 "当選後の単位取得率 "+chance.final+"% × 履修当選率 "+lottery+"% ＝ 最終取得見込 約"+overall+"%";
 details.append(total);
 row.append(details);
 if(c.type==="required"&&(state.skills||[]).some(sk=>sk.id==="mandatory_master")){
  const earliest=Math.min(...c.slots),prior=earliest-1;
  const prep=earliest%5!==0?occupied().get(prior):null;
  const activated=prep?.type==="study"&&prep.id==="study_"+c.id;
  const p=document.createElement("p");p.className="review-fixed";
  p.textContent=activated
   ?"📖 必修の鬼が発動：直前の予習コマを確保済み（取得率100%）"
   :earliest%5===0
    ?"📖 必修の鬼は発動しません：1限は直前に予習コマを置けません。"
    :"📖 必修の鬼は発動しません：直前のコマが空いていません。";
  row.append(p)
 }
 if(c.type!=="required"&&c.type!=="annualCarry"){
  const controls=document.createElement("div");controls.className="review-course-actions";
  const remove=document.createElement("button");remove.type="button";
  remove.className="review-replace";remove.textContent="この講義を取り消す";
  remove.onclick=()=>{
   state.selectedIds=state.selectedIds.filter(id=>id!==c.id);
   save();renderReview(); // Remain on the same confirmation screen.
   showToast("「"+c.name+"」を取り消しました。")
  };
  const swap=document.createElement("button");swap.type="button";
  swap.className="review-replace";swap.textContent="別の講義に変える";
  const alternatives=reviewAlternatives(c);
  swap.disabled=alternatives.length===0;
  swap.title=alternatives.length?"登録可能な講義を表示":"時間割・前提条件を満たす差替え候補はありません";
  swap.onclick=()=>openReplacement(c.id);
  controls.append(remove,swap);row.append(controls)
 }else{
  const fixed=document.createElement("small");fixed.className="review-fixed";fixed.textContent="必修・通年継続は登録解除できません。";row.append(fixed)
 }
 return row
}
function renderReview(){
 const panel=$id("registration-review");if(!panel)return;
 const show=!!state&&state.phase==="registration"&&state.reviewOpen;
 panel.classList.toggle("hidden",!show);
 if(!show)return;
 const courses=allRegistered();
 const year=Math.floor(state.semester/2)+1,need=optionalTarget(year),registered=courses.filter(c=>c.type!=="required"&&c.type!=="annualCarry").reduce((a,c)=>a+c.credits,0);
 $id("review-totals").textContent="選択科目取得済み "+state.electiveCredits+" / "+need+"単位（今期申請中 "+registered+"単位）｜ 計"+courses.length+"科目・"+creditLoad()+"単位を申請。必修は別枠・卒業までに全取得が必要。"+((state.skills||[]).some(x=>x.id==="cheating"&&x.year+1===year)?"　⚠ カンニング実行中：科目ごとに10%の発覚リスクがあり、発覚するとGAME OVER。":"");
 closeReplacement();
 const list=$id("review-courses");list.replaceChildren();for(const c of courses)list.append(reviewRow(c));
 panel.scrollTop=0
}
function closeReview(){closeReplacement();if(state){state.reviewOpen=false;save()}$id("registration-review").classList.add("hidden")}
function openReview(){if(!state||state.phase!=="registration")return;syncElectives();state.reviewOpen=true;save();renderReview()}
$id("register-btn").onclick=openReview;
$id("review-edit").onclick=()=>{closeReview();render()};
$id("review-submit").onclick=()=>{
 if(!state||!state.reviewOpen||state.phase!=="registration")return;
 closeReview();
 beginReveal() // Calls the latest registered grading wrappers, including the cheating event.
};
const oldResume=resume;
resume=function(){oldResume();if(!state)return;ensureElectives();syncElectives();if(state.reviewOpen&&state.phase==="registration")renderReview();render()};
$id("resume-btn").onclick=()=>resume();
$id("begin-btn").onclick=()=>start();
$id("next-btn").onclick=()=>advance(); // Final layer after every decorator. Fixes the hidden skill choice.
})();
