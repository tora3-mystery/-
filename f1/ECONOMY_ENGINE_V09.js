/* F1 v0.9 economy-only prototype. Not imported by current f1/index.html.
 * The complaint ticket UI, HQ replies and existing anomaly story are integrated later.
 */
function f1NewEconomy() {
  return {day:1,attraction:7,complaints:[2,1,1,1],scheduled:[],counts:{},lastId:null,
    days:[],totalSales:0,lowSalesStreak:0,ending:null,endingReason:null};
}
const f1Clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const f1TotalComplaints=s=>s.complaints.reduce((a,b)=>a+b,0);
const f1ProjectedSales=s=>Math.max(0,30+10*s.attraction-10*f1TotalComplaints(s));
function f1AvailableActions(s,catalog) {
  if(s.ending)return [];
  const available=catalog.actions.filter(a=>a.active&&s.day>=a.minDay&&s.day<=a.maxDay&&
    a.id!==s.lastId&&(a.repeatable||!(s.counts[a.id]||0))&&
    (s.day+a.effectAfterDays<=8||a.attractionToday>0));
  const score=a=>a.complaintDelta.reduce((v,x,i)=>v+Math.min(s.complaints[i],Math.max(0,-x))*3-Math.max(0,x),0)
    +a.attractionToday*2+a.attractionOnCompletion*2-(a.effectAfterDays-1);
  const picks=[];
  function take(roles){const arr=available.filter(a=>roles.includes(a.role)&&!picks.includes(a))
    .sort((a,b)=>score(b)-score(a)||a.id.localeCompare(b.id));if(arr.length)picks.push(arr[0]);}
  take(["quick"]);take(["long"]);take(["promotion"]);take(["suppression"]);take(["attraction","long"]);take(["kpi"]);
  for(const a of available.sort((a,b)=>score(b)-score(a)||a.id.localeCompare(b.id))){
    if(picks.length>=6)break;
    if(!picks.includes(a))picks.push(a);
  }
  return picks.slice(0,6);
}
function f1ApplyPending(s,openingDay) {
  for(const x of s.scheduled.filter(x=>x.dueDay===openingDay)){
    s.attraction=f1Clamp(s.attraction+x.attraction,0,10);
    s.complaints=s.complaints.map((v,i)=>f1Clamp(v+x.delta[i],0,5));
  }
}
function f1TakeAction(s,catalog,id){
  if(s.ending)throw Error("Game already ended");
  const current=f1AvailableActions(s,catalog),action=current.find(a=>a.id===id);
  if(!action)throw Error("Unavailable action: "+id+" on day "+s.day);
  const updated=JSON.parse(JSON.stringify(s));
  updated.counts[id]=(updated.counts[id]||0)+1;updated.lastId=id;
  const before={attraction:updated.attraction,complaints:[...updated.complaints],forecast:f1ProjectedSales(updated)};
  updated.attraction=f1Clamp(updated.attraction+action.attractionToday,0,10);
  const sales=f1ProjectedSales(updated);
  updated.totalSales+=sales;
  updated.lowSalesStreak=sales<40?updated.lowSalesStreak+1:0;
  updated.days.push({day:updated.day,id,action:action.name,attraction:updated.attraction,
    complaints:[...updated.complaints],sales,salesBefore:before.forecast,completionDay:updated.day+action.effectAfterDays});
  const delta=action.complaintDelta.map(x=>x<0&&action.repeatable&&updated.counts[id]>=3?0:x);
  updated.scheduled.push({dueDay:updated.day+action.effectAfterDays,attraction:action.attractionOnCompletion,delta,actionId:id});
  if(sales===0){updated.ending="normal_strain";updated.endingReason="閉店";return updated;}
  if(updated.day>=4&&updated.lowSalesStreak>=2){updated.ending="normal_strain";updated.endingReason="店長交代";return updated;}
  if(updated.day===7){
    f1ApplyPending(updated,8);
    const complaints=f1TotalComplaints(updated);
    if(updated.totalSales>=510&&complaints<=3) updated.ending="normal_success";
    else if(updated.totalSales>=470&&complaints>=4) updated.ending="normal_customer";
    else updated.ending="normal_strain";
    return updated;
  }
  updated.day++;
  f1ApplyPending(updated,updated.day);
  return updated;
}
if(typeof module!=="undefined"&&module.exports)module.exports={
 f1NewEconomy,f1AvailableActions,f1TakeAction,f1ProjectedSales,f1TotalComplaints
};
