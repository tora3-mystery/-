// B1 α0.4.2 replay QA. Run: node b1/test-replay-v042.cjs
const fs = require("node:fs");
const vm = require("node:vm");
const assert = require("node:assert/strict");
const html = fs.readFileSync(__dirname + "/index.html", "utf8");
const source = html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert(source, "Inline game script was not found.");
const storage = {};
const dom = {innerHTML: "", addEventListener() {}};
const sandbox = {
  document: {getElementById: () => dom},
  window: {matchMedia: () => ({matches: false}), scrollTo() {}},
  localStorage: {getItem: key => storage[key] ?? null, setItem: (key, value) => {storage[key] = value;}}
};
vm.createContext(sandbox);
const hook = [
  "P", "S", "solve", "REPLAY_WINNERS", "REPLAY_BASE", "WINNING_FIXED",
  "LIMITS", "applyReplayCase", "nextReplayCase", "freshV3", "loadV3",
  "interviewV", "ask", "endInterview", "pick", "offerV", "morning",
  "renderResult", "renderV3", "handleV3",
  "setState: x => st = x", "state: () => st"
].join(",");
const testSource = source.replace(/st=loadV3\(\);[\s\S]*$/, "globalThis.game = {" + hook + "};})();");
assert.notEqual(testSource, source, "Could not detach automatic page startup.");
vm.runInContext(testSource, sandbox, {timeout: 120000});
const g = sandbox.game;
assert.equal(g.P.length, 11);
assert.equal(g.S.length, 14);

function fourPersonGroups() {
 const ids = g.P.map(p => p.id), all = [];
 for (let a=0; a<ids.length; a++)
  for (let b=a+1; b<ids.length; b++)
   for (let c=b+1; c<ids.length; c++)
    for (let d=c+1; d<ids.length; d++)
     all.push([ids[a],ids[b],ids[c],ids[d]]);
 return all;
}
const groups=fourPersonGroups();
assert.equal(groups.length,330);
function schedule(team){
 const order=[...team].sort((a,b)=>g.LIMITS[a][1]-g.LIMITS[b][1] || g.LIMITS[a][0]-g.LIMITS[b][0]);
 const days = [[],[],[],[],[],[]];
 function assign(index){
  if(index===order.length)return true;
  const id=order[index], [start,end,offerDue]=g.LIMITS[id];
  for(let day=start;day<=Math.min(end,offerDue,5);day++){
   if(days[day].length>=2)continue;
   days[day].push(id);
   if(assign(index+1))return true;
   days[day].pop();
  }
  return false;
 }
 assert(assign(0),"Cannot schedule "+team.join(""));
 return days;
}
const results={};
for(const preset of ["A","B","C"]){
 g.applyReplayCase(preset);
 for(const p of g.P){
  assert(p.known.every(id=>p.all.includes(id)),preset+": known slot inconsistent for "+p.id);
 }
 const found=groups.filter(ids=>{const r=g.solve(ids,true);return r.filled===13&&!r.issues.length;}).map(x=>x.join(""));
 const expected=g.REPLAY_WINNERS[preset].map(x=>x.join(""));
 assert.deepEqual([...found].sort(),[...expected].sort(),preset+": winning combinations disagree");
 for(const name of found){
  g.setState(g.freshV3());
  g.state().replayCase=preset;
  const days=schedule(name.split(""));
  for(let day=1;day<=5;day++){
   assert.equal(g.state().day,day);
   for(const id of days[day]){
    g.interviewV(id);
    assert.equal(g.state().active,id);
    g.ask(id,0);g.ask(id,1);g.endInterview();g.pick(id);g.offerV(id);
    assert.equal(g.state().status[id],"offered");
   }
   assert(g.state().used<=2,"Daily interview limit exceeded");
   g.morning(day+1,day===5);
  }
  assert.equal(g.state().screen,"result");
  assert.equal(g.state().gameSuccess,true,"Full-day run failed: "+preset+"/"+name);
  assert.equal(g.state().confirmed.length,4);
  assert.equal(g.state().result.filled,13);
 }
 results[preset]={combinations:groups.length,winningSets:found.length,completedRuns:found.length};
}
// Cases must restore the canonical original, not permanently mutate applicants.
g.applyReplayCase("B");
assert(g.P.find(p=>p.id==="m").all.includes("SuD"));
g.applyReplayCase("C");
assert(g.P.find(p=>p.id==="w").all.includes("SaN"));
g.applyReplayCase("A");
assert(!g.P.find(p=>p.id==="m").all.includes("SuD"));
assert(!g.P.find(p=>p.id==="w").all.includes("SaN"));
assert(g.P.find(p=>p.id==="y").all.includes("SuD"));
assert(g.P.find(p=>p.id==="k").all.includes("SuD"));
assert.equal(["A","B","C"].map(g.nextReplayCase).join(""),"BCA");
// Read legacy v0.3/v0.4 session as the initial case.
const legacy=g.freshV3();
delete legacy.replayCase;
storage["b1-v030"]=JSON.stringify(legacy);
assert.equal(g.loadV3().replayCase,"A");
// The end-screen records control must be read-only, reachable and reversible.
g.setState(g.freshV3());
g.state().screen="result";
g.state().interviewed=["s"];
g.state().asked={s:[0,1]};
g.state().result=g.solve([],true);
g.renderV3();
assert(dom.innerHTML.includes('data-action="records"'));
const click=action=>g.handleV3({target:{closest:()=>({dataset:{action}})}});
click("records");
assert.equal(g.state().screen,"records");
assert(dom.innerHTML.includes("佐藤 美咲"));
assert(dom.innerHTML.includes("Q."));
click("result-back");
assert.equal(g.state().screen,"result");
assert(dom.innerHTML.includes("初週の勤務表"));
console.log(JSON.stringify({
 version:"α0.4.2", totalCombinations:groups.length*3,
 results, historyScreen:"pass", legacySave:"pass", reset:"pass",
 oldV040Suite:"Run node b1/test-v040.cjs separately"
},null,2));
