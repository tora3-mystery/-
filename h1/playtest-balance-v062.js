"use strict";
/* H1 α0.6.2 — dialogue balance / human playtest candidate.
  All four students respond concretely to each hypothetical case.
  Non-monsters do not secretly know other students' private facts.
  The monster still borrows from the sole private answer selected per student.
*/
const H1_V062={
  // Round -> shared case -> four applicants, each with one contextual detail.
  humanDetails:[
    [
     ["まず受付を2列に分け、案内する場所を掲示します。","どの工程で列が止まっているか、5分間だけ観察します。","待っている人へ、状況を10分おきに知らせたいです。","対応中と案内済みを入口で分け、二度並ばせないようにします。"],
     ["意味の違う箇所を赤枠で示し、印刷会社へ修正可能時刻を確認します。","差替えの締切と影響を3項目に分けて確認します。","参加者へ訂正を伝える担当者を、少なくとも1人残します。","誤字のある箇所に訂正紙を挟み、配布時に口頭でも知らせます。"],
     ["近くの先輩1名を応援に回し、質問の内容を聞きます。","答えられなかった質問を一覧にし、次回の案内表へ反映します。","最初の質問だけ一緒に説明し、そのあと本人に話してもらいます。","判断が難しいものだけ札を付け、責任者へ引き継ぎます。"],
     ["30分の残り時間を確認して、案内図を2色で更新します。","使える設備の確認を先に終えて、代替案を2つ比較します。","待機場所へ案内するスタッフを1名確保します。","中止する作業と移動する作業を、表の左右に分けます。"],
     ["登録番号と連絡先の両方が一致するか確認します。","同じ氏名の2件を、入力日時と連絡先で比較します。","受付で確認できるよう、氏名だけで判断しないように伝えます。","二重登録の2件には消去せず確認待ちの印を付けます。"],
     ["案内係を1人残し、返却担当との連絡を決めます。","備品の返却表と照合して、未確認のものだけ残します。","終了時間を迎えても、まだいる人への案内は続けます。","返却済みと未返却を2欄に分けて引き継ぎます。"]
    ],
    [
     ["変更前後の案内をA4用紙1枚にまとめ、担当者に渡します。","切替の時刻を分単位で記録し、担当を2人に分けます。","口頭連絡だけでなく、変更した手順を掲示します。","受付2か所へ同じ変更表を渡し、確認欄に印を付けます。"],
     ["原因の候補を3項目に分け、次の担当と確認します。","変更時刻と操作履歴を照合し、確認者名を残します。","誰に伝えたかを連絡欄に残し、誤解を減らします。","未処理の案件と完了した案件を、表の別の欄に記載します。"],
     ["入口案内1人、受付2人、連絡1人を想定します。","入力と確認を別々の担当へ振り分けます。","相談対応を1人置き、困っている方を案内します。","受付と確認を分け、混んだ方へ応援を回します。"],
     ["提案者に理由を2つ確認し、来場者への影響を考えます。","現行案と改善案を、同じ3つの指標で比べます。","新しい方法で困る人がいないか、受付で聞いてみます。","一部の窓口で15分間だけ試し、様子を見ます。"],
     ["元の手順を作った人に目的を聞き、案内用の表へ書き直します。","元の方法と新しい方法の所要時間を比較します。","手順が利用者にどう見えるか、2人で試してみます。","最初は1窓口で試し、うまくいけば広げます。"],
     ["急ぎの案件を2種類に分け、責任者に連絡します。","不明な記録には勝手に数字を入れず、確認待ちにします。","相手が待っている案件だけ先に引き継ぎます。","未処理の項目をチェックリストにまとめ、翌日の当番に渡します。"]
    ],
    [
     ["評価した人に基準を確認し、成果が伝わる資料を1枚にまとめます。","数値が適切だったか、計測条件と一緒に見直します。","利用した人の声を2、3件確認し、結果を説明します。","試した方法を残し、次の改善に使えるようにします。"],
     ["優先順位を3つに整理し、責任者へ確認します。","作業のログと手順表の食い違いを確かめます。","待っている方へ事情を伝え、次の担当を明確にします。","処理中と済んだものを分け、未完了だけ引き継ぎます。"],
     ["残っている作業を確認し、できる仕事を分担します。","今日必要な作業か、翌日に回せる作業かを数えて確かめます。","帰りたい人が言い出せないなら、先に声をかけます。","未完了のものを一覧にして、次の担当を決めます。"],
     ["まず訂正して、提案者へ直接謝ります。関係者にも経緯を説明します。","原本と会議資料の2つを比べて訂正します。","相手がどう感じたか確認し、発案者が分かるように直します。","誰の発案なのかを正しく書き、変更履歴に残します。"],
     ["本人に確認し、誤解が広がる前に資料を直します。","発言と原本の違いを2点に整理し、確認します。","会議後に本人と話し、必要なら全員に訂正します。","その場で決めつけず、責任者と確認します。"],
     ["目的を3項目に整理して、案のメリットを比べます。","同じ条件で試せる数値を一つ決めます。","反対する人にも先に理由を聞きます。","まず1週間試して、現場の反応を聞きます。"]
    ]
  ],
  // Additional low-confidence behavioral observations; do not determine identity.
  diffuseMonster:[
    ["……今の質問は、どの情報まで答えればいいでしょうか。","少し間が空いたあと、言葉を選び直した。"],
    ["相手の説明を聞きながら、手元の記録へ視線を移した。","説明が終わると、隣の席を見た。"]
  ],
  marked(state,round,person){
    return Array.isArray(state.h162Marks)&&state.h162Marks.some(x=>x.round===round&&x.person===person);
  }
};
const h162PreviousGroupAnswer=groupAnswer;
groupAnswer=function(round,idx,person){
 const original=h162PreviousGroupAnswer(round,idx,person);
 const detail=H1_V062.humanDetails[round]?.[idx]?.[person];
 if(!detail)throw Error("Missing contextual human answer "+round+"/"+idx+"/"+person);
 // Length and amount of detail now vary for humans and creature alike.
 if(person!==state.monsterIndex)return original.replace(/」$/,"。 "+detail+"」").replace(/。。/g,"。");
 // The round-2 confidential-memory imprint stays as the distinctive proof.
 // Round 1 and 3 enrich the scene but do not falsely duplicate human records.
 if(round===1)return original;
 const candidates=[
  "実際には、誰が確認するのかまで決める必要があると思います。",
  "口頭だけでなく、変更前後を確認できるようにしたいです。",
  "終わった段階を記録に残しておく方が安心です。",
  "相手に状況を説明したうえで、次の担当へ渡したいと思います。"
 ];
 const ending=candidates[H1_V050.pick(state.seed,4,person,round,idx,71)];
 return original.replace(/」$/,"。 "+ending+"」").replace(/。。/g,"。");
};
// In group interviews, bookmark a real response without leaking its meaning.
const h162PreviousRender=renderGame;
renderGame=function(){
 h162PreviousRender();
 if(!state.h162Marks)state.h162Marks=[];
 if(!state.shown)return;
 const cards=el("main")?.querySelectorAll?.(".replies > .reply")||[];
 for(let i=0;i<cards.length;i++){
  const b=document.createElement("button");
  b.type="button";b.className="h162-mark"+(H1_V062.marked(state,state.round,i)?" is-marked":"");
  b.textContent=H1_V062.marked(state,state.round,i)?"✓ 気になる発言に保存済み":"☆ 気になる発言を保存";
  b.setAttribute("aria-label",people[i].name+"の共通ケース"+(state.round+1)+"の発言を記録");
  b.onclick=()=>{
   const key={round:state.round,person:i};
   const exists=H1_V062.marked(state,key.round,key.person);
   if(exists)state.h162Marks=state.h162Marks.filter(x=>x.round!==key.round||x.person!==key.person);
   else if(state.h162Marks.length<6)state.h162Marks.push(key);
   render();
  };
  cards[i].appendChild(b);
 }
};
const h162PriorEvidence=H1_V061.evidence;
H1_V061.evidence=function(){
 if(!state.h162Marks)state.h162Marks=[];
 if(!state.h162Prefilled&&state.h162Marks.length){
  state.h106Round=state.h162Marks[0].round;
  state.h106Target=state.h162Marks[0].person;
  state.h106Source=(state.h106Target+1)%4;
  state.h162Prefilled=true;
 }
 h162PriorEvidence.call(this);
 const root=el("main");
 const intro=root?.querySelector?.(".h161-brief");
 if(!intro||!state.h162Marks.length)return;
 const nav=document.createElement("div");nav.className="h162-saved";
 const title=document.createElement("b");title.textContent="面接中に保存した気になる発言";nav.appendChild(title);
 for(const mark of state.h162Marks){
  const b=document.createElement("button");
  b.type="button";b.textContent=people[mark.person].name+"｜共通ケース"+(mark.round+1);
  b.onclick=()=>{state.h106Target=mark.person;state.h106Source=(mark.person+1)%4;state.h106Round=mark.round;render();};
  nav.appendChild(b);
 }
 intro.appendChild(nav);
};
const h162PrevReset=H1UX.reset;
H1UX.reset=function(){
 state.h162Marks=[];state.h162Prefilled=false;
 return h162PrevReset.call(this);
};
