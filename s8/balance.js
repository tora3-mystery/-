"use strict";
/* S8 v0.4.0 — student-life and risk balance layer (after game.js and expansion.js) */
(function(){
const TARGETS=[16,34,54,72];
const OVERVIEW={
 humanities:["じっくりレポートに向き合う文学部生活","授業の自由度は高いが、毎期の提出物が勝負。"],
 economics:["数字と経営を学ぶ、バランス型の学生生活","必修と選択を組み合わせ、安定した進級を狙う。"],
 science:["実験と演習に追われる理工系の学生生活","難しい必修が多く、過密な時間割ほど危険。"]
};
const ACT_TEXT={
 none:"勉強中心。失敗が少なく、単位取得に集中できる。",
 club:"文化系サークル。放課後に週2コマの活動。",
 job:"塾講師。週3コマの固定シフト（連続勤務を含む）。",
 sports:"体育会系。週3コマの練習で自由時間が減る。",
 combo:"サークル＋アルバイト。週5コマを活動に使う。"
};
const ACT_LOAD={none:0,club:2,job:3,sports:3,combo:5};
Object.assign(ACTIVITIES,{
 club:{...ACTIVITIES.club,name:"文化系サークル",desc:"週2コマ・曜日は学期ごとに変動／取得率は少し有利"},
 job:{...ACTIVITIES.job,name:"塾講師バイト",desc:"週3コマ（連続2コマ＋1コマ）／時間割を圧迫"},
 sports:{...ACTIVITIES.sports,name:"体育会系（難）",desc:"週3コマの練習・土曜も活動／取得率-7%"},
 combo:{...ACTIVITIES.combo,name:"サークル＋バイト（激難）",desc:"週5コマ・サークル2＋バイト3／取得率-9%"}
});
let lastSelectionSound=null;
function indexOfTime(s){return DAYS.indexOf(s[0])*5+Number(s.slice(1))-1}
function readable(s){return DAYS[Math.floor(s/5)]+"曜"+(s%5+1)+"限"}
function seededNumber(label){
 let v=hashSeed(String(state?.seed||"")+"|"+label);
 return ()=>{v=(Math.imul(v,1664525)+1013904223)>>>0;return v/4294967296}
}
function shuffled(list,rng){const a=list.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
const HIGH_REQUIRED={
 humanities:[[["月2"]],[["金2"]],[["月2"]],[["金2"]],[["月2"]],[["金2"]]],
 economics:[[["月2"]],[["金2"]],[["月2"]],[["金2"]],[["月2"]],[["金2"]]],
 science:[[["月2"],["水3","水4"]],[["金2"],["水3","水4"]],[["月2"]],[["金2"]],[["月2"]],[["金2"]]]
};
function mandatorySlots(term){
 const current=term<2?MUST[state.faculty][term].flatMap(c=>c.slotSets[0].map(indexOfTime)):HIGH_REQUIRED[state.faculty][term-2].flatMap(slots=>slots.map(indexOfTime));
 const returns=(state.failedRequired||[]).filter(f=>{
  const first=f.firstFailedTerm??f.failedTerm??f.term??0;
  return (term===7&&first<7)||(term>=(f.retryEligibleTerm??first+2)&&term%2===first%2);
 }).flatMap(f=>f.slots);
 return [...new Set(current.concat(returns))];
}
function generateActivity(term){
 const name=state.activity,forbidden=new Set(mandatorySlots(term));
 if(term%2===1)for(const a of (state.annualCourses||[]))for(const s of a.course.slots)forbidden.add(s);
 const rng=seededNumber("activity/"+term+"/"+name);
 const weekdays=["月","火","水","木","金"];
 // Model weekday evenings and a smaller Saturday commitment, with no overlap with mandatory/annual.
 const safe=arr=>arr.length===ACT_LOAD[name]&&new Set(arr).size===arr.length&&arr.every(s=>!forbidden.has(indexOfTime(s)));
 const plans=[];
 if(name==="none")return[];
 const sat=["土2","土3","土4"];
 if(name==="club"){
  for(const a of weekdays)for(const b of weekdays)if(a!==b)plans.push([a+"5",b+"5"]);
 }
 if(name==="job"){
  for(const d of weekdays)for(const e of weekdays.concat(["土"]))if(d!==e){
   for(const other of (e==="土"?sat:[e+"5"])){plans.push([d+"4",d+"5",other])}
  }
 }
 if(name==="sports"){
  for(const a of weekdays)for(const b of weekdays)if(a!==b)for(const s of sat)plans.push([a+"5",b+"5",s]);
 }
 if(name==="combo"){
  // Circle two evenings, tutoring one contiguous pair, plus one Saturday shift.
  for(const a of weekdays)for(const b of weekdays)for(const c of weekdays)
   if(new Set([a,b,c]).size===3)for(const s of sat)
    plans.push([a+"5",b+"5",c+"4",c+"5",s]);
 }
 const valid=shuffled(plans,rng).find(safe);
 // All models have feasible candidates in the currently defined academic timetable.
 return (valid||[]).map(indexOfTime)
}
getActivityBlocks=function(){
 if(!state)return[];
 if(!state.activitySlotsByTerm)state.activitySlotsByTerm={};
 const key=String(state.semester);
 if(!Array.isArray(state.activitySlotsByTerm[key])){
  state.activitySlotsByTerm[key]=generateActivity(state.semester);
 }
 return state.activitySlotsByTerm[key];
};
const previousStart=start;
start=function(seed){
 previousStart(seed);
 state.balanceVersion="0.4.0";
 save();render();
};
const previousResume=resume;
resume=function(){
 previousResume();
 if(!state)return;
 if(state.phase==="registration"){
  // Remove only electives colliding with a newly generated semester activity assignment.
  const kept=state.selectedIds.slice();let dropped=0;state.selectedIds=[];
  for(const id of kept){
   const c=state.offers.find(x=>x.id===id);
   if(c&&allowed(c).ok)state.selectedIds.push(id);else dropped++;
  }
  if(dropped)showToast("活動日変更で"+dropped+"科目の登録を解除しました");
  save();render();
 }
};
function plannedSubjects(course){
 const courses=allRegistered().slice();
 if(course&&!courses.some(c=>c.id===course.id))courses.push(course);
 return courses
}
function allOccupiedPositions(courses){
 const used=new Set(getActivityBlocks());
 for(const x of courses)for(const pos of x.slots)used.add(pos);
 return used
}
passChance=function(c){
 const subjects=plannedSubjects(c);
 const load=subjects.reduce((n,x)=>n+x.credits,0);
 const positions=allOccupiedPositions(subjects);
 const term=state.semester,yr=Math.floor(term/2)+1;
 let p=97-(c.diff-1)*9+FACULTIES[state.faculty].risk+ACTIVITIES[state.activity].modifier;
 if(state.activity==="club"&&c.method==="レポート")p+=4;
 // Fatigue from densely occupied timetables, regardless of course credit density.
 p-=Math.max(0,positions.size-7)*1.6;
 p-=Math.max(0,load-12)*1;
 // Morning classes, Saturday, and the first period of adjacent courses are risky.
 if(c.slots.some(s=>s%5===0))p-=9;
 if(c.slots.some(s=>Math.floor(s/5)===5))p-=12;
 if(c.slots.some(s=>s%5<4&&positions.has(s+1)))p-=5;
 // Growing tendency to skip lectures as students progress.
 p-=(yr-1)*4;
 if(c.type==="annualCarry")p+=c.midtermOk?9:-10;
 return Math.round(Math.max(25,Math.min(98,p)));
};
points=function(c,combo){return c.credits*100+Math.min(5,Math.max(0,combo-1))*50};
const previousIntro=displayIntro;
displayIntro=function(){
 previousIntro();
 const el=$("student-profile");if(!el)return;
 const f=facultyChoice,a=activityChoice;
 const number=({humanities:1,economics:2,science:3}[f])+({none:0,club:1,job:2,sports:3,combo:4}[a]);
 const lv=number<=2?"ゆったり":number<=4?"標準":number<=5?"忙しい":"かなり過酷";
 el.replaceChildren();
 const title=document.createElement("strong");title.textContent="学生生活："+FACULTIES[f].name+" × "+ACTIVITIES[a].name;el.append(title);
 const label=document.createElement("div");label.className="student-rating";label.textContent="総合難易度： "+"★".repeat(number)+"☆".repeat(7-number)+"　"+lv;el.append(label);
 const desc=document.createElement("p");desc.textContent=OVERVIEW[f][0]+"。"+ACT_TEXT[a]+" "+OVERVIEW[f][1];el.append(desc);
 const footer=document.createElement("small");footer.textContent="※目安。活動曜日は学期ごとにシードから決定。学年が上がるほど欠席リスクが増えます。";el.append(footer)
};
const previousRender=render;
render=function(){
 previousRender();
 if(!state||state.phase==="end")return;
 const year=Math.floor(state.semester/2)+1;
 const goal=TARGETS[year-1],delta=Math.max(0,goal-state.credits);
 const stage=$("year-stage-goal");
 stage.textContent="🎓 "+year+"年次の進級ライン：累計"+goal+"単位 ／ 現在"+state.credits+"単位 ／ あと"+delta+"単位";
 stage.classList.toggle("danger",state.semester%2===1&&delta>14);
 const days=getActivityBlocks().map(readable);
 $("activity-schedule").textContent=days.length?"今期の活動："+days.join("・")+" （"+days.length+"コマ）":"活動なし・学業優先";
 $("summary-line").textContent="登録 "+allRegistered().length+"科目／"+creditLoad()+"単位 ｜ 全"+allOccupiedPositions(allRegistered()).size+"コマ占有 ｜ 取得率は過密・1限・土曜・連続授業で低下";
};
const previousRenderCourses=renderCourses;
renderCourses=function(){
 previousRenderCourses();
 for(const b of $("course-list").querySelectorAll(".course")){
  const label=b.querySelector(".course-name")?.textContent||"";
  const c=state.offers.find(x=>label.includes(x.name));
  if(!c)continue;
  const sub=b.querySelector(".course-extra");
  if(sub)sub.textContent="単位取得見込 "+passChance(c)+"%"+(c.annual?" ／ 通年4単位":"")+" ／ "+(c.method||"");
 }
};
const previousOpenCourse=openCourse;
openCourse=function(id){
 previousOpenCourse(id);
 const c=state.offers.find(x=>x.id===id);if(!c)return;
 const fields=$("drawer-detail").querySelectorAll(".info");
 for(const box of fields){const b=box.querySelector("b");if(b?.textContent==="基本スコア")b.textContent="取得時スコア（基本点）";if(b?.textContent==="単位取得目安")b.textContent="単位取得見込（時間割の負荷込み）"}
 const notes=document.createElement("div");notes.className="info wide";notes.textContent="取得率には難易度・学年・1限・土曜日・連続授業・時間割の過密度が影響します。";$("drawer-detail").append(notes)
};
function injectMandatoryResult(){
 const box=$("year-stage-result");if(!box)return;
 box.classList.add("hidden");
 if(!state||state.phase!=="reveal"||state.revealIndex<state.results.length||state.semester%2===0)return;
 const yr=Math.floor(state.semester/2)+1,goal=TARGETS[yr-1];
 const missing=(state.failedRequired||[]).filter(x=>!state.passedIds.includes(x.canonicalId));
 const missingPlacement=(state.placementFailure||[]).length;
 const passedCredits=state.credits>=goal;
 const ok=passedCredits&&(yr<4||(missing.length===0&&missingPlacement===0));
 box.className="year-stage-result "+(ok?"cleared":"failed");
 box.textContent=yr===4
  ?(ok?"🎓 卒業条件達成！":"❌ GAME OVER｜卒業要件未達")+"　累計"+state.credits+" / "+goal+"単位　未取得必修"+missing.length+"科目"+(missingPlacement?"　必修配置不能"+missingPlacement+"件":"")
  :(ok?"🎓 "+yr+"年次CLEAR！":"⚠ "+yr+"年次の進級要件不足")+"　累計"+state.credits+" / "+goal+"単位"+(!ok?"　このまま進むと留年判定。":"");
};
const previousRenderReveal=renderReveal;
renderReveal=function(){
 previousRenderReveal();
 if(!state)return;
 injectMandatoryResult();
 const event=$("jobhunt-event");
 event.classList.toggle("hidden",!state.jobHuntPending);
 if(state.jobHuntPending)$("skip-btn").classList.add("hidden");
};
const oldBegin=beginReveal;
beginReveal=function(){
 
 oldBegin();
 if(state.semester!==6)return;
 clearTimeout(revealTimer);
 const pool=state.results.filter(r=>!r.lotteryLost&&!r.course.annual&&!r.required);
 const fallback=state.results.filter(r=>!r.lotteryLost&&!r.course.annual);
 const selected=(pool.length>=3?pool:fallback).slice().sort((a,b)=>hashSeed(state.seed+"|recruit|"+a.id)-hashSeed(state.seed+"|recruit|"+b.id)).slice(0,Math.min(3,fallback.length));
 for(const r of selected){r.pass=false;r.lotteryLost=false;r.jobHunt=true}
 state.jobHuntPending=true;state.jobHuntCount=selected.length;
 $("jobhunt-description").textContent="企業説明会と面接が突然集中！ "+selected.length+"科目が一斉に落単候補になりました。成績発表で結果を確認してください。";
 save();renderReveal();playUrgent()
};
function playUrgent(){
 try{
  if(localStorage.getItem("s8_audio_v030")==="off")return;
  const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;
  const ctx=new Audio();
  [380,280,210].forEach((hz,i)=>{
   const t=ctx.currentTime+i*.12,o=ctx.createOscillator(),g=ctx.createGain();
   o.type="sawtooth";o.frequency.value=hz;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.045,t+.02);g.gain.exponentialRampToValueAtTime(.0001,t+.13);o.connect(g);g.connect(ctx.destination);o.start(t);o.stop(t+.15)
  });setTimeout(()=>ctx.close().catch(()=>{}),1000);
 }catch(e){}
}
$("jobhunt-continue").onclick=()=>{
 if(!state||!state.jobHuntPending)return;
 state.jobHuntPending=false;save();$("jobhunt-event").classList.add("hidden");renderReveal();playReveal()
};
const originalPlayReveal=playReveal;
playReveal=function(){if(state?.jobHuntPending)return;originalPlayReveal()};
const originalEndReveal=endReveal;
endReveal=function(){originalEndReveal();injectMandatoryResult()};
const oldAdvance=advance;
advance=function(){
 if(!state||state.phase!=="reveal"||state.revealIndex<state.results.length)return;
 const year=Math.floor(state.semester/2)+1;
 if(state.semester%2===1&&state.semester<7&&state.credits<TARGETS[year-1]){
  clearTimeout(revealTimer);state.stageFailYear=year;state.phase="end";save();render();window.scrollTo(0,0);return
 }
 oldAdvance()
};
const oldRenderEnd=renderEnd;
renderEnd=function(){
 if(!state.stageFailYear){oldRenderEnd();return}
 const el=$("ending-content");el.replaceChildren();
 const h=document.createElement("h2");h.textContent=state.stageFailYear+"年次 留年";el.append(h);
 const s=document.createElement("div");s.className="hero-score";s.textContent="進級要件 未達";el.append(s);
 const p=document.createElement("p");p.textContent="累計"+state.credits+"単位 ／ 必要"+TARGETS[state.stageFailYear-1]+"単位。進級要件を満たせなかったため、来年度のスキル3択は発生しません。時間割を組み直して再挑戦してください。";el.append(p);
 const details=document.createElement("p");details.className="smallhint";details.textContent="SCORE "+fmt(state.score)+" pt · 学生生活："+FACULTIES[state.faculty].name+" × "+ACTIVITIES[state.activity].name;el.append(details);
};
const oldRetry=$("retry-btn").onclick;
$("retry-btn").onclick=()=>{try{localStorage.removeItem("s8_save_v030")}catch(e){}oldRetry()};
const oldSameSeed=$("same-seed-btn").onclick;
$("same-seed-btn").onclick=()=>{state.stageFailYear=null;oldSameSeed()};
$("register-btn").onclick=()=>beginReveal();
$("next-btn").onclick=()=>advance();
$("resume-btn").onclick=()=>resume();
displayIntro();
})();