"use strict";
/* H1 α0.6.1: onboarding and in-world terminology. Remove abandoned extra-question UI. */
H1_V050.voice=function(_seed,base){return base;}; // case answers stay in the hypothetical, not past-tense appendices.
H1_V052.reactions=[
 [
  ["受付で待つ人への説明が先だというのは、確かに大切ですね。","列の長さだけでなく、困っている方を見ないといけませんね。"],
  ["訂正が必要かどうかの判断は、思ったより難しいですね。","説明資料なら、受け取る人が誤解しないかが重要だと思います。"],
  ["新人が自分で対応できるようにするのも大切ですね。","全部代わりにやるより、少し一緒にやる方がいいかもしれません。"],
  ["使えない場所ができると、案内が一番混乱しそうですね。","30分しかなければ、作業を絞る必要もありますね。"],
  ["同姓同名の方もいるので、慎重に確認したいですね。","登録を消してしまうと、あとで困るかもしれません。"],
  ["最後のお客さまの案内を忘れるわけにはいきませんね。","返却と案内を並行させるのは難しそうですね。"]
 ],
 [
  ["全員に同じ変更を伝えられるかが大切ですね。","連絡した相手が分かるようにするのも必要だと思います。"],
  ["どこまで記録すれば次の担当が困らないか、考えさせられます。","時刻だけでは足りず、理由も大事かもしれません。"],
  ["役割を分けた後、誰が確認するかも決めたいですね。","四人だからこそ担当が重ならないようにしたいです。"],
  ["発案者に理由を聞くのは大切だと思いました。","試してから決めるという考え方もありますね。"],
  ["人の工夫を自分の仕事に合うよう変えるのは難しいですね。","元のやり方の目的を確かめておきたいです。"],
  ["資料だけでは分からないこともありそうですね。","次の担当者が困らない順序を考えたいですね。"]
 ],
 [
  ["評価されなかった理由を先に聞きたいですね。","結果だけでなく、経緯を説明する必要もあると思います。"],
  ["知らないことを勝手に埋めないのは大事ですね。","困っている人への説明も必要かもしれません。"],
  ["達成したことと、残っている仕事は別ですよね。","仲間の仕事が終わっていないなら声をかけたいです。"],
  ["人のアイデアを自分のものとして話したなら訂正が必要ですね。","発案した人が分かるようにしないといけませんね。"],
  ["会議の内容が変わるなら、早めに確認したいです。","人前での指摘の仕方は難しいと思います。"],
  ["どの案も一長一短なので、判断の基準がほしいですね。","意見をまとめる前に、目的を確認したいです。"]
 ]
];
renderIntro=function(){
 el("docs-wrap").hidden=true;el("bottom-mobile").hidden=true;
 el("main").innerHTML='<section class="opening"><p class="eyebrow">CONFIDENTIAL｜人事部より</p><h1>本日の最終面接について</h1>'+
 '<p>4名の最終候補者から、<strong>1名を不採用</strong>としてください。ただし社内調査によると、候補者のうち1名は人間ではない可能性が極めて高いと判明しています。</p>'+
 '<p>この存在は<strong>他の応募者が非公開の個人面接で話した経験を学習し、自分の判断や説明に混ぜる</strong>と考えられています。言葉をそのまま繰り返すとは限りません。</p>'+
 '<p class="warning">正体を疑っていることを悟られないでください。面接官として通常どおり選考を進め、静かに1名を見送ってください。</p>'+
 '<div class="guide"><h2>本日の選考手順</h2><ol>'+
 '<li><strong>個人面接：</strong>4名から過去の経験を聞き、非公開記録を残す</li>'+
 '<li><strong>グループ面接：</strong>全員が同じ架空の職場ケースに回答する</li>'+
 '<li><strong>発言の照合（任意）：</strong>別の学生の非公開記録と、不自然に一致する発言がないか比べる</li>'+
 '<li><strong>逆質問：</strong>2名に回答する。非公開情報を本人に開示するのは危険</li>'+
 '<li><strong>最終判断：</strong>4名から1名を不採用とする</li></ol>'+
 '<p>同じ言葉だけで決めず、<strong>具体的な数字・道具・手順・出来事</strong>に着目してください。</p></div>'+
 '<button class="btn primary wide" id="start">選考資料を確認して面接を始める</button></section>';
 el("start").onclick=()=>{state.phase="private-select";state.tab="file";render();};
};
head=function(){
 const phase=state.phase;
 const step=phase==="intro"||phase==="private-select"||phase==="private"?0:phase==="game"?1:phase==="investigate"?2:phase==="reverse"?3:phase==="decision"?4:5;
 const labels=["PERSONAL INTERVIEW","GROUP CASE INTERVIEW","EVIDENCE REVIEW","REVERSE QUESTIONS","FINAL DECISION","RESULT"];
 el("header-state").textContent=phase==="intro"?"PROLOGUE":labels[step];
 el("version").textContent=VERSION+"｜更新 "+UPDATED;
 el("progress").innerHTML=["個人","ケース","照合","逆質問","判定","結果"].map((x,i)=>'<span class="'+(i<step?'done':i===step?'on':'')+'">'+x+'</span>').join("");
};
const h161PreviousGroupRender=renderGame;
renderGame=function(){
 h161PreviousGroupRender();
 const root=el("main");if(!root||typeof root.querySelectorAll!=="function")return;
 const swaps=new Map([
  ["GROUP INTERVIEW｜最終選考","GROUP INTERVIEW｜共通ケース面接"],
  ["全員に尋ねる質問を作成","全員に同じ職場ケースを提示"],
  ["4種類から共通質問を選びます。4名全員が同じ質問に回答します。","4つのケースから1つ選びます。4名は同じ状況への対応を考えます。"],
  ["この質問を4名全員にする","このケースを4名に提示する"],
  ["面接を終え、逆質問へ","発言の照合へ進む"],
  ["回答を終え、追加質問・照合へ進む","回答を終え、発言の照合へ進む"],
  ["面接官からの質問","面接官が提示した共通ケース"]
 ]);
 for(const node of root.querySelectorAll("p,h1,h2,button")){const t=node.textContent.trim();if(swaps.has(t))node.textContent=swaps.get(t);}
};
const h161PrevDecision=renderDecision;
renderDecision=function(){
 h161PrevDecision();
 const root=el("main");if(!root||typeof root.querySelectorAll!=="function")return;
 for(const node of root.querySelectorAll("em"))if(node.textContent.includes("追加質問"))node.remove();
 for(const node of root.querySelectorAll("p"))if(node.textContent.includes("件の追加質問を実施"))node.textContent="個人面接4名、共通ケース3問、逆質問2名の回答を確認しました。照合した記録も参考に、どの応募者を不採用にするか選んでください。";
};
