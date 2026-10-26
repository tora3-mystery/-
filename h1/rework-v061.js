"use strict";
/* H1 α0.6.1 — all four applicants solve the same case; compare evidence instead of extra interrogation. */
const H1_V061={
 answer(round,idx,person){
  const c=H1_V061_CASES[round][idx];
  if(person!==state.monsterIndex)return c.human[person];
  if(round!==1)return c.monster[person];
  const others=[0,1,2,3].filter(i=>i!==state.monsterIndex),source=others[[0,1,2,0,1,2][idx]];
  const entry=privateEntry(source);
  if(!entry)throw Error("個人面接の非公開記録が必要です");
  return "「"+stripQuote(c.prefix[person])+" "+stripQuote(S.borrowing_echoes[person][source][entry.option])+"」";
 },
 compare(){
  const t=state.h106Target,s=state.h106Source,r=state.h106Round;
  const result=state.asked[r],record=state.privateAnswers[s];
  if(!result||!record)return '<p class="subtle">照合する記録がまだありません。</p>';
  return '<div class="h106-compare"><div class="h106-excerpt"><small>共通ケース'+(r+1)+'｜グループ面接の発言</small><b>'+esc(people[t].name)+'</b><p>'+esc(result.answers[t])+'</p></div><div class="h106-compare-symbol">⇵</div><div class="h106-excerpt"><small>非公開｜個人面接の発言</small><b>'+esc(people[s].name)+'</b><p>'+esc(record.answer)+'</p></div></div>';
 },
 evidence(){
  H1_V060.ensure();
  el("docs-wrap").hidden=false;el("bottom-mobile").hidden=false;
  if(state.asked.length<3){state.phase="reverse";render();return;}
  const t=state.h106Target,s=state.h106Source,r=state.h106Round;
  const select=(id,chosen)=>'<div class="h106-person-grid">'+people.map((p,i)=>'<button type="button" id="'+id+'-'+i+'" class="h106-person-option '+(i===chosen?'selected':'')+'"><span class="avatar">'+face(i,false)+'</span><b>'+esc(p.name)+'</b></button>').join("")+'</div>';
  const memos=state.h106Links.map((x,i)=>'<p class="h161-memo">'+(i+1)+'. '+esc(people[x.suspect].name)+'（共通ケース'+(x.round+1)+'）と'+esc(people[x.source].name)+'（個人面接）</p>').join("");
  el("main").innerHTML='<section class="panel h161-evidence"><p class="eyebrow">INTERVIEW REVIEW｜選考記録の確認</p><h1>発言を照合する</h1><p>人事部の調査によると、異形は<strong>他の応募者の個人面接でしか聞けない経験を、自分の考えとして話す</strong>ことがあります。</p>'+
  '<div class="h161-brief"><b>調べること</b><ol><li>個人面接の<strong>具体的な数字・道具・手順・出来事</strong>を確認する</li><li>共通ケースで、<strong>別の応募者</strong>が似た細部を話していないか確かめる</li><li>不自然に一致すると思った2件を並べ、推理メモに残す</li></ol><p>同じ工夫が偶然重なることもあります。照合は任意で、正解判定は行いません。</p></div></section>'+
  '<section class="panel h161-evidence"><h2>比較する記録</h2><h3>共通ケースの回答者</h3>'+select("link-target",t)+
  '<div class="h106-rounds">'+[0,1,2].map(i=>'<button type="button" id="link-round-'+i+'" class="'+(r===i?'selected':'')+'">ケース '+(i+1)+'</button>').join("")+'</div>'+
  '<h3>比較する別の応募者の個人面接</h3>'+select("link-source",s)+this.compare()+
  '<button id="record-link" type="button" class="btn outline wide" '+(s===t||state.h106Links.length>=4?'disabled':'')+'>この2件を推理メモに保存</button>'+
  (memos?'<div class="h161-memos"><b>保存した照合メモ</b>'+memos+'</div>':"")+
  '<button id="finish-probing" type="button" class="btn primary wide">照合を終え、逆質問へ進む</button></section>';
  for(let i=0;i<4;i++){
   el("link-target-"+i).onclick=()=>{state.h106Target=i;if(state.h106Source===i)state.h106Source=(i+1)%4;render();};
   el("link-source-"+i).onclick=()=>{state.h106Source=i;render();};
  }
  for(let i=0;i<3;i++)el("link-round-"+i).onclick=()=>{state.h106Round=i;render();};
  el("record-link").onclick=()=>{
   if(s===t||state.h106Links.length>=4)return;
   if(!state.h106Links.some(x=>x.suspect===t&&x.source===s&&x.round===r))state.h106Links.push({suspect:t,source:s,round:r});
   render();
  };
  el("finish-probing").onclick=()=>{state.h106Phase="done";state.phase="reverse";state.reverseConfirmed=false;render();};
 }
};
for(let r=0;r<3;r++)for(let i=0;i<6;i++){const scene=H1_V061_CASES[r][i];rounds[r][i]={q:scene.q,risk:0,ans:scene.human};}
groupAnswer=function(round,idx,person){return H1_V061.answer(round,idx,person);};
renderInvestigate=function(){H1_V061.evidence();};
