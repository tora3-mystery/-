"use strict";
/* H1 α0.6.4 | Three useful group questions instead of a round-2-only culprit tell.
 * ROUND 1: a weak habitual phrasing borrowed from another's interview.
 * ROUND 2: the established confidential factual overlap (unchanged).
 * ROUND 3: a cross-case confirmation of the same borrowed method as round 2.
 * Other human candidates can likewise repeat their own styles or be nervous.
 */
const H1_V064_TRIAD={
 soft:[
  "まず関係者への案内をそろえて、作業の行き違いを防ぎたいです。",
  "同じ条件で測った記録を確かめてから決めたいと思います。",
  "最後まで待っている人が困っていないか気になります。",
  "対応中の仕事と完了した仕事を区別するのが先だと思います。"
 ],
 // This is a weaker, transferable paraphrase of the private interview detail.
 echoes:[
  [
   "協力先によって支援の中身が違うなら、分けて考えた方がよいと思います。",
   "案内する向きが違えば、表示する方向も分けるべきだと思います。",
   "終わりの確認まで記録して、作業を完了にしたいです。"
  ],
  [
   "計測する人と調整する人と記録する人は、別に考えたいです。",
   "毎日同じ時刻に動く処理があるか、先に確認するべきだと思います。",
   "何度も条件を変えて試し、最後に差を比較したいです。"
  ],
  [
   "引継ぎが続くなら、担当日を固定するのもよいと思います。",
   "確認したことは、記録の余白にも小さな印を残したいです。",
   "最初の一件だけ一緒に進めて、あとは任せる方法がいいです。"
  ],
  [
   "業務の所要時間を、改善前と後で測って比べたいです。",
   "処理中と完了済みは、札の向きを変えるだけでも区別できます。",
   "反対する経験者にも、最後まで理由を聞きたいと思います。"
  ]
 ],
 // Common-case replies may be hesitant even when entirely human.
 hesitations:[
  "……あ、すみません。先に説明するべきはそこでしたね。",
  "ええと、すみません。質問の前提を取り違えていました。",
  "ちょっと考え込みました。今のケースなら、",
  "……失礼しました。いまの状況についてですね。"
 ],
 tidy(reply,extra){
  const x=stripQuote(reply);
  // A short answer plus one useful comparison, not an extra long monologue.
  const stop=x.indexOf("。");
  const first=(stop>=0?x.slice(0,stop+1):x);
  return "「"+first+" "+extra+"」";
 },
 priorSource(round,idx,monster){
  const others=[0,1,2,3].filter(i=>i!==monster);
  if(round===0)return others[[0,1,2,0,1,2][idx]];
  const previous=state.asked?.find(entry=>entry.round===1);
  const q=previous?.idx??idx;
  return others[[0,1,2,0,1,2][q]];
 }
};
const h164OriginalGroupAnswer=groupAnswer;
groupAnswer=function(round,idx,person){
 const current=h164OriginalGroupAnswer(round,idx,person);
 if(round===1)return current; // preserve hard evidence + standard human noise
 const witness=state.monsterIndex;
 if(person!==witness){
  // A human can hesitate and can keep a consistent worldview across rounds.
  if(round===0 && H1_V050.pick(state.seed,100,636,round,idx,person)<21){
   const hesitation=H1_V064_TRIAD.hesitations[H1_V050.pick(state.seed,4,637,idx,person)];
   return H1_V064_TRIAD.tidy(current,hesitation+" "+H1_V064_TRIAD.soft[person]);
  }
  if(round===2 && H1_V050.pick(state.seed,100,638,round,idx,person)<62)
   return H1_V064_TRIAD.tidy(current,"前にお答えしたとおり、"+H1_V064_TRIAD.soft[person]);
  return current;
 }
 const source=H1_V064_TRIAD.priorSource(round,idx,witness),opt=privateEntry(source)?.option;
 if(opt===undefined)return current; // only the pre-interview state can lack records
 if(round===0){
  // An early, weak behavioral trace: it should trigger suspicion, not solve the case.
  if(H1_V050.pick(state.seed,100,639,round,idx,person)>=76)return current;
  const hint=H1_V064_TRIAD.soft[source];
  return H1_V064_TRIAD.tidy(current,"例えば、"+hint);
 }
 // Third question uses a *different hypothetical* to test the same borrowed
 // thinking shown in the second answer.
 const confirm=H1_V064_TRIAD.echoes[source][opt];
 return H1_V064_TRIAD.tidy(current,"先ほどの案をこの場合にも使うなら、"+confirm);
};
