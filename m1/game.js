"use strict";
(function(){
const VERSION="α0.1", UPDATED="2026/10/25 12:10 JST";
const INIT={
 n02:"120",s02:"新たに電話で確かめる",t02:"今夜",
 n03:"20",s03:"保存済みの回答から取り出す",t03:"来月末",a03:"担当部長",
 m04:"機械で照合する",n04:"18",t04:"来週",r04:"却下",
 r05:"承認",m05:"人の目で照合する",a05:"全員",
 m06:"紙で確認する",n07:"80",m08:"文書で説明する"
};
const DOCS=[
{id:"01",title:"国会からの質問通告",meta:"前日 15:00｜N国・国会事務局",summary:"翌朝10時までに100社以上の根拠と部署の勤務実態を説明。省内からは変更不可。",fixed:true,paras:[
"労働環境省 御中",
"明日の委員会では、働き方改革政策の実施状況について質疑を行います。政策実施前後の変化について、少なくとも100社分の確認可能な回答をもとに説明してください。",
"過去12か月以内の調査結果であれば、対象企業と調査時期を明示して利用できます。新しい調査が必須というわけではありません。",
"また、働き方改革を推進する担当部署自身の勤務実態についても確認する予定です。資料は明日午前10時までに提出してください。",
"省内の人員配置、確認手順、決裁方式については、当事務局から指定するものではありません。"]},
{id:"02",title:"国会対応に係る確認のお願い",meta:"前日 19:42｜改革推進部・森係長",summary:"国会資料用に120社の回答を至急確認する。作業開始は20時以降。",paras:[
"改革推進部各位",
"お疲れさまです。森です。先ほど官房から、明日の国会説明に使う資料について再確認の依頼が来ました。",
"対象は全国[[n02]]社です。回答の取り違えがあると問題になりますので、情報の確認方法は[[s02]]こととします。",
"数字の最終確認と承認は、先般の組織運営会議で決まった手順に従ってください。前回の国会対応では数字の誤りを指摘されたため、確認を省略することは認めません。",
"取りまとめの期限は[[t02]]です。通常業務が立て込んでおり、作業を始められるのは20時以降になる見込みです。",
"遅い時間の依頼となり恐縮ですが、ご対応よろしくお願いいたします。　森"]},
{id:"03",title:"企業調査資料の保管状況",meta:"1週間前更新｜資料管理室",summary:"8か月前の120社分の調査が保存されている。広報記事にも利用。",paras:[
"昨年度の働き方改革に関する企業調査について、保管状況を報告する。",
"調査では全国120社から回答を得た。政策実施前後の変化も確認できる。回答原本、対象企業、調査時期は保存されており、国会資料への再利用も可能である。",
"広報室から依頼されている[[n03]]社分の企業紹介記事については、情報の確認方法を[[s03]]こととした。",
"この記事の提出期限は[[t03]]であり、通常業務の範囲で作成できる見込みである。",
"なお、国会向けの資料などに再利用する場合は、数字の転記ミスがないことを確認すること。広報記事は[[a03]]の確認を経て掲載する。"]},
{id:"04",title:"事務処理の自動化に関する報告",meta:"2週間前｜庶務課",summary:"経費精算の数字の確認が自動化された。他部署でも利用可能。",paras:[
"各位。先月から運用を開始した事務処理システムについて、利用状況を報告します。",
"経費精算の数字と申請内容を確認する際は、現在[[m04]]方法を採用しています。保存されたデータ同士を比較できるため、職員が数字を一つずつ読み上げる必要はありません。",
"先週は[[n04]]件の申請に利用し、作業時間の短縮を確認しました。企業調査の一覧など、元の電子データが残っていれば他部署でも利用可能です。",
"次の点検期限は[[t04]]です。システム停止を伴う作業は予定していません。",
"なお、提案されていた旧データ管理方式の全面廃止については、当面[[r04]]することとなりました。旧方式との併用が可能な状態を維持します。"]},
{id:"05",title:"組織運営会議・議事要旨",meta:"8か月前｜大臣官房",summary:"改革推進部の設置と、国会資料の確認・承認手順を決定。",paras:[
"本日の会議では、働き方改革政策の推進体制と、国会向け資料の品質管理について審議した。",
"まず、政策実施状況を継続的に把握するため、働き方改革推進部の設置申請を[[r05]]した。",
"過去の国会対応で数字の誤りが指摘されたため、国会提出資料の数字は原則として[[m05]]方法を採用する。従来の目視確認には回答2社につき1分程度を要する。",
"また、資料の最終承認には関係者[[a05]]の確認を必要とする。全員の確認待ちには平均40分かかる。",
"ただし、保管済み資料の再利用にあたり、機械で必要な精度を確保できれば、自動照合を利用してもよい。",
"以上の手順は、働き方改革推進部の設置後に適用する。"]},
{id:"06",title:"保存済み調査の転記について",meta:"因果更新により発生｜資料管理室・長谷川",summary:"保存済み回答を再入力したため、数字の一致確認が追加された。",generated:true,paras:[
"森係長。お疲れさまです。資料管理室の長谷川です。国会資料に昨年度の調査結果を利用する件、承知しました。",
"ただし、現在の手順では保存済みの数字を提出用の表へ再入力することになります。再入力後には、元の表との一致を[[m06]]必要があります。",
"確認結果を別紙で報告してください。所要時間は25分を想定しています。",
"なお、元のデータを機械で照合できる場合、再入力と別紙作成は必要ありません。"]},
{id:"07",title:"国会答弁の数字が足りません",meta:"因果更新により発生｜大臣官房・高橋",summary:"国会に必要な100社分に達せず、緊急の追加確認を指示。",generated:true,paras:[
"森係長。お疲れさまです。",
"提出予定の資料について、調査対象が不足しています。国会から求められているのは最低100社です。",
"追加の[[n07]]社分について、至急連絡先を確認し、回答を取りまとめてください。急な追加作業なので、1社あたり3分を見込んでいます。",
"なお、人数の記載だけを修正しても回答を入手したことにはなりません。確認対象を減らした理由についても別途ご説明ください。"]},
{id:"08",title:"提出期限変更に伴う対応",meta:"因果更新により発生｜大臣官房・高橋",summary:"省内の完成予定が国会開催後となり、理由書の作成を指示。",generated:true,paras:[
"森係長。お疲れさまです。",
"国会説明資料の完成予定日が委員会開催日より後になっていることを確認しました。",
"念のため申し上げますが、国会の開催日は変更されておりません。",
"至急、明日の委員会に提出できない理由を[[m08]]ようお願いいたします。作業時間は45分を想定しています。",
"なお、この説明によって本来の国会資料の提出義務が免除されるわけではありません。"]}
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
let state={values:{...INIT},history:[],first:null,second:null,notice:"",expanded:new Set(["01","02"]),ended:false};
function esc(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function eligible(id,r){return id==="01"||id==="03"||id==="04"||id==="05"||(id==="02"&&r.org)||(id==="06"&&r.extra06)||(id==="07"&&r.extra07)||(id==="08"&&r.extra08);}
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
 qs("#previewPanel").hidden=false;
 qs("#previewPanel").scrollIntoView({behavior:"smooth",block:"nearest"});
}
function updateSelection(key){
 if(state.ended)return;
 if(state.history.length>=3){state.notice="確定できる交換は3回までです。巻き戻すか、結末を確認してください。";render();return;}
 if(!state.first){state.first=key;render();return;}
 if(state.first===key){state.first=null;render();return;}
 preview(state.first,key);
}
function applySwap(){
 if(!state.first||!state.second||state.history.length>=3)return;
 const a=state.first,b=state.second;
 if(validatePair(a,b,state.values))return;
 const before=rules(state.values);
 state.history.push({values:{...state.values},pair:[a,b]});
 const tmp=state.values[a];state.values[a]=state.values[b];state.values[b]=tmp;
 const after=rules(state.values);
 const oldIds=new Set(before.active.map(d=>d.id)),newIds=new Set(after.active.map(d=>d.id));
 const added=after.active.filter(d=>!oldIds.has(d.id)).map(d=>d.title);
 const removed=before.active.filter(d=>!newIds.has(d.id)).map(d=>d.title);
 const delta=after.total-before.total;
 state.notice="第"+state.history.length+"交換："+labels[a]+" ⇔ "+labels[b]+"。残業 "+(delta>=0?"+":"")+delta+"分。"
 +(added.length?"　新規：「"+added.join("」「")+"」。":"")
 +(removed.length?"　消滅：「"+removed.join("」「")+"」。":"");
 state.first=null;state.second=null;qs("#previewPanel").hidden=true;
 if(added.length)state.expanded.add(after.active.find(d=>!oldIds.has(d.id)).id);
 render();
 if(state.history.length===3)setTimeout(showEnding,700);
}
function undo(){
 if(!state.history.length)return;
 const item=state.history.pop();state.values={...item.values};state.first=null;state.second=null;
 state.ended=false;state.notice="交換を1手巻き戻しました。過去の文書と残業を再計算しました。";
 qs("#previewPanel").hidden=true;render();
}
function restart(){
 state={values:{...INIT},history:[],first:null,second:null,notice:"最初の歴史へ戻しました。",expanded:new Set(["01","02"]),ended:false};
 qs("#previewPanel").hidden=true;render();window.scrollTo({top:0,behavior:"smooth"});
}
function showEnding(){
 const r=rules(state.values), moves=state.history.length;
 let heading,story,kind;
 if(!r.org){heading="部署が存在しないため、残業ゼロ";kind="bad";story="改革推進部の設置は承認されなかったことになりました。残業は0分、政策成果も成立していません。国会事務局からは「説明する部署がない理由」の説明を求められています。";}
 else if(r.clean){heading="真の改革：政策も部署も維持";kind="good";story="必要な数字を確保し、残業を増やさずに国会へ提出できました。ただし、因果観察室の歴史修正担当者は45分残業しています。本件は集計対象外です。";}
 else if(r.completed){heading="指標上の改革：対象部署は残業ゼロ";kind="warn";story="改革推進部の残業は消えましたが、別業務の残業が残っています。集計対象を変えるだけでも、成果指標は100%改善するようです。";}
 else if(!r.policy){heading="残業の数字より大切なもの";kind="bad";story="残業の有無にかかわらず、国会へ提出できる有効な資料・期限・確認体制が確保されていません。「残業を減らしました」という説明だけでは国会を通過できません。";}
 else{heading="改革はまだ道半ば";kind="warn";story="国会資料の品質と部署の存続は守られましたが、残業が残っています。もう一度別の過去を作ることができます。";}
 state.ended=true;qs("#ending").hidden=false;
 qs("#ending").className="ending "+kind;
 qs("#endingTitle").textContent=heading;
 qs("#endingBody").textContent=story;
 qs("#endingStats").textContent="使用した交換 "+moves+"/3｜対象部署の残業 "+r.total+"分｜他業務の残業 "+r.secondary+"分｜文書 "+r.active.length+"件";
 qs("#ending").scrollIntoView({behavior:"smooth",block:"start"});
}
function init(){
 qs("#documents").addEventListener("click",event=>{
  const btn=event.target.closest("button[data-slot]");if(!btn)return;
  event.preventDefault();event.stopPropagation();updateSelection(btn.dataset.slot);
 });
 qs("#apply").addEventListener("click",applySwap);
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