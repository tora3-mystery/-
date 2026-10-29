"use strict";
/* S8 v0.7.2 — Academic aptitudes, visible difficulty, repeat labels and UX review. */
(function(){
const $id=id=>document.getElementById(id);
const SKILL_LABELS=()=>Object.fromEntries((window.S8_SKILL_DEFS||[]).map(s=>[s.id,s.name]));
const APTITUDES={aptitude_pc:"パソコン",aptitude_math:"数学",aptitude_english:"英語"};
const APTITUDE_PATTERNS={
 aptitude_pc:/情報|プログラ|コンピュータ|データ|システム|AI|IT|ソフトウェア|コード|ネットワーク|デジタル|アルゴリズム/i,
 aptitude_math:/数学|微積|統計|計量|解析|数理|確率|線形|代数|幾何|工学数理/i,
 aptitude_english:/英語|英文|英米|英会話|TOEIC|English|英文学|外国語/i
};
function tags(c){
 if(!c)return[];
 if(Array.isArray(c.aptitudeTags))return c.aptitudeTags;
 const text=(c.name||"")+" "+(c.canonicalId||c.id||"");
 return Object.entries(APTITUDE_PATTERNS).filter(([id,re])=>re.test(text)).map(([id])=>id)
}
function failureHistory(){
 if(!state)return;
 if(state.retakeFailures&&state.retakeFailureEvents)return;
 state.retakeFailures={};state.retakeFailureEvents={};
 for(const h of state.history||[])for(const r of h.required||[]){
  if(r.id&&r.status==="落単"){
   const key=h.term+"|"+r.id;if(state.retakeFailureEvents[key])continue;
   state.retakeFailureEvents[key]=true;state.retakeFailures[r.id]=(state.retakeFailures[r.id]||0)+1
  }
 }
 // Preserve at least one failure for retakes present in legacy saved games.
 for(const f of state.failedRequired||[])if(f.canonicalId)
  state.retakeFailures[f.canonicalId]=Math.max(1,state.retakeFailures[f.canonicalId]||0)
}
function cleanName(s){return String(s||"").replace(/^【再履修】/,"").replace(/（再(?:再)*履修）/g,"")}
function retakeName(c){
 const n=Math.max(1,Math.min(6,state.retakeFailures?.[c.canonicalId]||1));
 return cleanName(c.name)+"（"+"再".repeat(n)+"履修）"
}
const oldCreate=createOffers;
createOffers=function(){
 failureHistory();oldCreate();failureHistory();
 for(const c of state.offers||[]){
  c.aptitudeTags=Object.entries(APTITUDE_PATTERNS).filter(([id,re])=>re.test((c.name||"")+" "+(c.canonicalId||c.id||""))).map(([id])=>id);
  if(c.retake)c.name=retakeName(c)
 }
 save()
};
const oldStep=stepReveal;
stepReveal=function(){
 const prev=state?.revealIndex,rec=state?.results?.[prev];
 oldStep();
 if(rec&&state&&state.revealIndex>prev&&!rec.pass&&!rec.lotteryLost&&rec.required){
  failureHistory();
  const key=state.semester+"|"+rec.canonicalId;
  if(!state.retakeFailureEvents[key]){
   state.retakeFailureEvents[key]=true;
   state.retakeFailures[rec.canonicalId]=(state.retakeFailures[rec.canonicalId]||0)+1;
   save()
  }
 }
};
const oldStart=start;
start=function(seed){
 oldStart(seed);
 if(!state)return;
 const selected=document.querySelector('input[name="start-aptitude"]:checked');
 const id=selected?.value;
 if(id&&APTITUDES[id]){
  if(!Array.isArray(state.skills))state.skills=[];
  state.skills.push({id,year:0});
  state.skillEverAcquired=1
 }else state.skillEverAcquired=0;
 failureHistory();
 save();render()
};
const oldChance=passChance;
passChance=function(c){
 const p=oldChance(c);
 if(!state||!c||p>=100)return p;
 if(tags(c).some(id=>(state.skills||[]).some(s=>s.id===id)))return Math.min(98,p+6);
 return p
};
const previousGrid=renderGrid;
renderGrid=function(target,interactive){
 previousGrid(target,interactive);
 if(!state||!target?.children)return;
 const bySlot=occupied();
 for(let period=0;period<5;period++)for(let day=0;day<6;day++){
  const cell=target.children[8+period*7+day],course=bySlot.get(day*5+period);
  if(!cell||!course||!Number.isFinite(course.diff)||course.type==="study"||course.type==="travel")continue;
  cell.classList.add("difficulty-"+Math.min(5,Math.max(1,course.diff)));
  if(course.type==="required")cell.classList.add("difficulty-required")
 }
};
const previousCourses=renderCourses;
renderCourses=function(){
 previousCourses();
 if(!state)return;
 for(const node of $id("course-list").querySelectorAll(".course")){
  const c=state.offers.find(x=>x.id===node.dataset.courseId);
  if(!c)continue;
  node.classList.add("difficulty-"+Math.min(5,Math.max(1,c.diff)));
  const target=node.querySelector(".course-extra");
  const ts=tags(c).map(id=>APTITUDES[id]);
  if(target&&ts.length)target.textContent+=" ｜ 分野："+ts.join("・")
 }
};
const previousDrawer=openCourse;
openCourse=function(id){
 previousDrawer(id);
 const c=state?.offers?.find(x=>x.id===id);if(!c)return;
 const ts=tags(c);if(!ts.length)return;
 const info=document.createElement("div");info.className="info wide";
 const b=document.createElement("b");b.textContent="関連する得意分野";
 const span=document.createElement("span");span.textContent=ts.map(id=>APTITUDES[id]+((state.skills||[]).some(s=>s.id===id)?"（得意・取得率+6pt）":"")).join(" ／ ");
 info.append(b,span);$id("drawer-detail").append(info)
};
function dropSkill(index,button){
 if(!state||state.phase!=="registration"||!state.skills?.[index])return;
 if(button.dataset.confirm!=="yes"){
  button.dataset.confirm="yes";button.textContent="本当に捨てる（取り消せません）";button.classList.add("discard-confirm");return
 }
 const removed=state.skills.splice(index,1)[0];
 const activities=new Set(getActivityBlocks());
 const must=allRegistered().filter(x=>x.type==="required"||x.type==="annualCarry");
 if(must.some(c=>c.slots.some(p=>activities.has(p)))){
  state.skills.splice(index,0,removed);
  showToast("必修と固定活動がぶつかるため今学期は捨てられません。");
  render();return
 }
 const released=[];
 state.selectedIds=state.selectedIds.filter(id=>{
  const c=state.offers.find(x=>x.id===id);
  if(c&&c.slots.some(p=>activities.has(p))){released.push(c.name);return false}
  return true
 });
 state.discardedSkills=(state.discardedSkills||[]).concat([{id:removed.id,semester:state.semester}]);
 save();render();
 showToast("スキルを永久に放棄しました。"+(released.length?"活動と重なる講義 "+released.length+" 件を解除しました。":""))
}
function renderSkills(){
 const box=$id("skill-summary");if(!box||!state||state.phase!=="registration"||!state.skills?.length)return;
 const list=document.createElement("div");list.className="skill-discard-list";
 const labels=SKILL_LABELS();
 state.skills.forEach((s,index)=>{
  const row=document.createElement("div");row.className="skill-discard-row";
  const name=document.createElement("span");name.textContent=labels[s.id]||s.id;
  const button=document.createElement("button");button.className="skill-discard";
  button.type="button";button.textContent="捨てる";button.onclick=()=>dropSkill(index,button);
  row.append(name,button);list.append(row)
 });box.append(list)
}
function renderWarning(){
 if(!state||state.phase!=="registration")return;
 const box=$id("year-stage-goal");if(!box)return;
 const semester=state.semester;if(semester%2!==1)return;
 const year=Math.floor(semester/2)+1,target=window.S8_OPTIONAL_TARGETS[state.faculty][year-1],obtained=state.electiveCredits||0;
 const registered=allRegistered().filter(c=>c.type!=="required"&&(!c.annual||semester%2===1)&&c.canonicalId&&!(state.passedIds||[]).includes(c.canonicalId));
 const theoretical=obtained+registered.reduce((n,c)=>n+c.credits,0);
 if(theoretical<target){
  const warn=document.createElement("div");warn.className="quota-warning";
  warn.textContent="⚠ 今期の全講義を取得しても、進級にあと "+(target-theoretical)+" 単位足りません。選択科目を追加してください。";
  box.append(warn)
 }else if(theoretical===target){
  const hint=document.createElement("div");hint.className="quota-warning borderline";
  hint.textContent="⚠ 今の申請では余裕0単位。1科目でも落とすと進級に届かない可能性があります。";
  box.append(hint)
 }
}
const originalRender=render;
render=function(){
 originalRender();
 if(!state||state.phase==="end")return;
 renderSkills();renderWarning()
};
const originalEnd=renderEnd;
renderEnd=function(){
 originalEnd();
 if(state?.noSkillBonusAwarded&&!state.cheatDisqualified&&!state.stageFailYear){
  const box=$id("ending-content");
  if(box&&!box.querySelector(".no-skill-award")){
   const n=document.createElement("p");n.className="no-skill-award";
   n.textContent="🏆 己の力で卒業！ 4年間スキル取得なしボーナス ＋2,000pt";
   box.append(n)
  }
 }
};
})();
