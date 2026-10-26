const fs = require("node:fs");
const vm = require("node:vm");
const assert = require("node:assert/strict");
const html = fs.readFileSync(__dirname + "/index.html", "utf8");
const source = html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert(source, "game script missing");
const testSource = source.replace(/st=loadV3\(\);[\s\S]*$/, `globalThis.game={P,S,solve,LIMITS,WINNING_FIXED,MAIL,freshV3,interviewV,endInterview,pick,offerV,morning,renderResult,ask,setState:x=>st=x,getState:()=>st};})();`);
const sandbox = {};
vm.createContext(sandbox);
vm.runInContext(testSource, sandbox);
const g = sandbox.game;
assert.equal(g.P.length,11);
assert.equal(g.S.length,14);
assert.equal(g.P.map(p=>p.id).join(""),"tshyngkimow");
for(const p of g.P){
  assert.equal(p.qs.length,4);
  assert(g.MAIL[p.id]?.accept && g.MAIL[p.id]?.withdraw);
}
const wins=[];
let combos=0;
for(let a=0;a<11;a++)for(let b=a+1;b<11;b++)for(let c=b+1;c<11;c++)for(let d=c+1;d<11;d++){
 const ids=[a,b,c,d].map(i=>g.P[i].id), result=g.solve(ids,true);
 combos++;
 if(result.filled===13 && result.issues.length===0)wins.push(ids);
}
assert.equal(combos,330);
assert.equal(wins.length,11);
assert.equal(wins.map(x=>x.join("")).join(","),g.WINNING_FIXED.map(x=>x.join("")).join(","));
function schedule(ids){
 const byDeadline=[...ids].sort((a,b)=>g.LIMITS[a][1]-g.LIMITS[b][1]);
 const out={},counts=[0,0,0,0,0,0];
 function place(i){
  if(i===byDeadline.length)return true;
  const id=byDeadline[i], [arrival,interviewDeadline,offerDeadline]=g.LIMITS[id];
  for(let day=arrival;day<=Math.min(interviewDeadline,offerDeadline,5);day++){
   if(counts[day]>=2)continue;
   out[id]=day;counts[day]++;
   if(place(i+1))return true;
   counts[day]--;delete out[id];
  }
  return false;
 }
 assert(place(0),"no schedule: "+ids.join(""));
 return out;
}
for(const ids of wins){
 const plan=schedule(ids);
 g.setState(g.freshV3());
 for(let day=1;day<=5;day++){
  const st=g.getState();
  assert.equal(st.day,day);
  for(const id of ids.filter(id=>plan[id]===day)){
   g.interviewV(id);
   assert.equal(g.getState().active,id);
   g.ask(id,0);g.ask(id,1);g.endInterview();g.pick(id);g.offerV(id);
   assert.equal(g.getState().status[id],"offered");
  }
  assert(g.getState().used<=2);
  g.morning(day+1,day===5);
 }
 const st=g.getState();
 assert.equal(st.screen,"result");
 assert.equal(st.confirmed.length,4);
 assert.equal(st.contacted.length,4);
 assert.equal(st.gameSuccess,true,"winning group failed: "+ids.join(""));
 assert.equal(st.result.filled,13);
 assert.equal(st.result.issues.length,0);
}
let state=g.freshV3();g.setState(state);
g.interviewV("s");g.endInterview();g.pick("s");g.offerV("s");
assert.equal(state.status.s,"offered");
g.pick("s");
assert.equal(state.picked.includes("s"),true,"sent offer became reversible");
g.morning(2,false);
assert.equal(state.status.s,"confirmed");
assert.equal(state.messages.find(m=>m.id==="s")?.body,g.MAIL.s.accept);
state=g.freshV3();g.setState(state);
g.morning(2,false);g.morning(3,false);g.morning(4,false);
assert.equal(state.status.n,"withdrawn","expired applicant remains available");
assert.equal(state.archive.find(m=>m.id==="n")?.body.includes(g.MAIL.n.withdraw),true);
const cases=[
 {name:"friend success",ids:["t","s","h","y"],interviewed:4,contacted:4,text:"友人同士の初出勤"},
 {name:"normal success",ids:["s","h","k","i"],interviewed:4,contacted:4,text:"喫茶まどか、本日開店"},
 {name:"full but short",ids:["s","y","m","w"],interviewed:4,contacted:4,text:"採用したのに、人がいません"},
 {name:"interview only",ids:[],interviewed:8,contacted:0,text:"面接だけは大成功"}
];
for(const c of cases){
 const state=g.freshV3();state.confirmed=[...c.ids];state.interviewed=Array(c.interviewed).fill("s");
 state.contacted=Array(c.contacted).fill("s");state.result=g.solve(c.ids,true);
 g.setState(state);assert(g.renderResult().includes(c.text),c.name);
}
console.log(JSON.stringify({applicants:11,combinations:330,winningCombinations:wins.length,winningSchedulesTested:wins.length,maxInterviewsPerDay:2,endingBranches:cases.length,mailProfiles:11,offerLock:"pass",expiry:"pass",winningIds:wins.map(x=>x.join(""))},null,2));
