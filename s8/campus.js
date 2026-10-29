"use strict";
/* S8 v0.5.2: campus switching, visible travel blocks and no impossible campus adjacency. */
(function(){
const MAIN_CAMPUS="中央キャンパス",SPECIAL_CAMPUS="専門キャンパス";
const specials=new Set(["program2","statistics2","entre","writingAdv","engineering","engineering2","engineering3","engineering4"]);
const facultySpecialIds=new Set(Object.values(SPECIALS).flat().map(c=>c.id));
const advancedIds=new Set(["seminar_lit","seminar_culture","thesis_lit","seminar_econ","seminar_data","thesis_econ","seminar_sci","seminar_math","thesis_sci"]);
function needsSpecialty(course,term){
 return term>=4&&(advancedIds.has(course.canonicalId||course.id)||facultySpecialIds.has(course.canonicalId||course.id)||specials.has(course.canonicalId||course.id))
}
const oldMaterialize=courseMaterialize;
courseMaterialize=function(x,term,required=false){
 const c=oldMaterialize(x,term,required);
 c.campus=needsSpecialty(c,term)?SPECIAL_CAMPUS:MAIN_CAMPUS;
 return c
};
function campusOf(c){return c.campus||MAIN_CAMPUS}
function movements(courses){
 const schedules=Array.from({length:6},()=>[]);
 const taken=new Map(),travel=new Map(),issues=[];
 for(const c of courses){
  for(const slot of c.slots){
   if(taken.has(slot)){issues.push("overlap "+slot);continue}
   taken.set(slot,c);schedules[Math.floor(slot/5)].push({slot,c,campus:campusOf(c)});
  }
 }
 for(let day=0;day<6;day++){
  const lessons=schedules[day].sort((a,b)=>a.slot-b.slot);
  for(let i=0;i<lessons.length;i++){
   const now=lessons[i],next=lessons[i+1],p=now.slot;
   if(next&&now.campus!==next.campus){
    if(next.slot===p+1){issues.push("adjacent-campuses "+p+"->"+next.slot);continue}
    if(p%5<4)travel.set(p+1,{from:now.campus,to:next.campus});
   }else if(!next&&now.campus!==MAIN_CAMPUS&&p%5<4){
    travel.set(p+1,{from:now.campus,to:MAIN_CAMPUS});
   }
  }
 }
 for(const [p] of travel)if(taken.has(p))issues.push("travel-collides-class "+p);
 return{travel,issues}
}
function asTravelCourses(){
 const scheduled=allRegistered();
 return movements(scheduled)
}
const oldOccupied=occupied;
occupied=function(){
 const used=oldOccupied();
 if(!state)return used;
 const info=asTravelCourses();
 for(const [p,trip] of info.travel){
  if(!used.has(p))used.set(p,{id:"travel_"+p,canonicalId:"travel_"+p,name:"移動時間",slots:[p],type:"travel",campus:trip.to,credits:0});
 }
 return used
};
const oldAllowed=allowed;
allowed=function(c){
 if(!state)return{ok:false,reason:"履修開始前です。"};
 if(c.type==="required"||c.type==="annualCarry"||state.selectedIds.includes(c.id)||c.prereq&&!state.passedIds.includes(c.prereq)){
  return oldAllowed(c)
 }
 const registered=allRegistered();
 const taken=new Set(registered.flatMap(x=>x.slots)),activity=new Set(getActivityBlocks());
 for(const p of c.slots){
  if(taken.has(p))return{ok:false,reason:"ほかの授業と時間が重なっています。"};
  if(activity.has(p))return{ok:false,reason:"課外活動と時間が重なっています。"};
 }
 const movement=movements(registered.concat(c));
 if(movement.issues.length)return{ok:false,reason:"別キャンパスへの移動には空き時間が必要です。"};
 for(const [p]of movement.travel)if(activity.has(p))return{ok:false,reason:"移動時間と課外活動が重なります。"};
 return{ok:true,reason:campusOf(c)===SPECIAL_CAMPUS?"専門キャンパスの講義。移動のコマも確保されます。":"時間割に登録できます。"}
};
const oldChance=passChance;
passChance=function(c){
 const normal=oldChance(c);
 if(!state)return normal;
 const classes=allRegistered().filter(x=>x.id!==c.id).concat(c);
 const moves=movements(classes).travel.size;
 return Math.max(5,Math.round(normal-Math.min(12,moves*2)));
};
const oldRenderGrid=renderGrid;
renderGrid=function(target,interactive){
 oldRenderGrid(target,interactive);
 if(!state)return;
 const travels=asTravelCourses().travel;
 for(const [pos,detail]of travels){
  const day=Math.floor(pos/5),period=pos%5;
  const el=target.children[8+period*7+day];
  if(el){
   el.classList.add("travel");el.classList.remove("optional");
   const lbl=el.querySelector(".cn");
   if(lbl)lbl.textContent="↔ 移動時間";
   el.setAttribute("title",detail.from+" → "+detail.to);
  }
 }
};
const oldRender=render;
render=function(){
 oldRender();if(!state||state.phase==="end")return;
 const label=$("campus-summary");if(label){
  if(state.semester<4){label.textContent="授業は原則、中央キャンパスで行われます。";}
  else{
   const trips=asTravelCourses().travel.size;
   label.textContent="🏫 3年生以降は中央・専門の2キャンパス。キャンパスが変わる日は移動時間が必要です。今期の移動："+trips+"コマ";
  }
 }
};
const oldOpenCourse=openCourse;
openCourse=function(id){
 oldOpenCourse(id);
 const c=state?.offers.find(x=>x.id===id);if(!c)return;
 const wrapper=$("drawer-detail");
 const b=document.createElement("div");b.className="info wide";
 const title=document.createElement("b");title.textContent="キャンパス間移動";
 const content=document.createElement("span");
 content.textContent=campusOf(c)===SPECIAL_CAMPUS?"専門キャンパス。前後に中央キャンパスの講義がある場合、原則1コマの移動時間が必要です。":"中央キャンパス。専門キャンパスへの切替には移動時間が必要です。";
 b.append(title,content);wrapper.append(b)
};
const oldResume=resume;
resume=function(){
 oldResume();
 if(!state)return;
 if(state.semester>=4){
  for(const c of state.offers||[])if(c.type!=="annualCarry")c.campus=needsSpecialty(c,state.semester)?SPECIAL_CAMPUS:MAIN_CAMPUS;
  if(state.phase==="registration"){
   const ids=state.selectedIds.slice();state.selectedIds=[];
   let reset=0;
   for(const id of ids){
    const c=state.offers.find(x=>x.id===id);
    if(c&&allowed(c).ok)state.selectedIds.push(id);else reset++
   }
   if(reset)showToast("キャンパス移動と重なる科目"+reset+"件を解除しました");
   save();render()
  }
 }
};
$("resume-btn").onclick=resume;
})();
