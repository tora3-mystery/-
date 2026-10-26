"use strict";
const H1_V060={
 ensure(){if(state.h106Seed===state.seed)return;state.h106Seed=state.seed;state.h106Phase="pending";state.h106Probes=[];state.h106Links=[];state.h106Target=0;state.h106Mode="source";state.h106Result=false;state.h106Source=1;state.h106Round=1;},
 offers(i){return [0,1,2].map(k=>{const alt=H1_V050.pick(state.seed,2,71,i,k),x=alt?H1_V060_DATA.individualAlternatives[i][k]:privateQuestions[i][k];return {base:k,term:x.term,q:x.q,human:x.human??x.answer,monster:x.monster,variant:alt};}).sort((a,b)=>H1_V050.hash(state.seed,51,i,a.base)-H1_V050.hash(state.seed,51,i,b.base));},
 groupOptions(r){let p=[0,1,2,3,4,5].sort((a,b)=>H1_V050.hash(state.seed,88,r,a)-H1_V050.hash(state.seed,88,r,b)).slice(0,4);if(r===1&&!p.some(k=>k<4))p[3]=0;return p.sort((a,b)=>a-b);},
 modes:{source:"発案者を確認する",specific:"具体的な根拠を聞く",confront:"非公開記録との一致を示す"},
 reply(i,mode){
  const h=[
   ["「学生たちと確認しました。協賛と案内は、私が担当した範囲です」","「協賛金は11社で、機材貸与が1社です。矢印は3本貼りました」","「……ほかの学生の非公開記録は、私には見られません」"],
   ["「研究チームの担当者です。測定2人、調整1人、記録が私でした」","「23回目の変更で安定し、誤差は7.8％から6.6％です」","「個人面接の記録と似ているというのは、どの部分でしょうか」"],
   ["「職員と一緒に子どもの対応を担当しました」","「2024年秋から火曜と金曜。引継ぎには星印も使いました」","「ほかの応募者の記録は、私には見られません」"],
   ["「受付の先輩と店長に相談しました。案自体は私のものです」","「平均9.8分から5.2分、青い札を裏返して区別しました」","「似た経験をした人がいること自体は、普通ですよね」"]
  ];
  const w=[
   ["「……誰かが先にやっていた方法かもしれません。発案者までは」","「担当の名前は記録にあったはずです。……今は思い出せません」","「職員と相談したはずです。……誰が最初だったでしょうか」","「先輩もいたはずです。最初に考えた人は覚えていません」"],
   ["「数や手順は記録にあるとおりです。……そこから確認できますよね」","「記録の時刻は確認できます。誰のものだったかは……」","「連絡帳に残っています。……きっと残っているはずです」","「管理札と時間の記録なら、説明できると思います」"],
   ["「……その資料は、面接官だけが見られるものでは？」","「ほかの人の個人面接を、今ここで引用するんですね」","「……それを私に聞かせて、どう答えてほしいのでしょう」","「非公開だと、さっきご説明されていましたよね」"]
  ];
  let k=Object.keys(this.modes).indexOf(mode);return i===state.monsterIndex?w[k][i]:h[i][k];
 }
};
for(let r=0;r<3;r++){
 for(const q of H1_V060_DATA.groupExtras[r])rounds[r].push({q:q.q,risk:0,ans:q.ans});
 H1_V052.reactions[r].push(["迷った判断の理由も大切だと思います。","私も同じ立場なら迷うと思います。"],["相手の考え方を聞いてから判断するのも大切ですね。","意見が違っても対話するのは必要ですよね。"]);
}
H1_V052.reactions[1][4]=["別の方法を取り入れるのも勇気が必要ですね。","参考にするだけでなく工夫したのが印象的です。"];
H1_V052.reactions[1][5]=["引継ぎの小さな確認が大切ですね。","あとから確認する人への配慮が必要ですよね。"];
H1_V052.reactions[2][4]=["誤解されたときの説明は難しいですね。","自分の判断にも理由があると思います。"];
H1_V052.reactions[2][5]=["面接中にほかの方から学べるのは良いですね。","それぞれの考え方が違って参考になります。"];
const h106PreviousAnswer=groupAnswer;
groupAnswer=function(round,idx,person){
 if(idx<4)return h106PreviousAnswer(round,idx,person);
 const q=H1_V060_DATA.groupExtras[round][idx-4];
 if(person!==state.monsterIndex)return q.ans[person];
 if(round!==1)return q.monster[person];
 const other=[0,1,2,3].filter(i=>i!==state.monsterIndex),src=other[q.sourceSlot],rec=privateEntry(src);
 if(!rec)throw Error("個人面接記録が不足しています");
 return "「"+stripQuote(q.prefix[person])+" "+stripQuote(S.borrowing_echoes[person][src][rec.option])+"」";
};
const h106OldRecord=recordMarkup;
recordMarkup=function(i){
 const e=privateEntry(i);if(!e)return h106OldRecord(i);
 return '<div class="transcript-sheet"><div class="record-label">INTERVIEW RECORD <span>自動文字起こし／非公開</span></div><h3>'+esc(people[i].name)+'｜個人面接</h3><div class="spoken interviewer"><b>面接官</b><p>'+esc(e.question||privateQuestions[i][e.option].q)+'</p></div><div class="spoken applicant"><b>'+esc(people[i].name)+'</b><p>'+esc(e.answer)+'</p></div></div>';
};
const h106OldDocs=docMarkup;
docMarkup=function(){
 let html=h106OldDocs();
 if(state.phase==="private"&&!state.privateShown&&state.tab!=="archive"){
  const a=html.indexOf('<div class="es-hints"><b>ESから質問を選ぶ</b>'),b=a<0?-1:html.indexOf('</div>',a);
  if(a>=0&&b>a)html=html.slice(0,a)+'<div class="es-hints"><b>ESから質問を選ぶ</b>'+H1_V060.offers(state.privateIndex).map((x,k)=>'<button data-private-option="'+k+'">'+esc(x.term)+' → 質問へ</button>').join("")+'</div>'+html.slice(b+6);
 }
 return html;
};
renderPrivate=function(){
 H1_V060.ensure();el("docs-wrap").hidden=false;el("bottom-mobile").hidden=false;
 const i=state.privateIndex,p=people[i],offers=H1_V060.offers(i);
 if(state.privatePick<0||state.privatePick>=3)state.privatePick=0;
 if(!state.docsPinned)state.person=i;
 const pick=offers[state.privatePick];
 let html='<section class="gamehead"><div><p class="eyebrow">PERSONAL INTERVIEW｜個人面接</p><h1>'+esc(p.name)+'</h1><p class="subtle small">質問は毎回変わります。どの経験を深掘りしますか？</p></div><span class="small status">'+(state.privateShown?'文字起こし保存済':'面接中')+'</span></section><button id="back-to-candidates" type="button" class="back-link">‹ 応募者一覧に戻る</button>';
 html+=resumeMarkup(i,false);
 html+='<div class="h1-live-candidate h106-live"><div class="avatar">'+face(i,false,"private")+'</div><div><small>LIVE｜面接室の表情</small><b>'+esc(p.name)+'</b><span>'+(state.privateShown?'答え終わり、こちらの反応を待っている。':'質問を待っている。')+'</span></div></div>';
 if(!state.privateShown)html+='<section class="panel interview-question"><h2>どのエピソードを深掘りしますか？</h2><p class="subtle">各人6種類の質問から3種類が選ばれます。</p><div class="private-choices">'+offers.map((q,k)=>'<label class="private-choice"><input type="radio" name="private-q" value="'+k+'" '+(state.privatePick===k?'checked':'')+'><span><strong>'+esc(q.term)+'</strong><small>'+esc(q.q)+'</small></span></label>').join("")+'</div><div class="preview"><span>面接官の質問</span><strong>'+esc(pick.q)+'</strong></div><button class="btn primary wide" id="ask-private">この質問をする</button></section>';
 else html+=recordMarkup(i)+'<section class="panel private-next"><div class="save-note">✓ 個人面接を保存しました。</div><button type="button" id="next-private" class="btn primary wide">応募者一覧に戻る</button></section>';
 el("main").innerHTML=html;
 el("back-to-candidates").onclick=()=>{state.phase="private-select";state.tab="file";render();};
 if(!state.privateShown){
  el("main").querySelectorAll('input[name="private-q"]').forEach(input=>input.onchange=()=>{state.privatePick=Number(input.value);render();});
  el("ask-private").onclick=()=>{
   if(state.privateAnswers[i])return;
   state.privateAnswers[i]={person:i,option:pick.base,variant:pick.variant,term:pick.term,question:pick.q,answer:i===state.monsterIndex?pick.monster:pick.human};
   state.privateShown=true;render();
  };
 }else el("next-private").onclick=()=>{state.phase="private-select";state.privateShown=false;state.docsPinned=false;state.tab="file";render();};
};
questionOptions=function(){
 const offered=H1_V060.groupOptions(state.round);
 return '<div class="question-choices">'+offered.map((i,k)=>'<label class="private-choice"><input type="radio" name="group-q" value="'+i+'" '+(state.b===i?'checked':'')+'><span><strong>質問 '+(k+1)+'</strong><small>'+esc(rounds[state.round][i].q)+'</small></span></label>').join("")+'</div>';
};
const h106OldGame=renderGame;
renderGame=function(){H1_V060.ensure();if(!state.shown){const options=H1_V060.groupOptions(state.round);if(!options.includes(state.b))state.b=options[0];}h106OldGame();};
