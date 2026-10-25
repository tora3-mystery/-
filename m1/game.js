"use strict";
(function(){
const VERSION="α0.3", UPDATED="2026/10/26 01:17 JST";
const INIT={
 n02:"120",s02:"新たに電話で確かめる",t02:"今夜",
 n03:"20",s03:"保存済みの回答から取り出す",t03:"来月末",a03:"担当部長",
 m04:"機械で照合する",n04:"18",t04:"来週",r04:"却下",
 r05:"承認",m05:"人の目で照合する",a05:"全員",
 m06:"紙で確認する",n07:"80",m08:"文書で説明する"
};
const DOCS=[
{id:"02",title:"国会対応に係る確認のお願い",meta:"前日 19:42｜改革推進部・森係長",summary:"120社の回答を至急確認。作業開始は20時以降。",paras:[
"改革推進部各位。森です。明朝の国会説明に向け、確認をお願いします。",
"対象は全国[[n02]]社。情報は[[s02]]こととします。前回の国会では数字を誤ったため、最終確認は省内規程どおり行ってください。",
"提出は[[t02]]。通常業務のため着手は20時以降です。急な依頼で恐縮ですが、よろしくお願いします。"]},
{id:"03",title:"企業調査資料の保管状況",meta:"1週間前更新｜資料管理室",summary:"8か月前の120社分の回答が保管されている。広報にも利用中。",paras:[
"資料室の保管簿。8か月前、120社の回答を電子化。企業名・調査日・政策実施前後の数字も残っており、国会資料への再利用が可能。",
"広報室向けの[[n03]]社分の紹介記事は、情報を[[s03]]こととした。提出は[[t03]]。通常勤務内で対応できる見込み。",
"記事の掲載には[[a03]]の確認を受ける。"]},
{id:"04",title:"事務処理の自動化に関する報告",meta:"2週間前｜庶務課",summary:"経費精算の照合を自動化。他部署でも利用可能。",paras:[
"庶務課より。申請書の数字は、現在[[m04]]方法で確認しています。元の電子データがあれば企業調査にも転用可能です。",
"先週は[[n04]]件に使用。次の点検は[[t04]]。システム停止の予定はありません。",
"旧データ管理方式の全面廃止は当面[[r04]]することとしました。"]},
{id:"05",title:"組織運営会議・議事要旨",meta:"8か月前｜大臣官房",summary:"改革推進部の設置と、資料の確認・承認手順を決定。",paras:[
"組織運営会議。政策を継続的に管理するため、改革推進部の設置を[[r05]]した。",
"前回の国会で数字を誤ったため、国会資料は原則[[m05]]方法で確認する。手作業なら2社につき1分を要する。",
"最終承認には[[a05]]の確認を求める。全員確認の待ち時間は平均40分。",
"ただし、保存済みの数字を機械で正確に照合できれば、機械の利用を認める。"]},
{id:"06",title:"保存済み調査の転記について",meta:"因果更新により発生｜資料管理室・長谷川",summary:"再入力による数字の一致確認が追加された。",generated:true,paras:[
"森係長。保存済みの回答を再利用する件、承知しました。ただし、数字を書き写す場合は、原本との一致を[[m06]]必要があります。",
"結果を別紙で提出してください（25分）。機械照合ならこの別紙は不要です。"]},
{id:"07",title:"国会答弁の数字が足りません",meta:"因果更新により発生｜大臣官房・高橋",summary:"100社分に達せず、緊急の追加確認が指示された。",generated:true,paras:[
"森係長。国会の条件は100社以上ですが、確認予定が不足しています。追加の[[n07]]社分を至急確保してください（1社3分）。",
"記載人数を変えるだけでは回答は増えません。変更理由も別途ご説明ください。"]},
{id:"08",title:"提出期限変更に伴う対応",meta:"因果更新により発生｜大臣官房・高橋",summary:"国会開催後への期限変更で、理由書の作成を指示。",generated:true,paras:[
"森係長。資料の提出予定が国会開催日の後になっています。なお、国会の開催日は変更されていません。",
"提出できない理由を[[m08]]ようお願いします（45分）。これで提出義務が免除されるわけではありません。"]}
];
const DOC_BY_ID=Object.fromEntries(DOCS.map(d=>[d.id,d]));
const labels={
 n02:"国会資料の調査対象",s02:"国会資料の調査方法",t02:"国会資料の省内期限",
 n03:"広報記事の社数",s03:"広報記事の情報収集方法",t03:"広報記事の期限",a03:"広報記事の承認者",
 m04:"庶務の数字確認方法",n04:"経費申請の件数",t04:"システム点検期限",r04:"旧方式の廃止判断",
 r05:"改革推進部の設置判断",m05:"国会資料の数字確認方法",a05:"国会資料の承認者",
 m06:"転記の一致確認方法",n07:"不足の報告数",m08:"遅延理由の説明方法"
};
const contexts={
 n02:"number",n03:"number",n04:"number",n07:"number",
 t02:"date",t03:"date",t04:"date",r04:"decision",r05:"decision",
 a03:"approver",a05:"approver",s02:"method",s03:"method",m04:"method",m05:"method",m06:"method",m08:"method"
};
const METHODS=[
"新たに電話で確かめる","保存済みの回答から取り出す","機械で照合する","人の目で照合する","紙で確認する","文書で説明する","緊急に追加確認する"
];
const qs=s=>document.querySelector(s);
const qsa=s=>Array.from(document.querySelectorAll(s));
let state={values:{...INIT},history:[],first:null,second:null,notice:"",expanded:new Set(["02"]),ended:false};
let started=false;
function esc(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function eligible(id,r){return id==="03"||id==="04"||id==="05"||(id==="02"&&r.org)||(id==="06"&&r.extra06)||(id==="07"&&r.extra07)||(id==="08"&&r.extra08);}
function rules(v){
 const org=v.r05==="承認",count=Math.max(0,Number(v.n02)||0),remaining=Math.max(0,100-count);
 const source=v.s02==="新たに電話で確かめる"?"phone":v.s02==="保存済みの回答から取り出す"?"archive":"unknown";
 const manual=v.m05==="人の目で照合する",machine=v.m05==="機械で照合する";
 const extra06=org&&source==="archive"&&manual, extra07=org&&(remaining>0||source==="unknown"),extra08=org&&v.t02!=="今夜";
 let phone=source==="phone"?count:0;
 let verify=manual?Math.ceil((count+remaining)/2):machine?0:35;
 let extra=extra06&&v.m06!=="機械で照合する"?25:0;
 let urgent=remaining*3;
 if(source==="unknown"){urgent=100*3;phone=0;}
 const approval=v.a05==="全員"?40:v.a05==="担当部長"?0:55;
 const deadline=extra08?45:0;
 let secondary=0;
 if(v.t03==="今夜"){
  if(v.s03==="新たに電話で確かめる")secondary+=Math.max(0,Number(v.n03)||0);
  if(v.a03==="全員")secondary+=40;
 }
 if(v.t04==="今夜"&&v.m04==="人の目で照合する")secondary+=Math.ceil((Number(v.n04)||0)/2);
 const total=org?phone+verify+extra+urgent+approval+deadline:0;
 const effective=org?total+secondary:secondary;
 const policy=org&&source!=="unknown"&&(manual||machine)&&v.t02==="今夜";
 const validD07=String(remaining)===v.n07;
 const active=DOCS.filter(d=>eligible(d.id,{org,extra06,extra07,extra08}));
 return {org,count,remaining,source,manual,machine,extra06,extra07,extra08,phone,verify,extra,urgent,approval,deadline,secondary,total,effective,policy,active,validD07,completed:org&&policy&&total===0,clean:org&&policy&&total===0&&secondary===0};
}
function validatePair(a,b,values){
 if(a===b)return "同じ部分は交換できません。";
 const draft={...values,[a]:values[b],[b]:values[a]};
 for(const k of [a,b]){
  const val=draft[k],type=contexts[k];
  if(type==="number"&&!/^\d{1,3}$/.test(val))return "「"+val+"」を数として扱えません。書類の単位と整合しません。";
  if(type==="date"&&!["今夜","来月末","来週"].includes(val))return "「"+val+"」は期限として解釈できません。";
  if(type==="decision"&&!["承認","却下"].includes(val))return "「"+val+"」を設置・廃止の判断に使うことができません。";
  if(type==="approver"&&!["全員","担当部長"].includes(val))return "「"+val+"」を確認する人として特定できません。";
  if(type==="method"&&!METHODS.includes(val))return "「"+val+"」を作業方法として解釈できません。";
 }
 return "";
}
function renderLine(line,values,enable=true){
 return line.split(/(\[\[[a-z0-9_]+\]\])/g).map(part=>{
  const m=part.match(/^\[\[([a-z0-9_]+)\]\]$/);
  if(!m)return esc(part);
  const key=m[1]; const value=esc(values[key]??"");
  if(!enable)return "【"+value+"】";
  const on=state.first===key||state.second===key, cls=on?"slot selected":"slot";
  return '<button class="'+cls+'" type="button" data-slot="'+key+'" title="交換候補：'+esc(labels[key])+'">'+value+'</button>';
 }).join("");
}
function activeAndOpen(doc){
 const old=qs("#document-"+doc.id);
 return state.expanded.has(doc.id)||old?.open;
}
function renderDocuments(r){
 const target=qs("#documents");
 target.innerHTML=r.active.map(d=>{
  const open=activeAndOpen(d);
  return '<details id="document-'+d.id+'" class="doc '+(d.fixed?"fixed ":"")+(d.generated?"generated":"")+'" '+(open?"open":"")+'>'
  +'<summary><span class="dochead"><span class="docnum">'+d.id+'</span><span><strong>'+esc(d.title)+'</strong><small>'+esc(d.meta)+'</small></span></span><span class="docflag">'+(d.fixed?"固定":d.generated?"新規発生":"編集可")+'</span><p class="abstract">'+esc(d.summary)+'</p></summary>'
  +'<div class="body">'+d.paras.map(p=>'<p>'+renderLine(p,state.values,!d.fixed)+'</p>').join('')+'</div></details>';
 }).join("");
 qsa("details.doc").forEach(el=>el.addEventListener("toggle",()=>{
  if(el.open)state.expanded.add(el.id.slice(-2));else state.expanded.delete(el.id.slice(-2));
 }));
}
function messageFor(r){
 const items=[];
 if(!r.org)items.push("改革推進部の設置が取り消されました。関連する国会対応メールと派生業務が消滅しました。");
 else{
 if(r.extra06)items.push("保存データを人が再入力するため、資料管理室から一致確認の依頼が届いています。");
 if(r.extra07)items.push("国会が要求した100社分に足りません。追加の連絡業務が発生しました。");
 if(r.extra08)items.push("省内期限を動かしても国会の開催日は変わりません。遅延理由書が発生しました。");
 }
 if(r.secondary>0)items.push("交換先の業務にも時間外の仕事が発生しています。");
 return items;
}
function render(){
 const r=rules(state.values); qs("#version").textContent=VERSION+" / 更新 "+UPDATED;
 qs("#overtime").textContent=r.total+"分";
 qs("#otherTime").textContent=r.secondary+"分";
 qs("#docsCount").textContent=r.active.length+"件";
 qs("#moves").textContent=(3-state.history.length)+"/3";
 qs("#policyState").textContent=r.policy?"維持":"未達";
 qs("#orgState").textContent=r.org?"存続":"不在";
 qs("#policyState").className=r.policy?"good":"bad";
 qs("#orgState").className=r.org?"good":"bad";
 renderDocuments(r);
 const parts=[];
 if(r.org){
 parts.push(["国会用の調査・資料取得",r.phone]);
 parts.push(["数字の確認",r.verify]);
 if(r.extra>0)parts.push(["再入力に伴う確認",r.extra]);
 if(r.urgent>0)parts.push(["不足分の緊急確認",r.urgent]);
 parts.push(["承認待ち",r.approval]);
 if(r.deadline>0)parts.push(["遅延理由の説明",r.deadline]);
 }else parts.push(["対象部署の業務なし",0]);
 qs("#breakdown").innerHTML=parts.map(x=>'<div class="breakrow"><span>'+esc(x[0])+'</span><b>'+x[1]+'分</b></div>').join("");
 qs("#messages").innerHTML=messageFor(r).map(t=>'<p>'+esc(t)+'</p>').join("")||'<p>追加の業務依頼はありません。</p>';
 qs("#undo").disabled=state.history.length===0;
 qs("#finish").disabled=state.history.length===0;
 qs("#selection").innerHTML=state.first?'<div class="selectionline"><span>選択中：</span><b>【'+esc(state.values[state.first])+'】</b><button type="button" id="cancelSelect">解除</button></div>':'<span>文書中の細い枠を2か所選ぶと交換プレビューが開きます。</span>';
 const c=qs("#cancelSelect");if(c)c.addEventListener("click",()=>{state.first=null;state.second=null;render();});
 qs("#activity").textContent=state.notice||"文書を調べて、過去の語句を交換してください。";
 if(!state.ended)qs("#ending").hidden=true;
}
function findDocOf(key){return DOCS.find(d=>d.paras.some(p=>p.includes("[["+key+"]]")));}
function lineFor(key,v){const doc=findDocOf(key);const line=doc.paras.find(p=>p.includes("[["+key+"]]"));return {doc,line:renderLine(line,v,false)};}
function preview(a,b){
 state.second=b;
 const invalid=validatePair(a,b,state.values);
 const next={...state.values,[a]:state.values[b],[b]:state.values[a]};
 const oldA=lineFor(a,state.values),oldB=lineFor(b,state.values);
 const newA=lineFor(a,next),newB=lineFor(b,next);
 qs("#previewTitle").textContent=invalid?"歴史修正の解釈に失敗":"交換プレビュー";
 qs("#previewText").textContent=invalid?"因果観察室： "+invalid+" （交換回数は消費しません）":"両方の記録を書き換えます。発生する業務や残業時間は確定後に再計算されます。";
 qs("#previewLines").innerHTML=[{old:oldA,newer:newA},{old:oldB,newer:newB}].map(d=>'<div class="previewdoc"><strong>'+esc(d.old.doc.title)+'</strong><p class="before">'+d.old.line+'</p><p class="after">'+d.newer.line+'</p></div>').join("");
 qs("#apply").disabled=!!invalid||state.history.length>=3;
 qs("#apply").textContent=state.history.length>=3?"3回使用済み：巻き戻してください":"この交換を確定";
 if(invalid){
  // An invalid attempt ends the entire two-item selection.
  state.first=null;state.second=null;
  state.notice="交換エラー："+invalid+" 選択をすべて解除しました。";
  render();
 }
 qs("#previewPanel").hidden=false;
 qs("#previewPanel").scrollIntoView({behavior:"smooth",block:"nearest"});
}
function updateSelection(key){
 if(state.ended)return;
 if(state.history.length>=3){state.notice="確定できる交換は3回までです。巻き戻すか、結末を確認してください。";render();return;}
 if(!state.first){qs("#previewPanel").hidden=true;state.first=key;state.second=null;render();return;}
 if(state.first===key){state.first=null;render();return;}
 preview(state.first,key);
}

function showImpact(before,after,a,b,added,removed){
 const moves=state.history.length;
 qs("#impactTitle").textContent="第"+moves+"回｜歴史修正が確定しました";
 const changedDocs=[a,b].map(key=>{
  const doc=findDocOf(key);
  const old=state.history[moves-1].values[key], now=state.values[key];
  return '<div class="impact-edit"><span>'+esc(doc.title)+'</span><p><del>'+esc(old)+'</del> → <strong>'+esc(now)+'</strong></p></div>';
 });
 qs("#impactExchange").innerHTML=changedDocs.join("");
 const deltas=[
  ["国会用の電話確認",before.phone,after.phone],
  ["数字の照合",before.verify,after.verify],
  ["再入力による追加確認",before.extra,after.extra],
  ["回答不足の緊急確認",before.urgent,after.urgent],
  ["最終承認待ち",before.approval,after.approval],
  ["提出遅延の説明",before.deadline,after.deadline],
  ["ほかの業務の残業",before.secondary,after.secondary]
 ].filter(item=>item[1]!==item[2]);
 if(before.org!==after.org){
  deltas.unshift(["改革推進部の存在",before.org?"存続":"不在",after.org?"存続":"不在"]);
 }
 qs("#impactChanges").innerHTML=deltas.length?deltas.map(([name,old,now])=>{
  const numeric=typeof old==="number";
  const diff=numeric?now-old:0;
  const side=numeric?(diff<0?"（"+Math.abs(diff)+"分減少）":diff>0?"（"+diff+"分増加）":""):"";
  return '<div class="impact-change"><span>'+esc(name)+'</span><b>'+esc(numeric?old+"分":old)+' → '+esc(numeric?now+"分":now)+'</b><small>'+esc(side)+'</small></div>';
 }).join(""):'<p class="subtle">現在の残業時間には変化がありません。別の記録への影響を調べてください。</p>';
 const eventLines=[];
 added.forEach(d=>eventLines.push('<div class="impact-event generated-event"><strong>新しい文書が届いた</strong><p>'+esc(d.title)+'</p><small>'+esc(d.summary)+'</small></div>'));
 removed.forEach(d=>eventLines.push('<div class="impact-event removed-event"><strong>発生しなかった文書</strong><p>'+esc(d.title)+'</p><small>原因となる仕事が消えたため、現行の記録から消滅しました。</small></div>'));
 qs("#impactDocuments").innerHTML=eventLines.join("")||'<div class="impact-event neutral-event"><strong>文書の増減はありません</strong><p>書き換えられた記録に基づき、仕事の割当や作業時間が更新されました。</p></div>';
 qs("#impactBefore").textContent=before.total+"分";
 qs("#impactAfter").textContent=after.total+"分";
 qs("#impactSummary").textContent=after.org?
  (after.total===0?"改革推進部の残業は0分。政策成果と部署の存続も確認してください。":after.total<before.total?"残業が減りました。ただし、必要な仕事が消えたとは限りません。":"残業が増えた、または変わりません。新しく発生した仕事も確認してください。"):
  "部署そのものが設置されなかった歴史になりました。残業だけは0分です。";
 qs("#impactContinue").textContent=moves===3?"最終結果を確認する":"更新された記録を調べる";
 qs("#impactScreen").hidden=false;
 qs("#impactContinue").focus?.();
}
function dismissImpact(){
 qs("#impactScreen").hidden=true;
}
function applySwap(){
 if(!state.first||!state.second||state.history.length>=3)return;
 const a=state.first,b=state.second;
 if(validatePair(a,b,state.values))return;
 const before=rules(state.values);
 state.history.push({values:{...state.values},pair:[a,b]});
 const tmp=state.values[a];state.values[a]=state.values[b];state.values[b]=tmp;
 if(a!=="n07"&&b!=="n07")state.values.n07=String(Math.max(0,100-(Number(state.values.n02)||0)));
 const after=rules(state.values);
 const oldIds=new Set(before.active.map(d=>d.id)),newIds=new Set(after.active.map(d=>d.id));
 const added=after.active.filter(d=>!oldIds.has(d.id));
 const removed=before.active.filter(d=>!newIds.has(d.id));
 const delta=after.total-before.total;
 state.notice="第"+state.history.length+"回の歴史修正。残業 "+(delta>=0?"+":"")+delta+"分。"+
 (added.length?"　新しい文書："+added.map(d=>d.title).join("、")+"。":"")+
 (removed.length?"　消えた文書："+removed.map(d=>d.title).join("、")+"。":"");
 state.first=null;state.second=null;qs("#previewPanel").hidden=true;
 added.forEach(d=>state.expanded.add(d.id));
 render();
 showImpact(before,after,a,b,added,removed);
}
function undo(){
 if(!state.history.length)return;
 const item=state.history.pop();state.values={...item.values};state.first=null;state.second=null;
 state.ended=false;state.notice="交換を1手巻き戻しました。過去の文書と残業を再計算しました。";
 qs("#previewPanel").hidden=true;
 qs("#impactScreen").hidden=true;qs("#ending").hidden=true;
 render();
}
function restart(){
 state={values:{...INIT},history:[],first:null,second:null,notice:"最初の歴史へ戻しました。",expanded:new Set(["02"]),ended:false};
 qs("#previewPanel").hidden=true;qs("#impactScreen").hidden=true;qs("#ending").hidden=true;
 render();window.scrollTo({top:0,behavior:"smooth"});
}

function showEnding(){
 dismissImpact();
 const r=rules(state.values),moves=state.history.length;
 let heading,story,kind,status;
 if(!r.org){
  heading="部署がなくなった";kind="bad";status="任務失敗";
  story="過去の議事録から改革推進部の設置が消えました。残業は0分になりましたが、政策を説明する担当部署も存在しません。";
 }else if(r.clean){
  heading="残業ゼロ。政策は継続。";kind="good";status="任務達成";
  story="必要な調査結果を確保し、提出に間に合う確認方法へ変更できました。国会では改革の成果が報告されます。";
 }else if(r.completed){
  heading="残業は消えた。しかし……";kind="warn";status="対象部署のみ達成";
  story="改革推進部の残業は0分になりましたが、ほかの業務で時間外勤務が発生しています。数字上の成功と、実態は異なるようです。";
 }else if(!r.policy){
  heading="国会に説明できない";kind="bad";status="任務失敗";
  story="回答数や提出期限、数字の確認方法が国会の要求を満たせません。残業をなくすだけでは改革の成果になりません。";
 }else{
  heading="残業が残った";kind="warn";status="任務未達";
  story="部署は存続し、政策の根拠も維持しました。しかし改革推進部には、まだ"+r.total+"分の残業が残っています。";
 }
 const goals=[
  ["残業0分",r.total===0,r.total===0?"達成":r.total+"分 残存"],
  ["国会への説明",r.policy,r.policy?"条件を維持":"条件未達"],
  ["部署の存続",r.org,r.org?"存続":"不在"]
 ];
 state.ended=true;
 qs("#ending").hidden=false;
 qs("#ending").className="cinema-overlay";
 qs("#endingSheet").className="cinema-card result-sheet "+kind;
 qs("#endingStatus").textContent=status;
 qs("#endingTitle").textContent=heading;
 qs("#endingBody").textContent=story;
 qs("#endingGoals").innerHTML=goals.map(([title,ok,explain])=>'<div class="result-goal '+(ok?"ok":"ng")+'"><span>'+(ok?"✓":"×")+' '+esc(title)+'</span><strong>'+esc(explain)+'</strong></div>').join("");
 qs("#endingStats").textContent="交換 "+moves+"/3回｜対象部署 "+r.total+"分｜他業務 "+r.secondary+"分｜文書 "+r.active.length+"件";
 qs("#endingPostscript").textContent=r.clean?
  "後日談：因果観察室の歴史修正担当者は45分残業しました。なお、当室は今回の集計対象ではありません。":
  r.completed?"本部報告には『改革推進部の時間外勤務削減率 100%』と記載されました。":"別の語句を交換すれば、違う歴史になったかもしれません。";
 qs("#endingUndo").disabled=moves===0;
 qs("#again").focus?.();
}
function dismissEnding(){
 state.ended=false;
 qs("#ending").hidden=true;
 render();
}
function showGame(){
 started=true;
 qs("#intro").hidden=true;qs("#game").hidden=false;
 qs("#startGame").textContent="調査画面に戻る";
 window.scrollTo({top:0,behavior:"smooth"});
}
function showBriefing(){
 qs("#game").hidden=true;qs("#intro").hidden=false;
 window.scrollTo({top:0,behavior:"smooth"});
}
function init(){
 qs("#startGame").addEventListener("click",showGame);
 qs("#viewBriefing").addEventListener("click",showBriefing);
 qs("#documents").addEventListener("click",event=>{
  const btn=event.target.closest("button[data-slot]");if(!btn)return;
  event.preventDefault();event.stopPropagation();updateSelection(btn.dataset.slot);
 });
 qs("#apply").addEventListener("click",applySwap);
 qs("#impactContinue").addEventListener("click",()=>{if(state.history.length===3)showEnding();else dismissImpact();});
 qs("#impactBack").addEventListener("click",dismissImpact);
 qs("#resultBack").addEventListener("click",dismissEnding);
 qs("#endingUndo").addEventListener("click",()=>{undo();});

 qs("#closePreview").addEventListener("click",()=>{qs("#previewPanel").hidden=true;state.first=null;state.second=null;render();});
 qs("#undo").addEventListener("click",undo);
 qs("#restart").addEventListener("click",restart);
 qs("#finish").addEventListener("click",showEnding);
 qs("#again").addEventListener("click",restart);
 qs("#howto").addEventListener("click",()=>{qs("#help").hidden=!qs("#help").hidden;});
 render();
}
document.addEventListener("DOMContentLoaded",init);
})();