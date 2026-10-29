"use strict";
/* S8 v0.6.0 — semester grading, stage presentation and final-year petitions */
(function(){
const REST_BONUS=5,REPEAT_BONUS=4,HONOR_BONUS=6;
function playGradeSound(type){
 try{
  if(localStorage.getItem("s8_audio_v030")==="off")return;
  const Context=window.AudioContext||window.webkitAudioContext;
  if(!Context)return;
  const ctx=new Context();
  const notes=type==="perfect"?[523,659,784,1046]:type==="success"?[580,800]:[330,235];
  notes.forEach((note,i)=>{
   const begin=ctx.currentTime+i*.09,osc=ctx.createOscillator(),gain=ctx.createGain();
   osc.type=type==="fail"?"triangle":"sine";osc.frequency.value=note;
   gain.gain.setValueAtTime(.0001,begin);
   gain.gain.exponentialRampToValueAtTime(.04,begin+.02);
   gain.gain.exponentialRampToValueAtTime(.0001,begin+.17);
   osc.connect(gain);gain.connect(ctx.destination);osc.start(begin);osc.stop(begin+.18)
  });
  setTimeout(()=>ctx.close().catch(()=>{}),900)
 }catch(e){}
}
const unlockById={
 stats:["データ分析演習","多変量解析"],
 program:["AI活用演習","Web制作入門","実践プログラミング"],
 busA:["ビジネス実験"],
 writing1:["文章表現実践"],
 seminar_lit:["卒業制作演習（4年次）"],
 seminar_econ:["卒業研究演習（4年次）"],
 seminar_sci:["卒業研究実習（4年次）"]
};
function supplements(c){
 if(!state)return {rest:0,repeat:0,honor:0};
 const courses=allRegistered().slice();
 if(!courses.some(x=>x.id===c.id))courses.push(c);
 const activity=new Set(getActivityBlocks());
 const busy=new Set(courses.flatMap(x=>x.slots).concat([...activity]));
 // Monday never receives the preceding-day recovery boost.
 const rest=c.slots.some(x=>{
  const weekday=Math.floor(x/5);
  return weekday>0&&![...busy].some(p=>Math.floor(p/5)===weekday-1)
 })?REST_BONUS:0;
 const repeat=(state.failedRequired||[]).some(f=>f.canonicalId===c.canonicalId)?REPEAT_BONUS:0;
 const honor=state.honorBoostTerm===state.semester?HONOR_BONUS:0;
 return {rest,repeat,honor};
}
const beforeChance=passChance;
passChance=function(c){
 const base=beforeChance(c);
 const b=supplements(c);
 return Math.max(5,Math.min(98,base+b.rest+b.repeat+b.honor))
};
function namedBonuses(c){
 const b=supplements(c),items=[];
 if(b.rest)items.push("前日が全休 +"+b.rest+"pt");
 if(b.repeat)items.push("再履修の経験 +"+b.repeat+"pt");
 if(b.honor)items.push("前学期の優秀生 +"+b.honor+"pt");
 return items
}
const oldGrid=renderGrid;
renderGrid=function(target,interactive){
 oldGrid(target,interactive);
 if(!state||!interactive||state.phase!=="registration")return;
 for(let pos=0;pos<30;pos++){
  const day=Math.floor(pos/5),period=pos%5;
  const cell=target.children[8+period*7+day];
  if(!cell||!cell.classList.contains("slot-action"))continue;
  const offered=state.offers.filter(c=>c.type!=="required"&&c.type!=="annualCarry"&&!state.selectedIds.includes(c.id)&&c.slots.includes(pos));
  const checked=offered.map(c=>({course:c,result:allowed(c)}));
  if(checked.some(x=>x.result.ok))continue;
  // Make unavailable periods understandable even on narrow phone timetables.
  let labelText="候補なし",description="このコマには登録候補の講義がありません。";
  if(checked.length){
   const reasons=checked.map(x=>String(x.result.reason||""));
   const isAll=pattern=>reasons.every(reason=>pattern.test(reason));
   if(isAll(/前提|履修条件|単位が必要/)){
    labelText="前提未修得";
   }else if(isAll(/移動|キャンパス/)){
    labelText="移動不可";
   }else if(isAll(/活動/)){
    labelText="別コマで活動";
   }else if(isAll(/重複|重な|同じコマ|同じ時間/)){
    labelText="時間重複";
   }else{
    labelText="登録条件外";
   }
   const blocks=new Set(getActivityBlocks());
   description=checked.map(x=>{
    const conflicting=x.course.slots.filter(p=>blocks.has(p));
    const detail=conflicting.length?"（"+conflicting.map(p=>DAYS[Math.floor(p/5)]+"曜"+(p%5+1)+"限").join("・")+"が活動時間）":"";
    return x.course.name+"："+x.result.reason+detail
   }).join("／");
  }
  cell.classList.remove("slot-action");
  cell.classList.add("slot-unavailable");
  cell.onclick=null;cell.onkeydown=null;
  cell.removeAttribute("role");cell.removeAttribute("tabindex");
  cell.setAttribute("aria-label",DAYS[day]+"曜"+(period+1)+"限："+labelText+"。"+description);
  cell.setAttribute("title",description);
  const label=cell.querySelector(".cn");if(label)label.textContent=labelText;
 }
};
function unlockLabels(c){
 const id=c.canonicalId||c.id;
 return unlockById[id]||state.offers.filter(x=>x.prereq===id).map(x=>x.name);
}
const previousDrawer=openCourse;
openCourse=function(id){
 previousDrawer(id);
 const c=state?.offers?.find(x=>x.id===id);if(!c)return;
 const unlocks=unlockLabels(c);
 if(unlocks.length){
  const info=document.createElement("div");info.className="info wide unlock-info";
  const title=document.createElement("b");title.textContent="取得後に履修可能になる科目";
  const val=document.createElement("span");val.textContent=unlocks.join(" ／ ");
  info.append(title,val);$("drawer-detail").prepend(info)
 }
 const bonus=namedBonuses(c);
 if(bonus.length){
  const info=document.createElement("div");info.className="info wide";
  const title=document.createElement("b");title.textContent="単位取得率への補正";
  const val=document.createElement("span");val.textContent=bonus.join("・");
  info.append(title,val);$("drawer-detail").append(info)
 }
 const drawer=$("course-drawer").querySelector(".drawer-body");
 if(drawer)drawer.scrollTop=0
};
const previousCourses=renderCourses;
renderCourses=function(){
 previousCourses();
 for(const row of $("course-list").querySelectorAll(".course")){
  const c=state.offers.find(x=>x.id===row.dataset.courseId);if(!c)continue;
  const unlock=unlockLabels(c);
  if(unlock.length){
   const sub=row.querySelector(".course-extra");
   if(sub)sub.textContent+=" ｜ 取得後に履修可能：「"+unlock.slice(0,2).join("・")+"」";
  }
 }
};
function petitionChance(r){
 const c=r.course;
 const basis={"レポート":39,"課題":32,"ゼミ":35,"試験":24,"実験":19,"通年":25}[c.method]||27;
 let p=basis-(c.diff-3)*4+(r.required?5:0)+(r.jobHunt?4:0);
 return Math.max(10,Math.min(52,Math.round(p)))
}
function appealCandidates(){
 return state.results.filter(r=>!r.pass&&!r.lotteryLost&&!(r.course.annual&&state.semester%2===0)&&!state.appealResults?.[r.id])
}
function renderAppeal(){
 const panel=$("appeal-panel");if(!panel)return;
 const active=state?.phase==="reveal"&&state.semester>=6&&state.appealPending&&state.revealIndex===state.results.length;
 panel.classList.toggle("hidden",!active);
 if(!active)return;
 const list=$("appeal-list");list.replaceChildren();
 const candidates=appealCandidates();
 const note=$("appeal-note");
 note.textContent=candidates.length?"落単した科目ごとに一度だけお願いできます。再判定の成功率は教授や科目の難しさによって異なります。":"お願いできる講義は残っていません。";
 for(const r of candidates){
  const item=document.createElement("button");item.className="appeal-option";
  item.setAttribute("aria-label",r.name+"について教授に頼み込む。成功見込"+petitionChance(r)+"%");
  const name=document.createElement("strong");name.textContent=r.name+(r.required?" ★必修":"");
  const detail=document.createElement("small");detail.textContent="教授へのお願い：成功見込 "+petitionChance(r)+"% ／ "+r.course.method+"・難度"+r.course.diff;
  item.append(name,detail);item.onclick=()=>attemptPetition(r.id);list.append(item)
 }
 $("appeal-close").textContent=candidates.length?"頼み込みを終えて次へ":"次へ進む";
 $("skip-btn").classList.add("hidden");$("next-btn").classList.add("hidden");
}
function attemptPetition(id){
 if(!state||!state.appealPending||state.semester<6)return;
 const r=appealCandidates().find(x=>x.id===id);
 if(!r)return;
 const chance=petitionChance(r);
 // Independent seeded draw: resuming, course order and repeated renders cannot reroll.
 const roll=hashSeed(String(state.seed)+"|faculty-petition|"+state.semester+"|"+r.canonicalId)%100;
 state.appealResults ||= {};
 const success=roll<chance;
 state.appealResults[r.id]={success,chance,roll};
 if(success){
  r.pass=true;r.appealed=true;r.earned=r.credits*100;r.combo=0;
  state.score+=r.earned;state.termScore+=r.earned;state.credits+=r.credits;
  if(!state.passedIds.includes(r.canonicalId))state.passedIds.push(r.canonicalId);
  if(r.required)state.failedRequired=state.failedRequired.filter(x=>x.canonicalId!==r.canonicalId);
  const h=state.history.find(x=>x.term===state.semester);
  if(h){h.passes++;h.credits+=r.credits;h.score+=r.earned;h.required?.filter(x=>x.id===r.canonicalId).forEach(x=>x.status="教授の救済で取得")}
  $("appeal-last").textContent="🎓 "+r.name+"：教授が認めてくれた！ "+r.credits+"単位取得";
  $("appeal-last").className="appeal-last success";
  playGradeSound("success")
 }else{
  $("appeal-last").textContent="✕ "+r.name+"：お願いしたが、成績は変わらなかった。";
  $("appeal-last").className="appeal-last fail";playGradeSound("fail")
 }
 save();renderReveal();renderAppeal()
}
function closeAppeals(){
 if(!state||!state.appealPending)return;
 state.appealPending=false;
 state.appealClosedTerm=state.semester;
 save();renderReveal()
}
$("appeal-close").onclick=closeAppeals;
const oldBegin=beginReveal;
beginReveal=function(){
 if(!state||state.phase!=="registration")return;
 state.appealPending=false;state.appealResults={};state.appealClosedTerm=-1;
 state.allRedTerm=-1;state.honorAwardedTerm=-1;
 $("appeal-last").textContent="";$("appeal-last").className="appeal-last";
 oldBegin()
};
const oldEnd=endReveal;
endReveal=function(){
 if(!state||state.phase!=="reveal"||state.revealIndex!==state.results.length)return;
 const first=!state.history.some(h=>h.term===state.semester);
 oldEnd();
 if(!state.results.length)return;
 if(first){
  if(state.results.every(r=>r.pass)){
   state.honorAwardedTerm=state.semester;
   if(state.semester<7)state.honorBoostTerm=state.semester+1;
   playGradeSound("perfect")
  }else if(state.results.every(r=>!r.pass)){
   state.allRedTerm=state.semester;
   playGradeSound("fail")
  }
  if(state.semester>=6&&appealCandidates().length&&state.appealClosedTerm!==state.semester){
   state.appealPending=true;clearTimeout(revealTimer)
  }
  save()
 }
 renderAppeal();renderReveal()
};
const oldReveal=renderReveal;
renderReveal=function(){
 oldReveal();
 if(!state||state.phase!=="reveal")return;
 const isDone=state.revealIndex===state.results.length;
 const special=$("semester-special");
 const allRed=isDone&&state.allRedTerm===state.semester,perfect=isDone&&state.honorAwardedTerm===state.semester;
 special.className="semester-special"+(allRed?" all-red":perfect?" excellent":" hidden");
 const annualInterim=state.semester%2===0&&state.results.some(r=>r.course?.annual);
 special.textContent=allRed?(annualInterim?"🟥 全講義の評価が不合格・要補講でした。":"🟥 ALL RED！ 全講義が落単！"):perfect?("🏅 優秀生！ "+(annualInterim?"全講義の評価を通過！（通年科目の単位は後期末に確定）":"全講義取得！")+(state.semester<7?" 次の学期は全科目+6pt":"")):"";
 renderAppeal()
};
const oldPlay=playReveal;
playReveal=function(){
 if(state?.appealPending)return;
 oldPlay()
};
const oldAdvance=advance;
advance=function(){
 if(state?.appealPending){renderAppeal();return}
 oldAdvance()
};
const oldResume=resume;
resume=function(){
 oldResume();
 if(state?.phase==="reveal"){
  renderReveal();
  if(state.appealPending)clearTimeout(revealTimer)
 }
};
$("resume-btn").onclick=resume;
const oldRender=render;
render=function(){
 oldRender();if(!state||state.phase==="end")return;
 const status=$("academic-bonus-hint");
 if(status){
  const b=state.honorBoostTerm===state.semester;
  status.textContent=b?"🏅 前学期の優秀生成績：今学期の単位取得率が全科目+6pt。":"";
  status.classList.toggle("hidden",!b)
 }
};
})();
