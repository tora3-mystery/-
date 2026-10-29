"use strict";
/* S8 v0.5.0 — quality-of-life, unrestricted scheduling, progressive activities and score clarity */
(function(){
const ACT_COUNTS={none:0,club:2,job:3,sports:3,combo:5};
const EXTRA_BY_YEAR=[0,1,2,2];
function scrollToBeginning(){
 try{if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();}catch(e){}
 const move=()=>{try{window.scrollTo({top:0,left:0,behavior:"instant"});document.documentElement.scrollTop=0;document.body.scrollTop=0;}catch(e){window.scrollTo(0,0)}};
 move();
 if(window.requestAnimationFrame)window.requestAnimationFrame(()=>window.requestAnimationFrame(move));
 else setTimeout(move,40);
}
const oldStart=start;
start=function(...args){oldStart(...args);if(state){state.balanceVersion="0.5.0";save()}scrollToBeginning()};
const oldResume=resume;
resume=function(...args){oldResume(...args);if(state)scrollToBeginning()};
function termLabel(){return (Math.floor(state.semester/2)+1)+"年生 "+(state.semester%2===0?"前期":"後期")}
function stableShuffle(items,tag){
 let v=hashSeed(String(state.seed)+"|"+tag);
 const random=()=>{v=(Math.imul(v,1664525)+1013904223)>>>0;return v/4294967296};
 const result=items.slice();
 for(let i=result.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[result[i],result[j]]=[result[j],result[i]]}
 return result;
}
const oldActivity=getActivityBlocks;
getActivityBlocks=function(){
 const base=oldActivity();
 if(!state||state.activity==="none")return base;
 const yr=Math.floor(state.semester/2);
 const total=ACT_COUNTS[state.activity]+EXTRA_BY_YEAR[yr];
 if(base.length>=total)return base;
 const restricted=new Set(base);
 const required=state.semester<2?MUST[state.faculty][state.semester]:null;
 if(required)for(const c of required)for(const p of c.slotSets[0])restricted.add(DAYS.indexOf(p[0])*5+Number(p.slice(1))-1);
 else{
  const upper=state.offers?.filter(c=>c.type==="required")||[];
  // The timetable is generated after selecting activities; use known faculty-specific mandatory patterns.
  const fixed=state.faculty==="science"&&state.semester<=3?["月2","金2","水3","水4"]:["月2","金2"];
  for(const p of fixed)restricted.add(DAYS.indexOf(p[0])*5+Number(p.slice(1))-1);
  for(const c of upper)for(const p of c.slots)restricted.add(p);
 }
 if(state.semester%2===1)for(const a of state.annualCourses||[])for(const p of a.course.slots)restricted.add(p);
 for(const f of state.failedRequired||[]){
  const first=f.firstFailedTerm??f.failedTerm??f.term??0;
  if(state.semester>=(f.retryEligibleTerm??first+2)&&state.semester%2===first%2)for(const p of f.slots)restricted.add(p);
 }
 // Club / paid work mostly happens in the late afternoon. Saturdays open for extra shifts.
 const desirable=["月4","月5","火4","火5","水4","水5","木4","木5","金4","金5","土2","土3","土4","土5"];
 const fallback=["月3","火3","水3","木3","金3","月2","火2","水2","木2","金2"];
 for(const v of stableShuffle(desirable.concat(fallback),"extra-activity-"+state.semester+"-"+state.activity)){
  if(base.length>=total)break;
  const i=DAYS.indexOf(v[0])*5+Number(v.slice(1))-1;
  if(restricted.has(i))continue;
  restricted.add(i);base.push(i);
 }
 if(state.activitySlotsByTerm)state.activitySlotsByTerm[String(state.semester)]=base;
 return base;
};
const oldAllowed=allowed;
allowed=function(c){
 // A registration is limited by timetable conflicts, not an arbitrary credit cap.
 if(c.type==="annualCarry")return {ok:false,reason:"通年科目は前期から自動継続しています。"};
 if(c.type==="required")return {ok:false,reason:"必修科目は自動登録されています。"};
 if(state.selectedIds.includes(c.id))return {ok:true,reason:"登録済みです。タップして解除できます。"};
 if(c.prereq&&!state.passedIds.includes(c.prereq))return{ok:false,reason:"前提科目の単位が必要："+(c.prereqName||c.prereq)};
 const occupiedSlots=occupied(),activity=getActivityBlocks();
 for(const p of c.slots){
  if(activity.includes(p))return{ok:false,reason:"活動時間と重複しています。"};
  if(occupiedSlots.has(p))return{ok:false,reason:"「"+occupiedSlots.get(p).name+"」と同じコマです。"};
 }
 return {ok:true,reason:"登録できます。"};
};
function projected(c){
 const registered=allRegistered().slice();
 if(c&&!registered.some(x=>x.id===c.id))registered.push(c);
 return registered;
}
passChance=function(c){
 const courses=projected(c);
 const used=new Set(getActivityBlocks());
 let credits=0;
 for(const course of courses){credits+=course.credits;for(const t of course.slots)used.add(t)}
 let chance=97-(c.diff-1)*9+FACULTIES[state.faculty].risk+ACTIVITIES[state.activity].modifier;
 if(state.activity==="club"&&c.method==="レポート")chance+=4;
 if(c.slots.some(s=>s%5===0))chance-=9;
 if(c.slots.some(s=>Math.floor(s/5)===5))chance-=12;
 // Every adjacent lecture is harder: both sides of a back-to-back class suffer.
 // Only teaching periods count, not extra-curricular blocks.
 const lessonSlots=new Set(courses.flatMap(x=>x.slots));
 const lessonAdjacencies=c.slots.reduce((count,s)=>count+(s%5>0&&lessonSlots.has(s-1)?1:0)+(s%5<4&&lessonSlots.has(s+1)?1:0),0);
 chance-=lessonAdjacencies*8;
 const weeklyCounts=[0,0,0,0,0,0];
 for(const p of lessonSlots)weeklyCounts[Math.floor(p/5)]++;
 if(c.slots.some(s=>weeklyCounts[Math.floor(s/5)]>=3))chance-=8;
 if(c.slots.some(s=>weeklyCounts[Math.floor(s/5)]>=4))chance-=8;
 const pressure=Math.max(0,used.size-7);
 // Exhaustion grows nonlinearly: filing an extra class can hurt all classes.
 chance-=pressure*2.3+Math.pow(Math.max(0,used.size-12),1.65)*1.9;
 chance-=Math.max(0,credits-12)*1.7;
 chance-=Math.floor(state.semester/2)*4;
 if(c.type==="annualCarry")chance+=c.midtermOk?9:-10;
 if(state.travelEvent?.active&&state.semester===7)chance-=state.travelEvent.penalty;
 return Math.round(Math.min(98,Math.max(5,chance)));
};
const oldCreate=createOffers;
createOffers=function(){
 oldCreate();
 if(state.semester===7){
  const active=hashSeed(state.seed+"|graduation-trip|"+state.faculty)%100<45;
  state.travelEvent={active,penalty:18};
 }else state.travelEvent=null;
 state.tripPending=false;
 state.balanceVersion="0.5.0";
 save();
};
function scoreDetails(r){
 if(!r)return "";
 if(r.course.annual&&state.semester%2===0)return r.name+"：通年前期の"+(r.pass?"中間評価クリア":"要補講")+"。得点・単位は後期末に判定（今期は0pt）";
 if(!r.pass)return r.name+"：獲得0pt"+(r.jobHunt?"（就職活動による欠席）":"");
 const basic=r.credits*100,combo=Math.max(0,r.earned-basic);
 return r.name+"："+r.credits+"単位×100pt="+fmt(basic)+"pt"+(combo?" ＋ 連続取得ボーナス"+fmt(combo)+"pt":"")+" ＝ "+fmt(r.earned)+"pt";
}
const priorRender=render;
render=function(){
 priorRender();
 if(!state)return;
 if(state.phase==="end")return;
 $("semester-label").textContent=termLabel()+"｜全4年間";
 $("current-credits").textContent=creditLoad()+"単位";
 const reg=allRegistered(),must=reg.filter(c=>c.type==="required"||c.type==="annualCarry").length;
 $("summary-line").textContent="今期の履修：必修・通年"+must+"科目＋選択"+(reg.length-must)+"科目（合計"+creditLoad()+"単位）。連続授業と過密な日程はすべての科目の取得率に影響します。";
 $("schedule-hint").textContent="★必修は自動登録。落とした必修は翌年度の同じ時間に復活します。連続講義・週3〜4コマの過密日は落単しやすくなります。";
 const yr=Math.floor(state.semester/2)+1,plus=EXTRA_BY_YEAR[yr-1],activity=ACT_COUNTS[state.activity];
 let ev=$("life-events");
 if(ev){
  ev.textContent=state.activity==="none"?"今期は勉強に専念。":yr>1?"学生生活が忙しくなった！ "+yr+"年生は授業以外の活動が週"+(activity+plus)+"コマ（1年生より+"+plus+"コマ）。":"今期の活動は週"+activity+"コマ。";
  if(state.travelEvent?.active&&state.semester===7)ev.textContent+="　🏖️ 卒業旅行の予定：今期の単位取得率−18ポイント。";
 }
 const warnings=$("retake-warning");
 if(warnings){
  const lock=state.offers.filter(c=>c.retake);
  const deferred=state.deferredRequired||[];
  warnings.textContent=lock.length||deferred.length?"⚠ 今期の再履修必修："+(lock.length?lock.map(c=>c.name+"（前年と同じ時間に固定）").join("・"):"なし")+(deferred.length?" ／ 必修の履修繰越："+deferred.join("・"):""):"";
  warnings.classList.toggle("hidden",!lock.length&&!deferred.length);
 }
 const r=$("register-btn");
 if(creditLoad()>=10){r.disabled=state.phase!=="registration";r.textContent="今期の履修を確定する →"}
 if(state.phase==="registration"){
  const totals=allRegistered().map(c=>passChance(c));
  const avg=totals.length?Math.round(totals.reduce((a,b)=>a+b,0)/totals.length):0;
  const label=$("risk-indicator");if(label){label.textContent="今の時間割の平均単位取得見込：約"+avg+"%　※履修を増やすと再計算されます。";label.className="risk-indicator"+(avg<50?" risky":"")}
 }
};
const priorCourses=renderCourses;
renderCourses=function(){
 priorCourses();
 const el=$("course-list");
 const all=[...el.querySelectorAll(".course")];
 for(const button of all){
  const c=state.offers.find(x=>x.id===button.dataset.courseId);
  if(!c)continue;
  const sub=button.querySelector(".course-extra");
  if(sub)sub.textContent="単位取得見込 "+passChance(c)+"% ／ "+c.credits+"単位 ／ "+c.method;
 }
 const mode=$("course-sort").value||"available";
 const compare=(a,b)=>{
  const aa=state.offers.find(c=>c.id===a.dataset.courseId),bb=state.offers.find(c=>c.id===b.dataset.courseId);
  if(!aa||!bb)return 0;
  const selected=(Number(state.selectedIds.includes(bb.id))-Number(state.selectedIds.includes(aa.id)));
  if(selected)return selected;
  if(mode==="chance")return passChance(bb)-passChance(aa);
  if(mode==="risk")return passChance(aa)-passChance(bb);
  if(mode==="credits")return bb.credits-aa.credits;
  if(mode==="difficulty")return bb.diff-aa.diff;
  if(mode==="weekday")return Math.min(...aa.slots)-Math.min(...bb.slots);
  return Number(allowed(bb).ok)-Number(allowed(aa).ok)||passChance(bb)-passChance(aa);
 };
 all.sort(compare).forEach(node=>el.append(node));
};
const priorDrawer=openCourse;
openCourse=function(id){
 priorDrawer(id);
 const c=state?.offers.find(x=>x.id===id);if(!c)return;
 const container=$("drawer-detail");
 for(const block of container.querySelectorAll(".info")){
  const b=block.querySelector("b"),sp=block.querySelector("span");
  if(b?.textContent==="取得時スコア（基本点）"||b?.textContent==="基本スコア"){
   b.textContent="単位取得時の基本点";
   if(sp)sp.textContent=c.credits+"単位×100pt="+fmt(c.credits*100)+"pt（連続取得ボーナスは成績発表時）";
  }
  if(b?.textContent==="履修対象"&&sp)sp.textContent=(Math.floor(state.semester/2)+1)+"年生";
 }
};
const priorReveal=renderReveal;
renderReveal=function(){
 priorReveal();
 if(!state||state.phase!=="reveal")return;
 const num=state.revealIndex,latest=num>0?state.results[num-1]:null;
 const details=$("reveal-breakdown");
 const h=state.history.find(x=>x.term===state.semester);
 if(latest)details.textContent=scoreDetails(latest)+(h&&num===state.results.length&&h.bonus?" ／ 学期ボーナス +"+fmt(h.bonus)+"pt"+(h.perfect?"（PERFECT +350pt":"（")+(h.perfect&&h.bonus>350?"、活動 +"+fmt(h.bonus-350)+"pt":"")+")":"");
 else details.textContent="1単位につき100pt。取得が続くと追加ボーナス（最大250pt）。";
 // Show transparent point breakdown in the course-by-course result log.
 const rows=$("reveal-log").querySelectorAll(".reveal-row");
 for(let i=0;i<num&&i<rows.length;i++){
  const r=state.results[i],b=rows[i].querySelector("b");
  if(b&&r.pass&&!(r.course.annual&&state.semester%2===0))b.textContent="+"+fmt(r.earned)+"pt（"+r.credits+"単位＋連続"+Math.max(0,r.earned-r.credits*100)+"pt）";
 }
 const trip=$("trip-event");
 const pending=Boolean(state.tripPending&&state.semester===7);
 trip.classList.toggle("hidden",!pending);
 $("reveal").classList.toggle("trip-pending",pending);
 if(pending){$("skip-btn").classList.add("hidden");$("next-btn").classList.add("hidden")}
};
const oldPlay=playReveal;
playReveal=function(){if(state?.tripPending)return;oldPlay()};
const oldBegin=beginReveal;
beginReveal=function(){
 if(creditLoad()<10)return;
 oldBegin();
 if(state.semester!==7||!state.travelEvent?.active)return;
 clearTimeout(revealTimer);
 state.tripPending=true;
 $("trip-event-description").textContent="卒業旅行の予定が予想以上に長引いた！ 今学期の全講義の単位取得率が18ポイント下がっています。";
 save();renderReveal();
};
$("trip-event-continue").onclick=()=>{
 if(!state?.tripPending)return;
 state.tripPending=false;save();renderReveal();playReveal()
};
const oldEnd=endReveal;
endReveal=function(){oldEnd();if(state?.phase==="reveal"&&state.revealIndex===state.results.length)renderReveal()};
const oldAdvance=advance;
advance=function(){oldAdvance();scrollToBeginning()};
$("begin-btn").onclick=()=>start();
$("resume-btn").onclick=resume;
$("next-btn").onclick=advance;
$("course-sort").onchange=()=>{if(state?.phase==="registration")renderCourses()};
$("retry-btn").addEventListener("click",()=>setTimeout(scrollToBeginning,30));
$("same-seed-btn").addEventListener("click",()=>setTimeout(scrollToBeginning,30));
displayIntro();
})();