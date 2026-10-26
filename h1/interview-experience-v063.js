"use strict";
/* H1 α0.6.3: interview variation, human nervousness, non-diagnostic facial cues,
   no keyword underlining, and evidence memos accessible in reverse interviews.
   The three underlying evidence topics remain stable regardless of wording.
*/
const H1_V063={
 newPrompts:[
  [
   [
    {term:"協力先の説明",q:"ESの「協力12社」という表現を、もし入社後の報告書で使うならどう直しますか？",human:"数だけ大きく見せたつもりはなかったのですが、今なら協賛11社と機材貸与1社と分けます。",monster:"誤解が生まれるので、協賛11社・貸与1社と正確に書きます。"},
    {term:"自分の失敗",q:"学園祭の運営で、面接官には話しにくい失敗も一つ教えてください。",human:"「協力12社」と書いたのに、実際に協賛金をくださったのは11社でした。見栄えを優先した部分は反省しています。",monster:"協力先の数え方が曖昧でした。12社のうち1社は機材貸与で、今なら区別します。"}
   ],
   [
    {term:"現場の判断",q:"赤い矢印の最後の1本だけ向きを逆にした理由を、知らない人にも説明してください。",human:"入口と出口の案内が混ざると危ないので、最後だけ逆にしました。最初は不安だったんです。",monster:"3本目だけ出口への誘導に使ったからです。分かりやすい方法だったと思います。"},
    {term:"周囲の反応",q:"会場で矢印を逆に貼ったとき、間違いだと指摘されませんでしたか？",human:"言われました。そこで出口用だと説明しましたが、もっと大きく表示した方がよかったです。",monster:"赤い矢印は3本で、逆向きの最後のものだけ用途が違うと伝えました。"}
   ],
   [
    {term:"片付けの責任",q:"イベントが終了したあと、最後に自分で確かめたものは何でしたか？",human:"誰かが残していないか確認したあと、返却表と照明をチェックしました。あの日は長かったです。",monster:"返却表を照合し、照明を落としたことを確認しました。"},
    {term:"撤収後の気持ち",q:"最後まで残る仕事について、周りに不満はありませんでしたか？",human:"皆が帰ってから照明を落とすまで一人で残るのは少し寂しかったです。でも返却表は確認したかったので。",monster:"最後に返却表を照合し照明を落とすのも、運営担当の必要な仕事だと思います。"}
   ]
  ],
  [
   [
    {term:"担当の偏り",q:"研究チームの仕事が偏っていると感じたとき、どう伝えましたか？",human:"測定2人、装置調整1人、記録が私という役割を整理して、偏っている部分を相談しました。",monster:"測定2人、装置調整1人、記録1人という分担を示して相談しました。"},
    {term:"自分の担当",q:"4人のチームで、ほかの人ではなくあなたが引き受けた仕事は何ですか？",human:"私は記録を担当しました。地味な仕事で、最初は少し不満だったのを覚えています。",monster:"私は記録の担当です。測定2人と調整1人の結果を残しました。"}
   ],
   [
    {term:"忘れられない時刻",q:"研究の話で、数字の中でも特に記憶に残っているものはありますか？",human:"18時12分です。毎日その時刻に自動校正が走るので、ログを見るたび覚えてしまいました。",monster:"自動校正の18時12分ですね。ログに何度も出てきました。"},
    {term:"ログの見直し",q:"異常が出た日のログを見返すなら、最初にどの項目を確認しますか？",human:"毎日18時12分の自動校正に重なっていないかをまず確かめます。偶然ではなかったので。",monster:"自動校正が毎日18時12分に走る点を確認します。"}
   ],
   [
    {term:"改善の苦労",q:"研究で最も時間がかかった試行錯誤について教えてください。",human:"23回目の変更でようやく安定しました。7.8％から6.6％になるまでが長かったです。",monster:"23回目で安定し、相対誤差が7.8％から6.6％へ改善しました。"},
    {term:"数字の説明",q:"「15%改善」という成果を、数字に詳しくない人にどう伝えますか？",human:"誤差が7.8％から6.6％になったという意味です。23回も条件を変えましたし、簡単にはいきませんでした。",monster:"相対誤差が7.8％から6.6％となり、23回目の条件変更で安定しました。"}
   ]
  ],
  [
   [
    {term:"活動と学業",q:"学習支援と授業の両立で、一番困ったことは何でしたか？",human:"2024年秋から火曜と金曜の週2回参加しましたが、講義と重なる日は調整が必要でした。",monster:"2024年秋から火曜日と金曜日に参加し、必要なときは予定を調整していました。"},
    {term:"参加を続けた理由",q:"同じ活動を続けようと思えたのは、どんな理由からですか？",human:"2024年秋から火曜と金曜に通ううち、子どもたちが顔を覚えてくれたからです。",monster:"2024年秋から週2回、火曜日と金曜日に参加を続けました。"}
   ],
   [
    {term:"子どもの見送り",q:"迎えが遅い子がいた日は、誰が最後まで確認していたのですか？",human:"職員と一緒に見送りました。終わったと分かるよう連絡帳の余白に星印を付けました。",monster:"最後の子を職員と見送り、連絡帳の余白に星印を付けていました。"},
    {term:"見落とし防止",q:"引継ぎ漏れを防ぐために、自分で決めた小さな工夫は何ですか？",human:"連絡帳の余白に星印を付けました。迎え待ちの子を見送った印です。",monster:"見送りの完了を、連絡帳の余白の星印で確認しました。"}
   ],
   [
    {term:"指導の距離感",q:"子どもが問題を解けないとき、どこまで手伝うべきだと思いますか？",human:"最初の1問だけ一緒に解いて、あとは本人に任せました。答えを教えすぎたこともあるので。",monster:"最初の1問は一緒に解き、その後は本人に任せる方法です。"},
    {term:"教え方の失敗",q:"善意で手伝ったのに、うまくいかなかった経験はありますか？",human:"最初のころは全部説明しすぎたんです。それから最初の1問だけ一緒に解いて、残りを任せました。",monster:"全部手伝わず、最初の1問だけ一緒に解く方法に変えました。"}
   ]
  ],
  [
   [
    {term:"改善の検証",q:"返品受付が速くなったという成果は、どうやって確かめましたか？",human:"混んでいた日も含めて測り、平均9.8分が5.2分になったと分かりました。",monster:"平均9.8分から5.2分への変化を、受付の記録で確認しました。"},
    {term:"改善の副作用",q:"対応時間を短縮して、逆に困ったことはありませんでしたか？",human:"平均9.8分から5.2分にはなったのですが、早さだけを優先しないよう確認は残しました。",monster:"平均9.8分から5.2分に改善しましたが、確認の手順は維持しました。"}
   ],
   [
    {term:"現場の道具",q:"お金をほとんどかけずに改善した例を一つ挙げてもらえますか？",human:"青い札を付けて、完了したら裏返すようにしました。誰でも続けられるので。",monster:"青い札を付け、済んだら裏返す運用を試しました。"},
    {term:"紛らわしい状態",q:"返品が処理中か完了済みか、ほかの担当者はどう見分けるのですか？",human:"青い札の向きです。処理が終わると裏返します。最初は忘れる人もいました。",monster:"青い札を裏返して、済んだものだと分かるようにします。"}
   ],
   [
    {term:"納得できない人",q:"改善に最後まで反対した人がいたとき、どこまで話し合いましたか？",human:"ベテランの先輩に何度も説明しましたが、最後まで納得してもらえなかったんです。",monster:"ベテランの先輩には繰り返し説明しましたが、最後まで納得していませんでした。"},
    {term:"先輩との関係",q:"改善を進めた結果、人間関係が悪くなることはありませんでしたか？",human:"ありました。ベテランの先輩が最後まで納得せず、その後も少し話しづらかったです。",monster:"ベテランの先輩が最後まで納得せず、関係が難しくなったと思います。"}
   ]
  ]
 ],
 observationNames:{neutral:"落ち着いているように見える",smile:"少し笑っている",thinking:"考え込んでいる",tense:"緊張している？"},
 nervousLead:[
  "……すみません、少し考えさせてください。 ",
  "最初の質問を取り違えました。ええと、 ",
  "結論から言うと……あ、順番が逆ですね。 ",
  "少し緊張していて…… "
 ],
 wordlessHint:"※表情や緊張は人間にも異形にも現れます。見た目だけで決めつけないでください。"
};
// Four ways to ask about each of three evidence anchors (instead of two).
H1_V060.offers=function(person){
 const arr=[0,1,2].map(base=>{
  const choices=[
   {term:privateQuestions[person][base].term,q:privateQuestions[person][base].q,human:privateQuestions[person][base].answer,monster:privateQuestions[person][base].monster,variant:0},
   {...H1_V060_DATA.individualAlternatives[person][base],variant:1},
   ...H1_V063.newPrompts[person][base].map((v,n)=>({
     term:v.term,q:v.q,
     human:privateQuestions[person][base].answer.replace(/」$/," "+v.human+"」"),
     monster:privateQuestions[person][base].monster.replace(/」$/," "+v.monster+"」"),
     variant:n+2
   }))
  ];
  const selected=H1_V050.pick(state.seed,4,115,person,base);
  return {base,...choices[selected]};
 });
 return arr.sort((a,b)=>H1_V050.hash(state.seed,91,person,a.base)-H1_V050.hash(state.seed,91,person,b.base));
};
// A tense or muddled reply does not identify the creature.
// Human candidates are sometimes flustered; so is the creature.
function h163Stammer(text,person,round,question,stage){
 const chance=H1_V050.pick(state.seed,100,194,person,round,question,stage);
 const threshold=person===state.monsterIndex?35:32;
 if(chance>=threshold)return text;
 const word=H1_V063.nervousLead[H1_V050.pick(state.seed,4,195,person,round,question,stage)];
 return String(text).replace(/^「/,"「"+word);
}
const h163OldGroupAnswer=groupAnswer;
groupAnswer=function(round,idx,person){
 return h163Stammer(h163OldGroupAnswer(round,idx,person),person,round,idx,3);
};
const h163OldPrivate=renderPrivate;
renderPrivate=function(){
 h163OldPrivate();
 const help=el("main")?.querySelector?.(".interview-question > p.subtle");
 if(help)help.textContent="気になる経験について、どのように聞くか選んでください。";
 const instruction=el("main")?.querySelector?.(".gamehead .subtle");
 if(instruction)instruction.textContent="どんな質問をするかは、あなたが決めます。";
};
// Private replies are recorded with an independent, non-identifying moment of hesitation.
const h163PrivateOffers=H1_V060.offers;
H1_V060.offers=function(person){
 return h163PrivateOffers(person).map(x=>({...x,
  human:h163Stammer(x.human,person,person,x.base,1),
  monster:h163Stammer(x.monster,person,person,x.base,1)
 }));
};
// All explanatory keyword underlines, including ES and archive, are removed.
highlightWords=function(value){return esc(value);};
// The emotion label comes from the same expression state as the real face photo.
function h163Emotion(i){
 const look=H1_V050.expression(state.seed,i,"group",state.round,state.b,state.shown);
 return H1_V063.observationNames[look]||"表情が読み取りにくい";
}
const h163PriorGame=renderGame;
renderGame=function(){
 h163PriorGame();
 const main=el("main");if(!main?.querySelectorAll||!document.createElement)return;
 const seats=main.querySelectorAll(".room-inner .seat");
 seats.forEach((seat,i)=>{
  const note=document.createElement("span");
  note.className="h163-observation";note.textContent=h163Emotion(i);
  seat.appendChild(note);
 });
 if(state.shown){
  const cards=main.querySelectorAll(".replies > .reply");
  cards.forEach((card,i)=>{
   const who=card.querySelector?.(".who");
   if(!who)return;
   const note=document.createElement("small");
   note.className="h163-reply-observation";note.textContent=h163Emotion(i);
   who.appendChild(note);
  });
 }
};
// Memo is a fourth, persistent tab in the existing dossier viewer.
const h163PrevDocs=docMarkup;
function h163MemoTab(){
 return '<button type="button" data-tab="memo" role="tab" aria-selected="'+(state.tab==="memo")+'" class="'+(state.tab==="memo"?"on":"")+'">照合メモ</button>';
}
function h163MemoBody(){
 const marks=state.h162Marks||[],links=state.h106Links||[];
 const intro='<div class="paper h163-memo-sheet"><h3>気になる発言・照合メモ</h3><p class="subtle small">面接中に保存した発言と、比べておいた非公開記録です。正解は表示されません。</p>';
 const marked='<h4>保存した発言</h4>'+(marks.length?marks.map(({person,round})=>{
  const record=state.asked[round],quote=record?.answers?.[person];
  return '<details class="rec"><summary>'+esc(people[person].name)+'｜共通ケース'+(round+1)+'</summary><p>'+esc(quote||"未記録")+'</p></details>';
 }).join(""):'<p class="subtle small">保存した発言はありません。</p>');
 const paired='<h4>照合した記録</h4>'+(links.length?links.map(({suspect,source,round})=>{
  const record=state.asked[round],q=record?.answers?.[suspect],p=state.privateAnswers[source]?.answer;
  return '<details class="rec"><summary>'+esc(people[suspect].name)+' ↔ '+esc(people[source].name)+'｜ケース'+(round+1)+'</summary><p><b>グループ面接：</b>'+esc(q||"未記録")+'</p><p><b>個人面接：</b>'+esc(p||"未記録")+'</p></details>';
 }).join(""):'<p class="subtle small">まだ照合した組み合わせはありません。</p>');
 return intro+marked+paired+"</div>";
}
docMarkup=function(){
 const html=h163PrevDocs();
 const tab=h163MemoTab();
 if(state.tab==="memo"){
  const pos=html.indexOf("</div>");
  // Existing markup always begins with .tabs-doc; do not include a person's resume here.
  return html.slice(0,pos)+tab+html.slice(pos,pos+6)+h163MemoBody();
 }
 return html.replace("</div>",tab+"</div>");
};
const h163PrevReverse=renderReverse;
renderReverse=function(){
 h163PrevReverse();
 const main=el("main");
 const section=main?.querySelector?.(".panel");
 if(!section||!document.createElement)return;
 const button=document.createElement("button");
 button.id="h163-open-memo";button.type="button";button.className="btn outline h163-open-memo";
 button.textContent="照合メモを開く";
 button.onclick=()=>{state.tab="memo";renderDocs("tab");openDocs();};
 section.insertBefore(button,section.firstChild?.nextSibling||section.firstChild);
};
