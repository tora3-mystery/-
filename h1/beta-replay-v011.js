"use strict";
/* H1 β0.1.1 | Applicant variety, without changing the three factual anchors.
 * Every applicant has one independently seeded supplementary episode.
 * The same episode appears in both the ES and a pertinent private answer.
 * The variant is independent of the creature identity; being human does not
 * systematically make someone more or less interesting.
 */
const H1_B011_STORIES=[
 [
  {anchor:0,es:"学園祭では、協力企業との連絡が一日だけ担当者不在になりました。返事のない相手にも確認の締切を伝える難しさを学びました。",reply:"連絡担当が急に不在になった日は、返答期限を決めて担当を引き継ぎました。今なら先に代行者も決めます。"},
  {anchor:1,es:"雨の日に会場の案内看板が読みにくくなり、急きょ屋内の誘導も作り直しました。正しい表示でも、現場で見えなければ意味がないと感じました。",reply:"雨で案内看板が見えなくなったとき、屋内の表示を追加しました。見え方まで確認すべきでした。"},
  {anchor:2,es:"終演後に落とし物を探す来場者が一人戻ってきたため、撤収の終了判断が難しかった日がありました。",reply:"落とし物で戻ってくる方がいたので、最後の退出を確認してから施錠の担当へ連絡しました。"},
  {anchor:0,es:"協力企業へのお礼状を、会社名の表記を確認しながら自分で作成しました。資料の見栄えより、相手に誤解なく伝わることを意識しています。",reply:"企業名を誤記したお礼状を出しかけて、送る前にチェックを追加しました。あれは本当に焦りました。"}
 ],
 [
  {anchor:0,es:"研究室のミーティングでは、結論を急いで話すとメンバーに伝わらないことがあり、測定担当の説明を先に聞くようにしました。",reply:"自分の結論を急いだとき、測定担当に事情を説明できず、相手の話を最後まで聞くようにしました。"},
  {anchor:1,es:"実験用パソコンの時計がずれていて、データの時系列が一度合わなくなりました。それ以来、ログだけでなく機器の時刻も確かめています。",reply:"PCの時計がずれていたことがあったので、機器の時刻設定も確認するようになりました。"},
  {anchor:2,es:"改善が思うように進まなかった時期、良くなった測定だけを報告しようとしたことがあります。指導教員に指摘され、失敗も記録に残しました。",reply:"うまくいかなかった条件を省きかけましたが、失敗も共有するように直しました。"},
  {anchor:1,es:"研究室で共有したグラフの縦軸を取り違えたことがありました。それ以来、表示と元データが一致しているか二人で確認しています。",reply:"縦軸を取り違えたグラフを配ったので、元データとの照合を二人で行うようにしました。"}
 ],
 [
  {anchor:0,es:"学習支援の活動では、初参加の学生が緊張して何も話せないことがあり、最初の時間を雑談に使うようにしました。",reply:"初回は緊張している子が多いので、最初は少し雑談してから勉強に入っていました。"},
  {anchor:1,es:"保護者への連絡が職員間で行き違ったことがあり、誰に伝えたかを申し送りに残すようになりました。",reply:"保護者への連絡が行き違ってから、伝達先を申し送りに書くようにしました。"},
  {anchor:2,es:"宿題を全部代わりに解説してしまい、かえって本人の自信をなくさせたことがあります。教える量を減らす必要を感じました。",reply:"最初は説明しすぎてしまい、子どもが自分で解く時間を奪ったと反省しています。"},
  {anchor:0,es:"講義と活動が重なる週には、同じチームの学生に代わってもらいました。無理に抱えるより早めに相談する大切さを感じました。",reply:"講義と重なる週に代行をお願いしたので、早めの連絡を習慣にしていました。"}
 ],
 [
  {anchor:0,es:"返品の受付で急ぐお客様に説明を省いた結果、別の窓口へ再度並ばせてしまったことがあります。短くても確認を欠かさないようにしました。",reply:"急いで説明を省いたら再来店になってしまい、短縮と説明の両立を意識しています。"},
  {anchor:1,es:"繁忙期に引継ぎの表示を見落としたことがあり、店長と相談して、誰でも見て分かる置き方に変えました。",reply:"自分も表示を見落としたので、札の置き方を店長と一緒に確認しました。"},
  {anchor:2,es:"長く働く先輩と意見が違ったとき、先輩のやり方に助けられた経験も聞いてから改善案を伝えるようにしました。",reply:"改善に反対する先輩から、以前うまくいった方法も聞くようにしました。"},
  {anchor:1,es:"レジ横に私物のようなメモを置くと、ほかの人が手順として読めないと気づきました。共通の表示にするよう直しました。",reply:"自分しか分からないメモになっていたので、誰でも読める表記へ変更しました。"}
 ]
];
const H1_B011={
  story(person){return H1_B011_STORIES[person][H1_V050.pick(state.seed,4,99011,person)];},
  essay(person){const item=this.story(person);return people[person].es+"\n\n【補足エピソード】"+item.es;},
  enrichAnswer(person,option,original){
    const s=this.story(person);
    if(option!==s.anchor)return original;
    // One supplementary interview exchange, not a new fact used by the creature.
    const txt=stripQuote(original);
    return "「"+txt+" ちなみに、"+s.reply+"」";
  },
  label(){return "補足エピソード";}
};
const b011OldResume=resumeMarkup;
resumeMarkup=function(person,compact=false){
 const html=b011OldResume(person,compact);
 const original=esc(people[person].es);
 if(!html.includes(original))throw Error("ES field mismatch: "+person);
 const extra=H1_B011.story(person);
 return html.replace(original,original+'</p><p class="beta-story-extra"><small>補足エピソード</small>'+esc(extra.es));
};
// Hub shows the same seeded applicant ES as the dossier.
const b011OldHub=renderPrivateHub;
renderPrivateHub=function(){
 b011OldHub();
 const root=el("main");
 if(!root||typeof root.innerHTML!=="string")return;
 let html=root.innerHTML;
 for(let i=0;i<4;i++){
  const base=esc(people[i].es);
  const pos=html.indexOf('<p class="candidate-brief">'+base+'</p>');
  if(pos>=0)html=html.replace('<p class="candidate-brief">'+base+'</p>','<p class="candidate-brief">'+base+'</p><p class="beta-story-brief">'+esc(H1_B011.story(i).es)+'</p>');
 }
 if(html===root.innerHTML)return;
 // Replace the visual hub only when supplementary prose exists. The button
 // bindings need to be restored using the same handlers as the original hub.
 const before=state.phase;
 root.innerHTML=html;
 for(let i=0;i<4;i++){
  const b=el(state.privateAnswers[i]?"review-person-"+i:"interview-person-"+i);
  if(state.privateAnswers[i])b.onclick=()=>{state.person=i;state.docsPinned=true;state.tab="record";renderDocs("tab");openDocs();};
  else b.onclick=()=>{state.privateIndex=i;state.privatePick=0;state.privateShown=false;state.docsPinned=false;state.person=i;state.tab="es";state.phase="private";render();};
 }
 el("archive-from-hub").onclick=()=>{state.tab="archive";renderDocs("tab");openDocs();};
 if(state.privateAnswers.every(Boolean))el("begin-group").onclick=()=>{
  if(!state.privateAnswers.every(Boolean))return;
  state.phase="game";state.round=0;state.shown=false;state.b=0;
  state.tab="record";state.docsPinned=false;state.person=0;render();
 };
};
// Incorporate supplementary episode into the actual saved private record,
// without changing option index or monster's private source facts.
const b011OldOffers=H1_V060.offers;
H1_V060.offers=function(person){
 return b011OldOffers(person).map(q=>({
  ...q,
  human:H1_B011.enrichAnswer(person,q.base,q.human),
  monster:H1_B011.enrichAnswer(person,q.base,q.monster)
 }));
};
