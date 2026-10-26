"use strict";
/* H1 α0.6.0: two optional follow-ups, evidence comparison, final photos and identity inversion. */
function h106PersonBadge(i){
 return '<div class="h106-person-badge"><div class="avatar">'+face(i,false,"group")+'</div><div><strong>'+esc(people[i].name)+'</strong><small>'+esc(people[i].school)+'</small></div></div>';
}
function h106InterviewerCard(inverted=false){
 return '<div class="h106-employee-id"><div class="h106-employee-image">'+(inverted?face(state.monsterIndex,false):'<div class="h106-anonymous-face"><i class="h106-head"></i><i class="h106-shoulders"></i></div>')+'</div><div><small>東央産業｜面接担当社員証</small><b>'+(inverted?esc(people[state.monsterIndex].name):'あなた（面接担当者）')+'</b><span>'+(inverted?'登録役職：面接担当者':'社員証写真：個人情報保護のため非表示')+'</span></div></div>';
}
function h106ChoosePerson(prefix,selected,clickable){
 return '<div class="h106-person-grid">'+people.map((p,i)=>'<button id="'+prefix+'-'+i+'" type="button" class="h106-person-option '+(selected===i?'selected':'')+'" '+(clickable===false?'disabled':'')+'><span class="avatar">'+face(i,false,"group")+'</span><span><b>'+esc(p.name)+'</b></span></button>').join("")+'</div>';
}
function h106CompareHtml(){
 const t=state.h106Target,src=state.h106Source;
 const group=state.asked[state.h106Round]||state.asked[1];
 if(!group)return "";
 const original=state.privateAnswers[src];
 return '<div class="h106-compare"><div class="h106-excerpt"><small>対象者の共通質問での回答</small><b>'+esc(people[t].name)+'</b><p>'+esc(group.answers[t])+'</p></div><div class="h106-compare-symbol">⇅</div><div class="h106-excerpt"><small>照合先：非公開の個人面接記録</small><b>'+esc(people[src].name)+'</b><p>'+esc(original?original.answer:"未記録")+'</p></div><p class="subtle small">似ている発言は、盗用の証明にはなりません。時刻・数字・方法・出来事を見比べてください。</p></div>';
}
function renderInvestigate(){
 H1_V060.ensure();
 el("docs-wrap").hidden=false;el("bottom-mobile").hidden=false;
 const remaining=2-state.h106Probes.length;
 const probe=state.h106Probes.at(-1);
 let html='<section class="panel h106-investigate"><p class="eyebrow">FOLLOW-UP INTERVIEW｜追加質問</p><h1>違和感を確かめる</h1><p>ここまでの回答を見直し、気になる相手に<strong>追加質問を2回まで</strong>できます。確証がない相手への追及は慎重に。</p><div class="h106-counter">追加質問の残り <strong>'+remaining+' / 2回</strong></div>'+h106InterviewerCard(false)+'</section>';
 if(state.h106Result&&probe){
  html+='<section class="panel h106-investigate"><p class="eyebrow">追加質問の回答</p>'+h106PersonBadge(probe.person)+'<blockquote>'+esc(probe.answer)+'</blockquote><p class="subtle small">'+(probe.mode==="confront"?'あなたが非公開記録を知っていることは、相手に伝わった。':'相手は質問に答えた。表情から正体を断定することはできない。')+'</p><button id="probe-continue" class="btn primary wide">'+(remaining?"もう一度質問を検討する":"記録の照合へ進む")+'</button></section>';
 }else if(remaining>0){
  html+='<section class="panel h106-investigate"><h2>誰に追加質問する？</h2>'+h106ChoosePerson("probe-target",state.h106Target,true)+'<div class="h106-probe-options"><h3>質問の方向性</h3>'+Object.entries(H1_V060.modes).map(([k,label])=>'<button id="probe-mode-'+k+'" type="button" class="'+(state.h106Mode===k?'chosen':'')+'">'+esc(label)+(k==="confront"?'<small>非公開情報を直接示すため、相手に意図を悟られるおそれ</small>':'')+'</button>').join("")+'</div><button id="probe-ask" class="btn primary wide">この相手に追加質問する</button></section>';
 }
 html+='<section class="panel h106-investigate"><p class="eyebrow">EVIDENCE LINK｜記録の照合</p><h2>気になる2件を並べる</h2><p class="subtle">組み合わせた記録を推理メモへ残せます。正解・不正解の判定は表示しません。</p><h3>発言者</h3>'+h106ChoosePerson("link-target",state.h106Target,true)+'<h3>照合する個人面接記録</h3>'+h106ChoosePerson("link-source",state.h106Source,true)+'<div class="h106-rounds">'+[0,1,2].map(r=>'<button type="button" id="link-round-'+r+'" class="'+(state.h106Round===r?'selected':'')+'">共通質問 '+(r+1)+'</button>').join("")+'</div>'+h106CompareHtml()+'<button id="record-link" class="btn outline wide" '+(state.h106Source===state.h106Target?'disabled':'')+'>この2件を照合メモに残す</button>'+((state.h106Links.length)?'<p class="tiny subtle">登録済みの照合メモ '+state.h106Links.length+'件</p>':'')+'</section>';
 html+='<div class="h106-finish"><button type="button" class="btn primary wide" id="finish-probing">逆質問へ進む'+(remaining?"（残り質問は使わない）":"")+'</button></div>';
 el("main").innerHTML=html;
 if(state.h106Result)el("probe-continue").onclick=()=>{state.h106Result=false;render();};
 else if(remaining>0){
  for(let i=0;i<4;i++)el("probe-target-"+i).onclick=()=>{state.h106Target=i;state.h106Source=(i+1)%4;render();};
  for(const key of Object.keys(H1_V060.modes))el("probe-mode-"+key).onclick=()=>{state.h106Mode=key;render();};
  el("probe-ask").onclick=()=>{
   const i=state.h106Target,mode=state.h106Mode,answer=H1_V060.reply(i,mode);
   state.h106Probes.push({person:i,mode,answer,round:1});state.h106Result=true;render();
  };
 }
 for(let i=0;i<4;i++){el("link-target-"+i).onclick=()=>{state.h106Target=i;state.h106Source=(i+1)%4;render();};el("link-source-"+i).onclick=()=>{state.h106Source=i;render();};}
 for(let r=0;r<3;r++)el("link-round-"+r).onclick=()=>{state.h106Round=r;render();};
 el("record-link").onclick=()=>{
  if(state.h106Target===state.h106Source)return;
  const link={suspect:state.h106Target,source:state.h106Source,round:state.h106Round};
  if(!state.h106Links.some(x=>x.suspect===link.suspect&&x.source===link.source&&x.round===link.round)&&state.h106Links.length<4)state.h106Links.push(link);
  render();
 };
 el("finish-probing").onclick=()=>{state.h106Phase="done";state.phase="reverse";state.reverseConfirmed=false;render();};
}
const h106PreviousRender=render,h106PreviousLevel=H1UX.level;
H1UX.level=function(){if(state.phase==="investigate")return 5.7;return h106PreviousLevel.call(this);};
render=function(){
 H1_V060.ensure();
 if(state.phase==="reverse"&&state.h106Phase==="pending"&&state.asked.length===3)state.phase="investigate";
 if(state.phase==="investigate"){
  H1UX.shade();head();renderInvestigate();renderDocs();closeDocs();return;
 }
 h106PreviousRender();
 // On the final selection screen the photographs are a central game control.
};
const h106PriorExposed=exposed;
exposed=function(){
 if(h106PriorExposed())return true;
 const direct=state.h106Probes?.filter(p=>p.person===state.monsterIndex&&p.mode==="confront").length||0;
 return direct>=2||(direct>=1&&state.reverseStyles.some(x=>x.person===state.monsterIndex&&x.style==="verify"));
};
renderDecision=function(){
 el("docs-wrap").hidden=false;el("bottom-mobile").hidden=false;
 const links=state.h106Links||[],probes=state.h106Probes||[];
 const note=links.length?'<div class="h106-evidence-note"><b>あなたの照合メモ</b>'+links.map(x=>'<p>'+esc(people[x.suspect].name)+'の共通質問'+(x.round+1)+'と、'+esc(people[x.source].name)+'の非公開記録を比較</p>').join("")+'</div>':'<p class="subtle small">照合メモは登録されていません。手元の資料から判断できます。</p>';
 const photos=people.map((p,i)=>'<label class="h106-vote '+(state.reject===i?'selected':'')+'"><input type="radio" name="reject" value="'+i+'" '+(state.reject===i?'checked':'')+'><span class="avatar">'+face(i,false,"neutral")+'</span><span><b>'+esc(p.name)+'</b><small>'+esc(p.school)+'</small><em>'+((state.h106Probes||[]).filter(x=>x.person===i).length)+'回追加質問</em></span></label>').join("");
 el("main").innerHTML='<section class="decision panel"><p class="eyebrow">FINAL DECISION｜最終選考</p><h1>誰を不採用にしますか？</h1><p>あなたは4人の個人面接、共通質問3問、'+probes.length+'件の追加質問を実施しました。誰を疑うかは、回答内容と記録を照合して決めてください。</p>'+h106InterviewerCard(false)+'<div class="h106-vote-grid">'+photos+'</div>'+note+'<button class="btn primary wide" id="submit" '+(state.reject<0?'disabled':'')+'>この1名を不採用にする</button><p class="tiny subtle">相手を疑っていることが伝わっている場合は、面接室に戻れなくなることがあります。</p></section><div class="panel records"><h2>これまでの回答履歴</h2>'+getRecords()+'</div>';
 el("main").querySelectorAll('input[name="reject"]').forEach(n=>n.onchange=()=>{state.reject=Number(n.value);render();});
 el("submit").onclick=()=>{if(state.reject<0)return;state.phase="ending";render();};
};
const h106OldStage=H1UX.stage;
H1UX.stage=function(type,step,title,body){
 if(type==="horror"&&step===1)body=h106InterviewerCard(true)+body;
 if(type==="horror"&&step===2)body='<div class="h106-staff-replacement"><small>採用管理画面｜社員証の再発行</small>'+h106InterviewerCard(true)+'</div>'+body;
 return h106OldStage.call(this,type,step,title,body);
};


/* A genuine new interview phase, rather than a mislabeled extra panel. */
head=function(){
 const phase=state.phase,step=phase==="intro"||phase==="private-select"||phase==="private"?0:phase==="game"?1:phase==="investigate"?2:phase==="reverse"?3:phase==="decision"?4:5;
 const titles=["PERSONAL INTERVIEW","GROUP INTERVIEW","FOLLOW-UP INTERVIEW","REVERSE QUESTIONS","FINAL DECISION","RESULT"];
 el("header-state").textContent=phase==="intro"?"PROLOGUE":titles[step];
 el("version").textContent=VERSION+"｜更新 "+UPDATED;
 el("progress").innerHTML=["個人","グループ","追加質問","逆質問","判定","結果"].map((x,i)=>'<span class="'+(i<step?'done':i===step?'on':'')+'">'+x+'</span>').join("");
};
const h106PriorIntro=renderIntro;
renderIntro=function(){
 h106PriorIntro();
 const button=el("start");
 if(typeof button?.insertAdjacentHTML==="function"){
  button.insertAdjacentHTML("beforebegin",'<div class="h106-start-note">'+h106InterviewerCard(false)+'<p><b>今回の選考について：</b>質問候補は毎回変化します。グループ面接の後には、追加質問を2回まで行い、回答と非公開記録を照合できます。相手の返答を確認してから、最終判断してください。</p></div>');
 }
};
const h106PriorGameRenderer=renderGame;
renderGame=function(){
 h106PriorGameRenderer();
 if(state.round===2&&state.shown){const btn=el("continue");if(btn)btn.textContent="回答を終え、追加質問・照合へ進む";}
};
