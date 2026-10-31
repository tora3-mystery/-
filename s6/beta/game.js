(() => {
'use strict';
const D=window.S6_DATA, APP=document.getElementById('app'), KEY='s6-vocaloid-beta-060', Dialogue=window.S6_BETA_DIALOGUE, Story=window.S6_BETA_STORY, Music=window.S6_BETA_MUSIC, Routes=window.S6_BETA_ROUTES;
const VERSION='0.8.3', BUILD='2026-10-31 11:43 JST';
const WEEK=['月曜 4月6日','火曜 4月7日','水曜 4月8日','木曜 4月9日','金曜 4月10日'];
const DATES=['2026-04-06','2026-04-07','2026-04-08','2026-04-09','2026-04-10'];
const people=Object.fromEntries(D.people.map(p=>[p.person_id,p]));
const clubs=Object.fromEntries(D.orgs.map(o=>[o.org_id,o]));
const events=Object.fromEntries(D.events.map(e=>[e.event_id,e]));
const groups=Object.fromEntries(D.groups.map(g=>[g.group_id,g]));
const accounts=Object.fromEntries(window.S6_BETA_SOCIAL.accounts.map(a=>[a.person_id+'|'+a.platform,a]));
const PostActivity=window.S6_BETA_POST_ACTIVITY;
const profiles=Object.fromEntries(D.socialProfiles.map(p=>[p.person_id,p]));
const actions=Object.fromEntries(D.actions.map(a=>[a.group_id,a]));
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const unique=a=>[...new Set(a)];
const label=id=>clubs[id]?.common_name||'新入生';
const byEvent=eid=>unique(D.members.filter(m=>m.event_id===eid).map(m=>m.person_id));
const byGroup=gid=>D.members.filter(m=>m.group_id===gid).map(m=>m.person_id);
// A replay changes only card/portrait arrangement, never membership, facts, clues or event dates.
const arrange=(items,salt)=>items.slice().sort((a,b)=>{
 const hash=x=>{let n=(Number(S?.presentationSeed)||0)>>>0;for(const c of String(salt)+'|'+String(x))n=Math.imul(n^c.charCodeAt(0),16777619)>>>0;return n>>>0;};
 const ka=hash(a.group_id||a.event_id||a),kb=hash(b.group_id||b.event_id||b);
 return ka===kb?String(a.group_id||a.event_id||a).localeCompare(String(b.group_id||b.event_id||b)):ka-kb;
});
const date=()=>DATES[Math.min(S.day,4)];
const initial=()=>({
 schema:1,phase:'title',day:0,selectedEvent:null,group:null,target:null,presentationSeed:Math.floor(Math.random()*1000000000),
 eventHistory:[],seen:[],introduced:[],flash:[],visitedGroups:[],groupVisitHistory:[],groupDone:{},groupLog:{},spokenTo:[],interacted:[],personalIntroduced:{},photoRequests:[],photoFollows:[],affinity:{},relationshipDays:{},dailyAffinity:{},contacts:[],socialLinked:{},socialCandidates:{},selectedSocial:null,onlineSeen:{},onlineAccounts:{},onsiteSeen:[],zitterFollows:[],groupContacts:{},groupOffers:{},
 guesses:{},note:{},clues:[],crossings:{},knownOrg:{},nightChoice:{},viewedPlatforms:{},viewedBoard:{},pendingContacts:[],
 checks:{},currentNotebook:null,camp:'',profileGuess:{},profileEvidence:[],routeVisits:[],musicKnown:{},profileReturn:'night',navStack:[],aliases:{},
 report:'',result:'',savedAt:''
});
let S,hydrationChanged=false;
try {const raw=JSON.parse(localStorage.getItem(KEY));S=raw&&raw.schema===1?raw:initial()}catch{S=initial()}
function hydrate(){
 for(const k of ['eventHistory','seen','introduced','flash','visitedGroups','groupVisitHistory','contacts','clues','spokenTo','interacted','pendingContacts','photoRequests','photoFollows','profileEvidence','routeVisits','navStack','onsiteSeen','zitterFollows'])
  if(!Array.isArray(S[k])){S[k]=[];hydrationChanged=true}
 for(const k of ['groupDone','guesses','note','crossings','knownOrg','nightChoice','viewedPlatforms','viewedBoard','groupLog','personalIntroduced','affinity','relationshipDays','dailyAffinity','checks','socialLinked','socialCandidates','profileGuess','musicKnown','aliases','onlineSeen','onlineAccounts','groupContacts','groupOffers'])
  if(!S[k]||typeof S[k]!=='object'){S[k]={};hydrationChanged=true}
}
hydrate();
if(!Number.isFinite(S.presentationSeed)){S.presentationSeed=0;hydrationChanged=true}
// Old saves had a generic "spokenTo" flag, but no separately persisted direct introduction.
for(const id of S.spokenTo)if(!S.personalIntroduced[id]){S.personalIntroduced[id]=true;hydrationChanged=true}
if(hydrationChanged)localStorage.setItem(KEY,JSON.stringify(S));
if(S.phase==='flash'&&!S.group){S.phase='venue';localStorage.setItem(KEY,JSON.stringify(S));}
for(const [gid,result] of Object.entries(S.groupDone))if(result&&!S.groupLog[gid])S.groupLog[gid]=[{pid:null,type:'旧版の交流',text:result}];
const PEERS=new Set(['P013','P014','P015','P016']);
const peerClass=id=>PEERS.has(id)?' peer-highlight':'';
const canEditNotebook=()=>S.navStack.some(p=>['night','sns','board'].includes(p))||['night','sns','board'].includes(S.returnTo);
const relationship=id=>Dialogue.relationshipLabel(S,id);
const provisionalName=id=>'人物'+String(Math.max(0,S.seen.indexOf(id))+1).padStart(2,'0');
const displayName=id=>S.aliases[id]|| (S.guesses[id]?.verified?people[id].name:provisionalName(id));
const eventName=gid=>gid==='E02-A'?'ボカロ曲の音作り':groups[gid]?.group_title||'';
const sourceLabel=(gid,day)=>{const ev=events[groups[gid]?.event_id];return (day||WEEK[S.day])+' ／ '+label(ev?.org_id)+' ／ '+(ev?.title||'新歓')+' ／ '+eventName(gid)};
function openLayer(phase){if(S.phase===phase)return;S.navStack.push(S.phase);go(phase)}
function closeLayer(fallback='night'){const next=S.navStack.pop()||fallback;go(next===S.phase?fallback:next)}
const contactBadge=id=>[
 S.contacts.includes(id)?'TINE交換済':S.pendingContacts.includes(id)?'TINE確認待ち':'',
 S.photoFollows.includes(id)?'Photogramフォロー中':S.photoRequests.includes(id)?'Photogram申請中':'',
 S.zitterFollows.includes(id)?'Zitterフォロー中':''
].filter(Boolean).map(x=>' ／ '+x).join('');
const onlineLabel=id=>Object.keys(S.onlineSeen[id]||{}).map(x=>x==='Photogram'?'Photogramで顔を見た':x==='Zitter'?'Zitterで顔を見た':x+'で顔を見た').join('・');
function recordOnline(platform){
 if(!['Photogram','Zitter'].includes(platform))return;
const visible=D.posts.filter(p=>p.platform===platform&&p.published_at.slice(0,10)<=date()&&
  (p.visibility==='公開'||(p.visibility==='鍵垢・承認制'&&S.photoFollows.includes(p.author_id))));
 for(const p of visible){
   const a=accounts[p.author_id+'|'+platform];
   if(!a||p.visibility==='匿名表示')continue;
   const key=platform+'|'+a.handle;
   S.onlineAccounts[key]={platform,handle:a.handle,name:a.display_name,seenAt:date(),face:a.avatar_kind==='face'};
   if(a.avatar_kind==='face'){
     if(!S.seen.includes(p.author_id))S.seen.push(p.author_id);
     (S.onlineSeen[p.author_id]??={})[platform]={handle:a.handle,name:a.display_name,seenAt:date()};
   }
 }
}
function saveRouteClue(id,reply){
 const node=Routes.get(S.group,id);if(!node)return;
 const ev=events[groups[S.group].event_id],key=S.group+'|'+id;
 if(!S.routeVisits.some(x=>x.key===key))S.routeVisits.push({key,pid:id,hall:label(ev.org_id)+' ／ '+ev.title+' ／ '+eventName(S.group),date:'2026年4月'+(S.day+6)+'日（'+WEEK[S.day].slice(0,2)+'）',text:reply,route:node.route});
 for(const [topic,value,source] of node.facts||[])
  if(!S.profileEvidence.some(x=>x.pid===id&&x.topic===topic&&x.value===value))
   S.profileEvidence.push({pid:id,topic,value,source,visitKey:key,recordedAt:sourceLabel(S.group,'2026年4月'+(S.day+6)+'日（'+WEEK[S.day].slice(0,2)+'）')});
}
// Per-person contact develops gradually, with at most two meaningful exchanges per day.
const recordConversation=(id,action)=>{
 const today=date(),key=id+'|'+today,used=Math.max(0,Number(S.dailyAffinity[key])||0);
 if(used>=2)return;
 const gain=Math.min(2-used,Dialogue.responseGain(id,action));
 if(gain<=0)return;
 S.dailyAffinity[key]=used+gain;
 S.affinity[id]=Math.min(6,Math.max(0,Number(S.affinity[id])||0)+gain);
 S.relationshipDays[id]=unique([...(S.relationshipDays[id]||[]),today]);
};
const remember=()=>{S.savedAt=BUILD;localStorage.setItem(KEY,JSON.stringify(S))};
const btn=(t,a,v='',klass='')=>'<button class="btn '+klass+'" data-act="'+esc(a)+'" '+(v?'data-id="'+esc(v)+'"':'')+'>'+esc(t)+'</button>';
const portrait=(id,klass='')=>'<img class="portrait '+klass+'" src="../'+esc(people[id].portrait_path)+'" loading="lazy" decoding="async" alt="学生の顔写真">';
const campusClub=o=>'<span class="pill">'+esc(o)+'</span>';
const header=()=>'<header class="top"><div><strong>サークルは、星の数ほどありますから。</strong><small>β v'+VERSION+' ／ '+BUILD+'</small></div><div class="head-actions">'+(S.phase!=='title'&&S.phase!=='intro'?btn('人物手帳','open-notebook','','mini'):'')+btn('保存','save','','mini')+btn('最初から','reset','','mini ghost')+'</div></header>';
function faceCard(id,sub='',act='',extra=''){
 return '<div class="face-card">'+portrait(id)+'<div class="face-content">'+(sub?'<div class="face-meta">'+esc(sub)+'</div>':'')+
 (act?btn(extra||'この顔を選ぶ',act,id,'mini'):'')+'</div></div>';
}
const site=()=>{
 switch(S.phase){
 case 'title':return '<div class="hero"><div class="eyebrow">青嶺大学 / 2026年4月</div><h1>サークルは、<br>星の数ほどありますから。</h1><p>新歓の一週間。六つのサークル、覚えきれないほどの顔と名前。</p><p>その中に、あなたがずっと聴いてきたボカロPがいるらしい。</p>'+btn('はじめる','start')+'<p class="dim">β版：人物照合と音楽探しのシミュレーション。旧版とは保存データが別です。</p></div>';
  case 'warning':return '<div class="eyebrow">BEFORE YOU START</div><h2>この春の約束</h2><div class="paper"><p>この物語は架空の大学と音楽家を扱うフィクションです。</p><p>探す相手は、自分から「見つけたら声をかけて」と公開しています。個人情報を調べたり、相手に正体を明かすよう迫ったりする必要はありません。</p></div>'+btn('新歓の案内を見る','show-campus')+btn('タイトルへ','back-title','','ghost');
  case 'campus':return '<div class="eyebrow">CAMPUS / WELCOME</div><h2>青嶺大学へようこそ。</h2><p>春のキャンパスには新歓のチラシと音楽があふれています。六つの音楽サークルは雰囲気も活動もそれぞれ違います。</p><div class="paper"><h3>見学できるサークル</h3><div class="club-intros">'+D.orgs.map(o=>'<div class="club-intro"><strong>'+esc(o.formal_name)+'</strong><span>'+esc(o.focus)+'</span></div>').join('')+'</div><p class="dim">見学だけでも構いません。掛け持ちで活動している先輩もいます。</p></div><div class="paper"><h3>一週間の過ごし方</h3><p><strong>平日：</strong>1日1新歓、会場で3つの輪まで参加できます。輪に入ると、初めて会った人が自己紹介します。</p><p><strong>交流：</strong>話しかける・話を聞く。1つの輪で合計2回まで行動できます。連絡先は輪を離れるときに聞けます。</p><p><strong>夜：</strong>SNSや掲示を読めます。手帳での顔・名前・所属の照合やメモ編集は夜だけ、回数制限はありません。</p><p><strong>金曜の夜：</strong>週末に参加するサークルを一つ決めます。</p></div>'+btn('主人公について読む','show-intro');
  case 'intro':return '<div class="eyebrow">4月、入学</div><h2>あの曲の作り手に、会えるかもしれない。</h2><div class="paper"><p>高校時代から聴いていた、匿名のボカロP「'+esc(Story.alias)+'」。一番好きな曲は「'+esc(Story.song)+'」。</p><p>'+esc(Story.memory)+'</p><p>大学の新歓が始まる前、活動アカウントに最後の投稿があった。</p><div class="notice">「'+esc(Story.invitation)+'」</div><p>本人からの招待だ。六つのサークルを巡って、演奏や会話の中から手がかりを見つけたい。</p></div><p class="dim">全員の顔と名前を覚える必要はありません。音楽や友人との出会いも自由に楽しんでください。</p>'+btn('4月6日へ','begin');
  case 'day':return daily();
 case 'flash':return firstIntroductions();
 case 'venue':return venue();
 case 'group':return group();
 case 'contact-prompt':return contactPrompt();
 case 'contact-result':return contactResult();
 case 'choose':return chooseAction();
 case 'night':return night();
 case 'sns':return sns();
 case 'sns-match':return snsMatch();
 case 'board':return board();
 case 'notebook':return notebook();
 case 'identity':return identity();
 case 'camp':return camp();
  case 'producer-profile':return producerProfile();
 case 'saturday':return saturday();
 
 case 'end':return ending();
 default:return '<h2>表示を復元できませんでした</h2>'+btn('最初から','reset');
 }
};
function daily(){
 const offers=D.events.filter(e=>e.date===date());
 return '<div class="eyebrow">'+esc(WEEK[S.day])+' / 新歓の予定</div><h2>今日は、どこへ行く？</h2><p>行けるのは一日一つ。明日には別の顔が増えるかもしれない。</p>'+
 '<div class="two">'+arrange(offers,'events-'+S.day).map(e=>'<article class="panel"><span class="tag">'+esc(label(e.org_id))+'</span><h3>'+esc(e.title)+'</h3><p class="dim">'+esc(e.location)+' ／ '+esc(e.start)+'〜'+esc(e.end)+'</p><p>'+esc(clubs[e.org_id].focus)+'</p>'+btn('この新歓へ','attend',e.event_id)+'</article>').join('')+'</div>'+
 '<div class="actions">'+btn('今日は参加しない','skip','','ghost')+btn('人物手帳を見る','open-notebook','','ghost')+'</div>';
}
function firstIntroductions(){
 const newcomers=S.flash,all=byGroup(S.group);
 return '<div class="eyebrow">'+esc(WEEK[S.day])+' / '+esc(eventName(S.group))+'</div><h2>輪の自己紹介</h2>'+
 '<p>初めて会った人が名乗る。顔と名前が並ぶのは初回だけです。同期の新入生には赤い目印を付けています。</p>'+
 '<p class="status">新しく聞く名前 '+newcomers.length+'人 ／ この輪には '+all.length+'人</p>'+
 (newcomers.length?'<div class="faces">'+newcomers.map(id=>'<div class="intro-face'+peerClass(id)+'">'+portrait(id)+
 '<strong>'+esc(displayName(id))+'</strong><span>自己紹介：'+esc(people[id].name)+'</span><span>'+esc(people[id].year)+'年 ／ '+esc(label(people[id].primary_org))+
 (people[id].dual_org?'・'+esc(label(people[id].dual_org))+'も活動':'')+'</span>'+
 (PEERS.has(id)?'<span class="peer-tag">同期の新入生</span>':'')+'</div>').join('')+'</div>':
 '<p>この輪に、初めて自己紹介する人はいません。</p>')+
 '<div class="actions">'+btn('自己紹介を聞き終える','leave-flash')+'</div>';
}
function venue(){
 const e=events[S.selectedEvent];
 const gs=D.groups.filter(g=>g.event_id===e.event_id);
 const ambience=['どこかでアンプの音がして、廊下には別の輪の笑い声が漏れている。','少し遅れて来た見学者が、空いた席を探している。','隣の机から短いフレーズが聞こえ、誰かが拍手した。'];
 return '<div class="eyebrow">'+esc(WEEK[S.day])+' / '+esc(label(e.org_id))+'</div><h2>'+esc(e.title)+'</h2><p class="dim">'+esc(ambience[(S.presentationSeed+S.day)%ambience.length])+'</p>'+
 '<p>あちこちで演奏や会話が始まっている。どの三組に混ざろう？</p><div class="status">話したグループ '+S.visitedGroups.length+' / 3</div>'+
 '<div class="two">'+arrange(gs,'circles-'+S.day).map(g=>'<article class="panel"><h3>'+esc(eventName(g.group_id))+'</h3><p>'+esc(Dialogue.sceneActivity(g.group_id))+'</p><div class="faces small-faces">'+arrange(byGroup(g.group_id),'faces-'+g.group_id).map(id=>portrait(id,peerClass(id))).join('')+'</div>'+
 (S.visitedGroups.includes(g.group_id)?'<span class="pill">参加済み</span>':S.visitedGroups.length>=3?'<span class="dim">今日はここまで</span>':btn('この輪に入る','join-group',g.group_id))+'</article>').join('')+'</div>'+
 '<div class="actions">'+btn('会場を出て夜へ','finish-venue')+'</div>';
}
function speech(pid,text,tag=''){
 const ids=byGroup(S.group),index=ids.indexOf(pid);
 const speaker=displayName(pid);
 return '<div class="chat-line">'+portrait(pid,'chat-avatar'+peerClass(pid))+
 '<div class="chat-content"><div class="chat-speaker">'+esc(speaker)+(PEERS.has(pid)?' <span class="peer-tag">同級生</span>':'')+
 (tag?' <span class="dim">'+esc(tag)+'</span>':'')+'</div><div class="chat-bubble">'+esc(text)+'</div></div></div>';
}
function group(){
 const g=groups[S.group],lines=D.lines.filter(l=>l.group_id===g.group_id).sort((a,b)=>Number(a.order)-Number(b.order));
 const log=S.groupLog[g.group_id]||[],remaining=Math.max(0,2-log.length);
 const chats=lines.slice(0,3).map(l=>speech(l.speaker_id,Dialogue.sceneLine(l))).join('')+
 log.map(x=>{
  if(x.overheard?.length)return '<div class="notice">'+esc(x.text)+'</div>'+
   x.overheard.map(l=>speech(l.pid,l.text,l.tag||'輪の会話')).join('')+
   (x.address&&people[x.address.pid]?speech(x.address.pid,x.address.text,x.address.tag||'声をかけられた'):'');
  const primary=x.pid&&people[x.pid]?speech(x.pid,x.text,x.type):'<div class="notice">'+esc(x.text)+'</div>';
  const actionIntro=x.type==='talk'&&x.pid&&people[x.pid]?'<div class="notice">あなたは'+esc(displayName(x.pid))+'に話しかけた。</div>':'';
  return actionIntro+primary+(x.reply&&people[x.reply.pid]?speech(x.reply.pid,x.reply.text,'輪の反応'):'');
 }).join('');
 return '<div class="eyebrow">'+esc(label(events[g.event_id].org_id))+' / '+esc(eventName(g.group_id))+'</div><h2>輪の会話</h2>'+
 '<p>'+esc(Dialogue.sceneActivity(g.group_id))+'</p>'+(Dialogue.sceneMode(S.group)==='performance'?'<p class="dim">演奏がひと区切りつき、音が止んだところで短い会話が始まる。</p>':'')+
 '<div class="chat-thread">'+chats+'</div>'+
 '<div id="group-action-zone"><p class="status">交流 '+Math.min(log.length,2)+' / 2回'+(remaining?'（あと'+remaining+'回）':'（交流済み）')+'</p>'+
 (remaining?'<div class="paper"><h3>この輪でどう過ごす？</h3><p class="dim">気になる人に話しかけるか、近くの人たちの会話を聞くか選べます。合計2回まで。</p>'+
 '<div class="actions">'+btn('話しかける','action-menu','talk')+btn('話を聞く','listen-group','','ghost')+'</div></div>':
 '<div class="notice">この輪での交流は2回終わりました。連絡先は離れるときに聞けます。</div>')+
 '<div class="actions">'+btn('輪から離れる','leave-group','','ghost')+'</div></div>';
}
function offersHere(){return S.groupOffers[S.group]||[]}
function offerPanel(){
 const offers=offersHere();
 return offers.length?'<div class="paper"><h3>向こうからの申し出</h3><p>別れ際、相手から連絡先の話が出ました。あなたから聞く必要はありません。</p>'+
  offers.map(o=>speech(o.pid,o.text+'（'+o.platform+'：'+(o.status==='pending'?'承認待ち':'つながった')+'）','相手から')).join('')+'</div>':'';
}
function contactPrompt(){
 const ids=byGroup(S.group),g=groups[S.group];
 return '<div class="eyebrow">'+esc(eventName(g.group_id))+'</div><h2>連絡先を聞きますか？</h2>'+
 offerPanel()+
 '<p>輪を離れる前に、ここにいる全員へ聞けます。反応は親しさや公開方針によって違います。自分から聞かなくても構いません。</p>'+
 '<div class="person-list">'+ids.map(id=>'<div class="person-card">'+portrait(id)+
 '<div><strong>'+esc(displayName(id))+'</strong><p class="dim">'+esc(relationship(id))+esc(contactBadge(id))+'</p></div></div>').join('')+'</div>'+
 '<div class="actions">'+btn('全員に連絡先を聞く','ask-group-contacts')+btn('自分からは聞かずに輪を離れる','finish-group','','ghost')+'</div>';
}
function contactResult(){
 const rows=S.groupContacts[S.group]||[];
 return '<div class="eyebrow">'+esc(eventName(S.group))+'</div><h2>連絡先の返事</h2>'+
 offerPanel()+
 '<p>自分から聞いた相手の返事です。公開していないアカウントや匿名の活動名義を無理に特定することはできません。</p>'+
 '<div class="person-list">'+rows.map(row=>'<div class="person-card">'+portrait(row.pid)+
 '<div><strong>'+esc(displayName(row.pid))+'</strong><p class="dim">'+row.results.map(x=>esc(x)).join(' ／ ')+'</p></div></div>').join('')+'</div>'+
 '<div class="actions">'+btn('輪を離れる','finish-group')+'</div>';
}
function registerOffer(o){
 if(o.platform==='TINE'){
  if(o.status==='pending')S.pendingContacts=unique([...S.pendingContacts,o.pid]);
  else S.contacts=unique([...S.contacts,o.pid]);
 }else if(o.platform==='Photogram'){
  if(o.status==='pending')S.photoRequests=unique([...S.photoRequests,o.pid]);
  else S.photoFollows=unique([...S.photoFollows,o.pid]);
 }else if(o.platform==='Zitter')S.zitterFollows=unique([...S.zitterFollows,o.pid]);
}
function prepareGroupOffers(){
 if(Object.prototype.hasOwnProperty.call(S.groupOffers,S.group))return;
 const possible=byGroup(S.group).map(id=>Dialogue.spontaneousContact(id,S.group,S)).filter(Boolean);
 // Limit unsolicited requests to one person per departure.
 const offers=possible.slice(0,1);
 S.groupOffers[S.group]=offers;
 for(const o of offers)registerOffer(o);
}
function exchangeGroupContacts(){
 if(S.groupContacts[S.group])return;
 S.groupContacts[S.group]=byGroup(S.group).map(pid=>{
  const p=window.S6_BETA_PROFILES.people[pid],rules=D.contactChannels.filter(r=>r.group_id===S.group&&r.person_id===pid);
  const rule=platform=>rules.find(r=>r.platform===platform);
  const results=[],t=accounts[pid+'|TINE'],pr=accounts[pid+'|Photogram'],z=accounts[pid+'|Zitter'];
  const known=S.interacted.includes(pid),close=Dialogue.level(S,pid),guard=p.caution;
  const trusted=known||close==='familiar'||close==='easygoing';
  const prefersPublic=p.snsTone==='active'&&p.warmth<4&&!trusted;
  let reaction='cautious',success=false,pending=false;
  // Personal contacts need more trust than publicly posted accounts.
  if(t&&rule('TINE')){
   if(S.contacts.includes(pid)){results.push('TINE：交換済み');reaction='already';success=true}
   else if(S.pendingContacts.includes(pid)){results.push('TINE：確認待ち');reaction='already';pending=true}
   else if(rule('TINE').approval_policy==='after_week'){results.push('TINE：今週は交換しない');reaction='after_week'}
   else if((guard>=3&&!trusted)||prefersPublic){
    results.push('TINE：今は交換しない');reaction=prefersPublic?'public':'cautious';
   }else{
    const reply=Dialogue.contact(pid,S.group,S);
    if(reply.result==='accept'){S.contacts.push(pid);results.push('TINE：交換');success=true}
    else if(reply.result==='pending'){S.pendingContacts.push(pid);results.push('TINE：明日確認');pending=true}
    else{results.push('TINE：また今度');reaction='cautious'}
   }
  }
  if(pr&&rule('Photogram')){
   const policy=rule('Photogram').approval_policy;
   if(S.photoFollows.includes(pid)){results.push('Photogram：フォロー済み');success=true}
   else if(S.photoRequests.includes(pid)){results.push('Photogram：承認待ち');pending=true}
   else if(policy==='after_week'){results.push('Photogram：今週は申請を受けない');if(!success&&!pending)reaction='after_week'}
   else if(p.snsTone==='private'&&!trusted){results.push('Photogram：個人用なので非公開');if(!success&&!pending)reaction='privacy'}
   else if(policy==='next_day'){S.photoRequests.push(pid);results.push('Photogram：翌日承認');pending=true}
   else{S.photoFollows.push(pid);results.push('Photogram：フォロー');success=true}
  }
  if(z&&z.visibility==='公開'&&(p.snsTone==='active'||(p.warmth>=3&&guard<=2))){
   if(S.zitterFollows.includes(pid))results.push('Zitter：フォロー済み');
   else{S.zitterFollows.push(pid);results.push('Zitter：公開アカウントを紹介');}
   success=true;
  }
  if(!results.length){
   const hasAccount=!!(t||pr||z);
   reaction=hasAccount?(guard>=3?'privacy':'cautious'):'no_sns';
   results.push(hasAccount?'今は共有できる連絡先がない':'使っているSNSはない');
  }else if(success&&reaction!=='already')reaction='accept';
  else if(pending&&reaction!=='already')reaction='pending';
  results.unshift('「'+Dialogue.contactReaction(pid,S.group,S,reaction)+'」');
  return {pid,results};
 });
}
function chooseAction(){
 const mode=S.mode,questionMode=mode==='question';
 const qmap=Object.fromEntries(D.questions.filter(q=>q.group_id===S.group).map(q=>[q.target_id,q]));
 const items=byGroup(S.group).map(id=>{
  const q=qmap[id],name=displayName(id);
  return '<div class="person-card">'+portrait(id,peerClass(id))+'<div><strong>'+esc(name)+'</strong><p class="dim">'+esc(relationship(id))+esc(contactBadge(id))+'</p>'+
  (questionMode?'<p class="dim">'+esc(Dialogue.questionText(q))+'</p>':'')+
  btn(questionMode?'この質問をする':mode==='social'?'SNSについて聞く':mode==='contact'?'交換を頼む':mode==='photo'?'Photogramを聞く':'話しかける','act-target',id,'mini')+
  (questionMode&&q?btn('所属について聞く','ask-affiliation',id,'mini ghost'):'')+
   (questionMode?btn('余白ラムネの話','ask-producer',id,'mini ghost')+btn('音楽経験を聞く','ask-music',id,'mini ghost'):'')+'</div></div>';
 }).join('');
 return '<div class="eyebrow">'+esc(eventName(S.group))+'</div><h2>'+
 (mode==='talk'?'誰に話しかける？':mode==='social'?'誰にSNSを聞く？':mode==='contact'?'誰に連絡先を頼む？':mode==='photo'?'誰のPhotogramを聞く？':'誰に何を聞く？')+'</h2>'+
 '<p>顔を見比べながら話す相手を選びます。会場で聞いた名前を思い出せるでしょうか。</p>'+
 '<div class="person-list">'+items+'</div>'+btn('輪に戻る','back-group','','ghost');
}
function night(){
 return '<div class="eyebrow">'+esc(WEEK[S.day])+' / 夜</div><h2>今日の音、誰のものだろう。</h2>'+
 '<p>今日出会った人を思い出す。SNS・公開掲示はすべて閲覧可能。手帳での照合とメモ編集は夜だけ、回数無制限です。</p>'+
 '<div class="status">今夜は何度でも調べて照合できます</div>'+
 (S.report?'<div class="notice">'+esc(S.report)+'</div>':'')+
 '<div class="actions">'+btn('人物手帳で照合する','open-notebook')+
 btn('Photogram','night-sns','Photogram')+
 btn('Zitter','night-sns','Zitter')+
 btn('TINE','night-sns','TINE')+
 btn('学内の掲示を見る','night-board')+btn('余白ラムネのプロフィール','open-producer-profile')+'</div>'+
 (S.viewedPlatforms[date()]?.length?'<p class="dim">閲覧済み：'+esc(S.viewedPlatforms[date()].join('、'))+'</p>':'')+
 '<div class="actions">'+btn(S.day===4?'金曜の夜、合宿を決める':'翌日へ','next-day')+'</div>';
}
function sns(){
 const platform=S.snsPlatform;
  const zitterFollowing=platform==='Zitter'?unique(S.zitterFollows).filter(pid=>accounts[pid+'|Zitter']?.visibility==='公開'):[];
 const zitterStatus=platform==='Zitter'&&zitterFollowing.length?
  '<div class="paper"><h3>交換したZitterアカウント '+zitterFollowing.length+'人</h3>'+
  zitterFollowing.map(pid=>{const a=accounts[pid+'|Zitter'];return '<p class="dim">手帳：'+esc(displayName(pid))+' ／ '+esc(a.display_name)+' @'+esc(a.handle)+'</p>';}).join('')+'</div>':'';

 const tineContacts=platform==='TINE'?unique(S.contacts).filter(id=>!!people[id]&&!!accounts[id+'|TINE']):[];
 const tineMessages=tineContacts.length?'<div class="paper"><h3>交換済みの連絡先</h3><p class="dim">連絡先の交換と、ネット上の活動名義は別の話。</p>'+
  tineContacts.map(id=>{
    const msg=Dialogue.snsMessage(id,S);
    if(!msg)return '';
    const a=accounts[id+'|TINE'];
    return '<div class="social">'+(a.avatar_kind==='face'?portrait(id):'<div class="avatar-icon">♪</div>')+
      '<div><strong>'+esc(a.display_name)+'</strong><p class="dim">手帳：'+esc(displayName(id))+' ／ '+esc('@'+a.handle)+'</p><p>'+esc(msg.text)+'</p></div></div>';
  }).join('')+'</div>':'';
 const photoFollowing=platform==='Photogram'?unique(S.photoFollows).filter(pid=>accounts[pid+'|Photogram']):[];
 const photoPending=platform==='Photogram'?unique(S.photoRequests).filter(pid=>accounts[pid+'|Photogram']):[];
 const photoStatus=platform==='Photogram'?
   '<div class="paper"><h3>フォロー中 '+photoFollowing.length+'人 ／ 承認待ち '+photoPending.length+'人</h3>'+
   (photoFollowing.length?photoFollowing.map(pid=>{const a=accounts[pid+'|Photogram'],activity=PostActivity.at(pid,'Photogram',date());return '<div class="social">'+(a.avatar_kind==='face'?portrait(pid):'<div class="avatar-icon">♪</div>')+'<div><strong>'+esc(a.display_name)+'</strong><p class="dim">手帳：'+esc(displayName(pid))+' ／ @'+esc(a.handle)+' ／ フォロー中</p><p class="dim">'+(activity.count===0?'投稿0件（この日時点）':'投稿'+activity.count+'件（この日時点）')+' ／ 新歓開始前 '+activity.start+'件</p></div></div>';}).join(''):'<p class="dim">まだフォローした相手はいません。</p>')+
   (photoPending.length?'<p class="dim">承認待ち：'+photoPending.map(pid=>esc(accounts[pid+'|Photogram'].display_name)).join('、')+'。翌日に確認される予定です。</p>':'')+'</div>':'';
 const visible=D.posts.filter(p=>p.platform===platform&&p.published_at.slice(0,10)<=date()&&
 (p.visibility==='公開'||p.visibility==='匿名表示'||(p.visibility==='鍵垢・承認制'&&S.photoFollows.includes(p.author_id))||
 ((p.visibility==='グループ参加者'||p.visibility==='主人公との個別')&&S.contacts.includes(p.author_id))));
 return '<div class="eyebrow">SNS / '+esc(platform)+'</div><h2>タイムライン</h2>'+
 '<p class="dim">写真を出している人も、出していない人もいる。名前の似たアカウントが同じ人とは限らない。</p>'+
 (S.report?'<div class="notice">'+esc(S.report)+'</div>':'')+tineMessages+photoStatus+zitterStatus+
 (visible.length?visible.map(p=>{
  const a=accounts[p.author_id+'|'+platform];
  const anonymous=p.visibility==='匿名表示';
  const face=!anonymous&&a?.avatar_kind==='face';
  const avatar=face?portrait(p.author_id):'<div class="avatar-icon">♪</div>';
  const activity=PostActivity.at(p.author_id,platform,date());
  return '<div class="social">'+avatar+'<div><strong>'+esc(anonymous?'匿名アカウント':a?.display_name||'不明')+'</strong>'+
  '<div class="dim">'+(anonymous?'':esc('@'+a.handle)+' ／ ')+(anonymous?'':'投稿'+activity.count+'件 ／ ')+esc(p.published_at)+'</div><p>'+esc(Story.posts[p.post_id]||window.S6_BETA_SOCIAL.postTexts[p.post_id]||p.text)+'</p>'+
  (face?'<p class="dim">プロフィール写真は人物手帳に記録されています（本名は未確認の場合があります）。</p>':'')+'</div></div>';
 }).join(''):'<p>閲覧できる投稿はありません。</p>')+
 '<div class="actions">'+btn('夜の画面に戻る','back-night','','ghost')+'</div>';
}
function snsMatch(){
 const post=D.posts.find(p=>p.post_id===S.selectedSocial);
 if(!post)return '<h2>投稿が見つかりません</h2>'+btn('戻る','back-sns','','ghost');
 const a=accounts[post.author_id+'|'+post.platform];
 const entries=S.seen.map(id=>faceCard(id,displayName(id),'match-social-face','この顔かな'));
 return '<div class="eyebrow">'+esc(post.platform)+' / PHOTO</div><h2>この顔、会場で見た？</h2>'+
 '<div class="chosen">'+portrait(post.author_id,'large')+'<div><strong>'+esc(a?.display_name||'アカウント')+'</strong><p class="dim">'+esc('@'+(a?.handle||''))+' ／ 写真を公開しているアカウント</p></div></div>'+
 '<p>新歓で見た顔から、同じ人だと思う写真を選んでください。これは推測のメモで、正誤は自動判定されません。</p>'+
 (S.report?'<div class="notice">'+esc(S.report)+'</div>':'')+
 '<div class="faces">'+entries.join('')+'</div>'+
 btn('SNSに戻る','back-sns','','ghost');
}
const notices=Story.board;
function board(){
 return '<div class="eyebrow">学内掲示 / '+esc(WEEK[S.day])+'</div><h2>新歓音楽掲示</h2>'+
 '<div class="paper"><p>'+esc(notices[S.day])+'</p></div>'+
 '<p class="dim">うわさも音楽の好みも、誰か一人の正体を直接教えてはくれない。</p>'+
 btn('夜の画面へ戻る','back-night','','ghost');
}
function notebook(){
 const known=S.seen.slice().sort((a,b)=>a.localeCompare(b));
 const entries=known.map(id=>{
 const guess=S.guesses[id],verified=guess?.verified;
 const note=S.note[id]||'';
 return '<div class="person-card">'+portrait(id)+'<div><strong>'+esc(displayName(id))+(verified?' <span class="pill">照合済み</span>':'')+'</strong>'+
 '<p class="dim">'+(verified?'所属：'+esc(label(people[id].primary_org))+(people[id].dual_org?' ／ 他にも所属あり':''):'本名・所属は未照合')+'</p>'+
  '<p class="dim">'+esc(S.onsiteSeen.includes(id)?'会場で見た':'SNSの写真で見た')+(onlineLabel(id)?' ／ '+esc(onlineLabel(id)):'')+'</p>'+
 '<p class="dim">'+esc(relationship(id))+esc(contactBadge(id))+'</p>'+
 ((S.socialLinked[id]||[]).length?'<p class="dim">自分のSNS照合メモ：'+esc(S.socialLinked[id].join('、'))+'</p>':'')+
 (S.knownOrg[id]&&!verified?'<p class="dim">話して聞いた所属：'+esc(label(S.knownOrg[id]))+'</p>':'')+
 (note?'<p class="dim">メモ：'+esc(note)+'</p>':'')+
  (S.musicKnown[id]?'<p class="dim">音楽経験：'+Music.columns.filter(k=>['◎','○'].includes(Music.people[id].skills[k])).map(k=>esc(MUSIC_LABELS[k])).join('、')+'</p>':'')+
 btn(verified?'記録を見る':canEditNotebook()?'この顔を照合':'顔を見る','open-identity',id,'mini')+'</div></div>';
 }).join('');
 return '<div class="eyebrow">PERSONAL NOTEBOOK</div><h2>顔と名前の手帳</h2>'+
 '<p>会場や公開SNSで見た顔 '+known.length+'人。SNSだけで見た人の本名・所属は未確認です。</p>'+
 (canEditNotebook()?'<p class="status">夜の照合・メモ編集は何度でもできます</p>':'<p class="status">昼は閲覧のみ。照合・編集は夜にできます</p>')+
 (S.report?'<div class="notice">'+esc(S.report)+'</div>':'')+
 '<div class="person-list">'+(entries||'<p>まだ誰にも会っていません。</p>')+'</div>'+
 (Object.values(S.onlineAccounts).some(x=>!x.face)?'<div class="paper"><h3>SNSで見かけたアカウント</h3><p class="dim">顔が出ていないアカウントは、誰のものか自動では特定しません。</p>'+
 Object.values(S.onlineAccounts).filter(x=>!x.face).map(x=>'<p class="dim">'+esc(x.platform)+' ／ '+esc(x.name)+' @'+esc(x.handle)+' ／ '+esc(x.seenAt)+'</p>').join('')+'</div>':'')+
 btn('余白ラムネのプロフィール','open-producer-profile')+btn('戻る','back-from-notebook','','ghost');
}
function identity(){
 const id=S.currentNotebook,person=people[id],guess=S.guesses[id],editable=canEditNotebook();
 const names=unique(S.introduced).map(pid=>people[pid]).sort((a,b)=>a.name.localeCompare(b.name,'ja'));
 const options=names.map(p=>'<option value="'+esc(p.person_id)+'">'+esc(p.name)+'</option>').join('');
 const note=S.note[id]||'';
 const form=guess?.verified?'<div class="notice">'+esc(person.name)+' ／ '+esc(label(person.primary_org))+'。照合済み。</div>':
 editable?'<div class="paper"><label>名前<select id="guessName"><option value="">選ぶ</option>'+options+'</select></label>'+
 '<label>主に所属している団体<select id="guessOrg"><option value="">選ぶ</option>'+D.orgs.map(o=>'<option value="'+esc(o.org_id)+'">'+esc(o.common_name)+'</option>').join('')+
 '<option value="N">まだサークルに所属していない新入生</option></select></label>'+
 '<p class="dim">何度でも照合できます。名前と所属を選んでください。</p>'+btn('名前と所属を照合','submit-identity')+'</div>':
 '<p class="dim">夜になると、ここで名前と所属を照合できます。</p>';
 const notes=editable?'<div class="paper"><label>この人物の表示名<input id="aliasName" maxlength="32" value="'+esc(S.aliases[id]||'')+'" placeholder="'+esc(provisionalName(id))+'（自由に変更）"></label><p class="dim">表示名は会話・人物一覧・手帳で共通です。空欄に戻すと仮名になります。</p><label>自由メモ<textarea id="faceNote" rows="2" maxlength="160" placeholder="髪型、見た場所、会話の印象など">'+esc(note)+'</textarea></label>'+btn('表示名とメモを保存','save-note','','mini')+'</div>':
 note?'<div class="paper"><p>メモ：'+esc(note)+'</p></div>':'';
 return '<div class="eyebrow">NOTEBOOK / FACE</div><h2>この人は誰？</h2><div class="chosen">'+portrait(id,'large')+
 '<p class="dim">現在の表示名：'+esc(displayName(id))+'。どこで会ったか、何という名前だったかを思い出してください。</p></div>'+
 form+notes+(S.musicKnown[id]?musicSkills(id):'')+btn('人物一覧へ','back-identity','','ghost');
}

const MUSIC_LABELS={vocal:'ボーカル',guitar:'ギター',bass:'ベース',drums:'ドラム',keyboard:'キーボード',other:'その他',dtm:'DTM'};
function musicSkills(id){
 const m=Music.people[id];if(!m)return '';
 return '<div class="paper"><h3>聞き取った音楽経験</h3><p class="dim">◎ 主担当 ／ ○ 演奏できる ／ △ 少し経験 ／ × ほぼ未経験</p>'+
 '<div class="status">'+Music.columns.map(k=>esc(MUSIC_LABELS[k])+' '+esc(m.skills[k])).join(' ／ ')+'</div>'+
 '<p>オリジナル曲：'+(m.composition.original?'あり':'なし')+' ／ コピー曲：'+(m.composition.cover?'あり':'なし')+'</p></div>';
}
function producerProfile(){
 const fields=[
  ['year','学年',['','1年','2年','3年','4年']],
  ['faculty','学部・学科',['',...new Set(D.people.map(p=>p.faculty))].sort((a,b)=>a.localeCompare(b,'ja'))],
  ['instruments','担当・演奏',['','歌','ギター','歌とギター','ベース','ドラム','キーボード','DTM','その他']],
  ['favorite','好きな音楽',['','羊文学','きのこ帝国','サカナクション','ASIAN KUNG-FU GENERATION','YOASOBI','その他']],
  ['production','制作方法',['','生ギター＋歌声合成','DTM中心','バンド生演奏','弾き語り中心','その他']],
  ['org','所属',['',...D.orgs.map(o=>o.org_id)]]
 ];
 const form=fields.map(([k,title,values])=>'<label>'+esc(title)+'<select id="profile-'+k+'">'+values.map(v=>'<option value="'+esc(v)+'"'+((S.profileGuess[k]||'')===v?' selected':'')+'>'+esc(k==='org'&&v?label(v):v||'まだ分からない')+'</option>').join('')+'</select></label>').join('');
 const topicLabels={year:'学年',faculty:'学部・学科',instruments:'担当・演奏',favorite:'好きな音楽',production:'制作方法',org:'所属'};
 const facts=S.profileEvidence.map(x=>{
   const visit=S.routeVisits.find(v=>v.pid===x.pid&&(v.key===x.visitKey||!x.visitKey));
   const location=x.recordedAt|| (visit?visit.date+' ／ '+visit.hall:'会場情報は旧記録にありません');
   return '<div class="notice"><strong>'+esc(topicLabels[x.topic]||x.topic)+'</strong>：'+esc(x.value)+
    '<p class="dim">出所：'+esc(location)+' ／ 話した相手：'+esc(displayName(x.pid))+'（'+esc(x.source)+'）</p></div>';
  }).join('');
 const refs=S.routeVisits.map(x=>'<p class="dim">・'+esc(x.date)+' '+esc(x.hall)+'：'+esc(x.text)+'</p>').join('');
 return '<div class="eyebrow">PROFILE / NO ANSWER CHECK</div><h2>余白ラムネのプロフィール</h2>'+
 '<div class="paper"><p>手がかりを照合して推測を書き込む。ここでは正解・不正解は表示されません。</p><p><strong>曲：</strong>'+esc(Story.song)+'</p>'+
 '<p>'+esc(Story.memory)+'</p></div>'+
 '<div class="paper"><h3>あなたの推測</h3>'+(S.report?'<p class="notice">'+esc(S.report)+'</p>':'')+form+btn('プロフィールを記録','save-producer-profile')+'</div>'+
 (facts?'<div class="paper"><h3>集めた情報（証言には記憶違いもあります）</h3>'+facts+'</div>':'<p class="dim">まだ人物から得た手がかりはありません。</p>')+
 (refs?'<div class="paper"><h3>人づての記憶</h3>'+refs+'</div>':'')+
 '<div class="actions">'+btn('前の画面へ戻る','back-producer-profile','','ghost')+'</div>';
}

function camp(){
 const memories=[];
 if(S.groupVisitHistory.includes('E05-A')||S.groupVisitHistory.includes('E10-A'))memories.push('こもれびの演奏で、曲の終わりに一拍の静けさがあった。');
 if(S.groupVisitHistory.includes('E02-A')||S.groupVisitHistory.includes('E08-A'))memories.push('wav.では、ネット名義とサークルが別のこともあると聞いた。');
 if(S.groupVisitHistory.includes('E03-A')||S.groupVisitHistory.includes('E09-A'))memories.push('残響にも、打ち込みや曲作りに詳しい先輩がいた。');
 if(S.guesses.P001?.verified&&S.interacted.includes('P001'))memories.push('こもれびで会った西園寺紬。話し方や音の好みを覚えている。');
 const recall=memories.length?memories.join(' '):'六つのサークルには、まだ知らない人もいる。SNSや新歓で聞いた音を頼りに考えよう。';
 const choices=D.orgs.map(o=>'<article class="panel"><span class="tag">'+esc(o.common_name)+'</span><p>'+esc(o.focus)+'</p>'+btn('このサークルの合宿へ','choose-camp',o.org_id)+'</article>').join('');
 return '<div class="eyebrow">金曜の夜 / 週末</div><h2>余白ラムネは、どこにいる？</h2>'+
 '<p>あの投稿は「見つけたら声をかけて」だった。正解が分からなくても、今週出会った音楽から一つ選ぼう。</p>'+
 '<div class="paper"><h3>一週間の記憶</h3><p>'+esc(recall)+'</p><p class="dim">集めた人物の証言：'+S.routeVisits.length+'件 ／ ボカロPプロフィールの仮登録：'+Object.values(S.profileGuess).filter(Boolean).length+'項目</p></div>'+
 '<div class="actions">'+btn('余白ラムネのプロフィールを見直す','open-producer-profile')+'</div>'+
 '<div class="two">'+choices+'</div><div class="actions">'+btn('今回は合宿に参加しない','choose-camp','N','ghost')+'</div>';
}
function saturday(){
 const home=S.camp===Story.homeOrg,none=S.camp==='N';
 const name=none?'キャンパス':label(S.camp);
 const scene=none?'合宿には行かず、部屋で久しぶりに「'+Story.song+'」を聴いた。曲を作った人の顔は、まだ分からない。':Story.clubScenes[S.camp];
 const extra=home?'<p>聞き覚えがある。高校時代に何度も聴いた、最後の一拍の空白。窓辺にいた先輩がギターを置いた。</p><p>本人が声をかけてほしいと書いていた。演奏が終わった今なら、話しかけられそうだ。</p>':
  none?'<p>行かないと決めたことも、今週のあなたの選択だ。</p>':
  '<p>探していた音楽家かどうかは分からない。でも、ここにいる人たちの音も、今日初めて知った。</p>';
 return '<div class="eyebrow">土曜日 / '+esc(name)+'</div><h2>選んだ場所の音</h2><div class="paper"><p>'+esc(scene)+'</p>'+extra+'</div>'+
 (home?'<div class="actions">'+btn('演奏が終わった先輩に声をかける','meet-producer')+btn('今日は聴いて帰る','listen-only','','ghost')+'</div>':
 '<div class="actions">'+btn(none?'一週間を振り返る':'このサークルで演奏を楽しむ','finish-other')+'</div>');
}
function ending(){
 const found=S.result==='FOUND',heard=S.result==='HEARD',none=S.result==='SKIPPED';
 const weekend=S.camp==='N'?'合宿に参加しない':label(S.camp)+'の合宿';
 const met=S.interacted.includes(Story.producerId),known=!!S.guesses[Story.producerId]?.verified;
 const body=found?
  '「余白ラムネさん、ですか？」 先輩は少し驚いて、それから笑った。「うん。西園寺紬です。よく気づいたね。知っている人たちには、聞かれても教えないでって頼んでおいたんだ」':
  heard?'あの曲の作り手は、きっとあの窓辺にいた。今日は声をかけなかった。でも、もう一度会える場所を一つ知った。':
  none?'六つのサークルを巡った春が終わった。あの人には会えなかったが、探しているあいだに、自分の好きな音の輪郭が見えてきた。':
  '探していたボカロPには会えなかった。それでも、選んだサークルで聴いた音と、新しく話した人のことを覚えている。';
 const title=found?'見つけた音の続き':heard?'一拍先の約束':none?'まだ名前のない春':'別の音に出会う';
 const feeling=found?(met?'新歓でも会話した相手が、あの曲を作っていた。':'初めて話した先輩が、何年も聴き続けてきた曲の作り手だった。')+
  (known?' 覚えていた顔と名前が、ようやく音につながった。':' 声と演奏を頼りに、ようやく名前を知った。'):
  heard?'本人が自ら出した招待だから、答えを急ぐ必要もない。':
  '正解のサークルは一つだった。けれど、ほかのサークルを選んだ時間まで間違いだったわけではない。';
 const peers=['P013','P014','P015','P016'].filter(p=>S.interacted.includes(p)||S.contacts.includes(p));
 const contactPeers=peers.filter(p=>S.contacts.includes(p));
 const namedContacts=contactPeers.filter(p=>S.guesses[p]?.verified);
 const relationships=namedContacts.length?'あの週に連絡先を交換した'+namedContacts.slice(0,2).map(p=>people[p].name).join('や')+'と、時々メッセージを交わす。':
  contactPeers.length?'新歓で出会った同期の連絡先が残っている。':
  peers.length?'あの週、同じ新入生として話した人の顔を、ときどき思い出す。':
  S.contacts.length?'新歓で交換した連絡先が、何人か残っている。':
  'まだ知らない人も多いけれど、音楽に誘われて別の場所へ行くこともある。';
 const future=found?'一緒に一曲を聴いたことから、音楽の楽しみ方が少し広がった。':
  heard?'こもれびで聴いた一拍の余韻が、今も不意に浮かんでくる。':
  none?'音楽との距離は、自分の速度で決めている。':
  label(S.camp)+'で初めて聴いた曲が、今でもプレイリストに残っている。';
 const truth={year:'3年',faculty:'文学部日本文学科',instruments:'歌とギター',favorite:'羊文学',production:'生ギター＋歌声合成',org:Story.homeOrg};
 const filled=Object.entries(S.profileGuess).filter(([k,v])=>v&&Object.prototype.hasOwnProperty.call(truth,k));
 const matches=filled.filter(([k,v])=>v===truth[k]).length;
 const answer=found&&filled.length?'<div class="paper"><h3>プロフィールの答え合わせ</h3><p>記録した'+filled.length+'項目のうち、'+matches+'項目が本人の話と一致した。</p><p class="dim">見つけたことと、本人について知っていたことは別。来年も新しい一面が見つかるかもしれない。</p></div>':'';
 const revisit=S.eventHistory.length?'見学したサークルは'+[...new Set(S.eventHistory.map(eid=>label(events[eid].org_id)))].join('、')+'。':'平日の新歓には参加しなかった。';
 return '<div class="eyebrow">2026年4月12日 / 日曜</div><h1>THE END</h1><h2>'+esc(title)+'</h2>'+
 '<div class="paper"><p>'+esc(body)+'</p><p>'+esc(feeling)+'</p><hr><h3>2027年4月｜あれから一年</h3><p>'+esc(future)+'</p><p>'+esc(relationships)+'</p></div>'+
 answer+
 '<div class="paper"><h3>一週間の記録</h3><p>'+esc(revisit)+' 見かけた顔 '+S.seen.length+'人 ／ 照合した顔 '+Object.values(S.guesses).filter(x=>x?.verified).length+'人</p><p>週末：'+esc(weekend)+'</p></div>'+
 btn('別の一週間を始める','reset')+btn('手帳を振り返る','open-notebook','','ghost');
}
function draw(){
 hydrate();APP.innerHTML='<div class="layout">'+header()+'<main>'+site()+'</main><footer>短編UIゲーム実験室 ／ S6 β prototype — 本番版とは別に開発中</footer></div>';
 if(S.phase==='identity'&&S.guesses[S.currentNotebook]?.name){
  const n=document.getElementById('guessName'),o=document.getElementById('guessOrg');if(n)n.value=S.guesses[S.currentNotebook].name;if(o)o.value=S.guesses[S.currentNotebook].org||'';
 }
 if(S.phase==='group'&&(S.groupLog[S.group]||[]).length){
  const anchor=document.getElementById('group-action-zone');
  if(anchor?.scrollIntoView)anchor.scrollIntoView({block:'nearest',behavior:'instant'});
 }else window.scrollTo({top:0,behavior:'instant'});
}
function go(phase){S.phase=phase;remember();draw()}
function handle(act,id){
 switch(act){
 case 'start':go('warning');break;
 case 'back-title':go('title');break;
 case 'show-campus':go('campus');break;
 case 'show-intro':go('intro');break;
 case 'begin':go('day');break;
 case 'reset':S=initial();go('title');break;
 case 'open-producer-profile':openLayer('producer-profile');break;
 case 'back-producer-profile':if(S.phase==='producer-profile')closeLayer('night');break;
 case 'save-producer-profile':if(S.phase==='producer-profile'){for(const k of ['year','faculty','instruments','favorite','production','org'])S.profileGuess[k]=document.getElementById('profile-'+k)?.value||'';S.report='プロフィールの推測を記録した。';go('producer-profile')}break;
 case 'save':remember();S.report='この端末に記録しました。';draw();break;
 case 'attend':{
  if(S.phase!=='day'||!events[id]||events[id].date!==date())return;
  S.selectedEvent=id;S.eventHistory.push(id);S.visitedGroups=[];S.group=null;
  // The event hall offers face recognition but no free name reveal.
  for(const pid of byEvent(id)){if(!S.seen.includes(pid))S.seen.push(pid);if(!S.onsiteSeen.includes(pid))S.onsiteSeen.push(pid);
   if(D.members.some(m=>m.person_id===pid&&events[m.event_id].org_id!==events[id].org_id&&S.eventHistory.includes(m.event_id)))S.crossings[pid]=true;
  }
  go('venue');break;
 }
 case 'leave-flash':{
  if(S.phase!=='flash'||!S.group)return;
  for(const pid of S.flash)if(!S.introduced.includes(pid))S.introduced.push(pid);
  S.flash=[];go('group');break;
 }
 case 'skip':if(S.phase==='day')go('night');break;
 case 'join-group':{
  if(S.phase!=='venue'||!groups[id]||groups[id].event_id!==S.selectedEvent||S.visitedGroups.length>=3||S.visitedGroups.includes(id))return;
  S.group=id;S.visitedGroups.push(id);if(!S.groupVisitHistory.includes(id))S.groupVisitHistory.push(id);
  S.flash=byGroup(id).filter(pid=>!S.introduced.includes(pid));
  go('flash');break;
 }
 case 'action-menu':{
  if(S.phase!=='group'||!S.group||(S.groupLog[S.group]||[]).length>=2)return;
  if(!['talk','question','social','contact','photo'].includes(id))return;
  S.mode=id;go('choose');break;
 }
 case 'back-group':if(S.phase==='choose')go('group');break;
 case 'act-target':
 case 'ask-affiliation':
 case 'ask-producer':
 case 'ask-music':{
  if(S.phase!=='choose'||!S.group||!byGroup(S.group).includes(id)||(S.groupLog[S.group]||[]).length>=2)return;
  const type=act==='ask-affiliation'?'affiliation':act==='ask-producer'?'producer':act==='ask-music'?'music':S.mode;
  const q=D.questions.find(q=>q.group_id===S.group&&q.target_id===id);
  const questionKey=['question','affiliation','producer','music'].includes(type)?type:null;
  const askedBefore=questionKey&&(S.groupLog[S.group]||[]).some(x=>x.pid===id&&x.questionKey===questionKey);
  let reply,kind=type;
  if(askedBefore){
    const repeat={question:'同じ質問なら、さっき話した通りだよ。ほかに気になることはある？',affiliation:'所属はさっき話した通りだよ。ほかの人の話も聞いてみる？',producer:'余白ラムネの話は、さっき伝えたこと以上はまだ分からないかな。',music:'音楽の経験はさっき話した通り。気になるなら今日は演奏を聴いてみて。'};
    reply={text:repeat[type]};kind='聞き直し';
  }else if(type==='talk'){
    // Keep acquaintance status from BEFORE this action, and speech warmth from AFTER it.
    // First encounters retain their distinctive speech cues without becoming reunions.
    const knownBefore=S.spokenTo.includes(id)||S.interacted.includes(id);
    recordConversation(id,'talk');
    reply=Dialogue.talk(id,S.group,S,knownBefore);
    const route=Routes.get(S.group,id);
    const earlier=(S.groupLog[S.group]||[]).some(x=>x.pid===id&&x.routeHint);
    if(route&&!earlier){
      reply.text+=' 余白ラムネの曲の話になると、「'+route.text+'」と返ってきた。';
      saveRouteClue(id,route.text);
    }else if(!route&&!S.musicKnown[id]){
      const skill=Music.people[id],mains=Music.columns.filter(k=>skill?.skills[k]==='◎').map(k=>MUSIC_LABELS[k]);
      if(mains.length)reply.text+=' 普段は'+mains.join('と')+'が中心なんだ。';
      S.musicKnown[id]=true;
    }
    if(!S.spokenTo.includes(id))S.spokenTo.push(id);
  }else if(type==='question'||type==='affiliation'){
    reply=Dialogue.answer(id,S.group,type==='affiliation'?'affiliation':'question');
    recordConversation(id,type);
    if(reply.primaryOrg)S.knownOrg[id]=reply.primaryOrg;
    if(reply.dualOrg)S.crossings[id]=true;
    if(type==='question'&&q?.reveals?.includes('group_focus'))S.knownOrg[id]=people[id].primary_org||'N';
    // Asking somebody explicitly to introduce themself gives a name as an earned answer.
    if(type==='question'&&q?.reveals?.includes('self_name')&&q.answer?.includes(people[id].name)&&!S.introduced.includes(id))S.introduced.push(id);
    
  }else if(type==='producer'){
     const node=Routes.get(S.group,id),ev=events[groups[S.group].event_id];
     const fallbacks={L:'受付や歌の輪で聞いてみたら？ 私は曲を聴いたことがある程度かな。',Z:'曲を作っている人は多いけど、その名義の本人かどうかは分からないな。',J:'その曲は知ってるけど、本人が誰かまでは分からないよ。',K:'昔のネット活動名義は本人が言うまで待ってあげたいな。',W:'ボカロPは何人かいるよ。でもその名義の人かは知らない。',F:'ネットで曲を出す人もいるけど、本人を当てるのは難しいよね。'};
     reply={text:node?node.text:fallbacks[ev.org_id]||'その曲は知らないな。'};
     kind='ボカロPの話';
     recordConversation(id,'question');
     if(node){
      const key=S.group+'|'+id;
      if(!S.routeVisits.some(x=>x.key===key))S.routeVisits.push({key,pid:id,hall:label(ev.org_id)+' ／ '+ev.title+' ／ '+eventName(S.group),date:'2026年'+(S.day===0?'4月6日':S.day===1?'4月7日':S.day===2?'4月8日':S.day===3?'4月9日':'4月10日')+'（'+WEEK[S.day].slice(0,2)+'）',text:reply.text,route:node.route});
      for(const fact of node.facts||[]){
       const [topic,value,source]=fact;
       if(!S.profileEvidence.some(x=>x.pid===id&&x.topic===topic&&x.value===value))S.profileEvidence.push({pid:id,topic,value,source,visitKey:key,recordedAt:sourceLabel(S.group,'2026年4月'+(S.day+6)+'日（'+WEEK[S.day].slice(0,2)+'）')});
      }
     }
   }else if(type==='music'){
     const m=Music.people[id];
     const mains=Music.columns.filter(k=>m.skills[k]==='◎').map(k=>MUSIC_LABELS[k]);
     const extras=Music.columns.filter(k=>m.skills[k]==='○').map(k=>MUSIC_LABELS[k]);
     reply={text:'中心は'+(mains.join('と')||'音楽全般')+'。'+(extras.length?'ほかには'+extras.join('や')+'もできる。':'')+
       '曲は'+(m.composition.original&&m.composition.cover?'オリジナルもコピーもやるよ。':m.composition.original?'オリジナルを作ることが多いよ。':'コピー曲を演奏することが多いよ。')};
     kind='音楽経験';
     S.musicKnown[id]=true;recordConversation(id,'question');
   }else if(type==='social'){
    kind='SNSの交換';
    const texts=[];
    const tine=accounts[id+'|TINE'];
    if(S.contacts.includes(id))texts.push('TINEはもう交換済みだね。');
    else if(S.pendingContacts.includes(id))texts.push('TINEは申請を確認中だよ。');
    else if(tine){
      const contact=Dialogue.contact(id,S.group,S);
      if(contact.result==='accept'){
        S.contacts.push(id);
        texts.push('TINEは「'+(contact.accountName||tine.display_name)+'」。交換しよう。');
      }else if(contact.result==='pending'){
        S.pendingContacts.push(id);
        texts.push('TINEは明日申請を確認するね。');
      }else texts.push('TINEはもう少し話してからにしよう。');
    }
    const photo=accounts[id+'|Photogram'];
    const rule=D.contactChannels.find(x=>x.group_id===S.group&&x.person_id===id&&x.platform==='Photogram');
    const policy=rule?.approval_policy||'after_week';
    if(S.photoFollows.includes(id))texts.push('Photogramはフォローしてくれているね。');
    else if(S.photoRequests.includes(id))texts.push('Photogramは申請を受け取っているよ。');
    else if(photo){
      if(policy==='after_week')texts.push('Photogramは今週、新しいフォローを受け付けていないんだ。公開投稿なら見られるよ。');
      else if(policy==='next_day'){
        S.photoRequests.push(id);
        texts.push('Photogramは「'+photo.display_name+'」。フォローは明日確認するね。');
      }else{
        S.photoFollows.push(id);
        texts.push('Photogramは「'+photo.display_name+'」。フォローしていいよ。');
      }
    }
    reply={text:texts.join(' ')||'今はSNSは使っていないんだ。'};
   }else if(type==='photo'){
    const account=accounts[id+'|Photogram'];
    const rule=D.contactChannels.find(x=>x.group_id===S.group&&x.person_id===id&&x.platform==='Photogram');
    const approval=rule?.approval_policy||'after_week';
    kind='SNSの話';
    if(!account)reply={text:'Photogramは今のところ使ってないんだ。'};
    else if(S.photoFollows.includes(id))reply={text:'Photogramは「'+account.display_name+'」だよ。もうフォローしてくれてるね。'};
    else if(S.photoRequests.includes(id))reply={text:'Photogramは「'+account.display_name+'」。申請は受け取ってるよ。明日確認するね。'};
    else if(approval==='after_week')reply={text:'Photogramは「'+account.display_name+'」だけど、今週は新しいフォローを受け付けてないんだ。公開投稿なら見られるよ。'};
    else if(approval==='next_day'){
      S.photoRequests.push(id);
      reply={text:'Photogramは「'+account.display_name+'」。申請ありがとう。明日確認するから、今夜はまだ承認待ちになるよ。'};
    }else{
      S.photoFollows.push(id);
      reply={text:'Photogramは「'+account.display_name+'」だよ。フォローありがとう。今夜から見られるよ。'};
    }
  }else if(type==='contact'){
    reply=Dialogue.contact(id,S.group,S);kind='連絡先';
    if(reply.result==='accept'){
      if(!S.contacts.includes(id))S.contacts.push(id);
      reply.text+=' TINEは「'+(reply.accountName||'アカウント')+'」で登録してるよ。';
      // Contact exchange is not a shortcut to friendship.
    }else if(reply.result==='pending'){
      if(!S.pendingContacts.includes(id))S.pendingContacts.push(id);
    }
  }else return;
    // A brief personal introduction is earned when choosing a person to interact with.
  // The group-wide roll-call alone never fills this flag.
  if(!S.personalIntroduced[id]){
    const intro=Dialogue.selfIntroduction(id,S,'direct');
    if(intro&&!reply.text.includes(people[id].name))reply.text=intro+' '+reply.text;
    S.personalIntroduced[id]=true;
  }
  if(!S.interacted.includes(id))S.interacted.push(id);
  const bystander=Dialogue.thirdParty(id,S.group,S,type==='talk'&&Routes.get(S.group,id)?'talk-producer':type);
  if(bystander?.selfIntroduced){
    S.personalIntroduced[bystander.pid]=true;
    if(!S.introduced.includes(bystander.pid))S.introduced.push(bystander.pid);
  }
  (S.groupLog[S.group]??=[]).push({pid:id,type:kind,questionKey,routeHint:type==='talk'&&!!Routes.get(S.group,id),text:reply.text,reply:bystander});
  S.groupDone[S.group]=reply.text;
  S.report='';go('group');break;
 }
 case 'listen-group':{
  if(S.phase!=='group'||(S.groupLog[S.group]||[]).length>=2)return;
  const heard=Dialogue.passiveListen(S.group,S);
  if(heard.address?.selfIntroduced){
   S.personalIntroduced[heard.address.pid]=true;
   S.introduced=unique([...S.introduced,heard.address.pid]);
   S.interacted=unique([...S.interacted,heard.address.pid]);
  }
  (S.groupLog[S.group]??=[]).push({pid:null,type:'話を聞く',text:heard.intro,overheard:heard.overheard,address:heard.address});
  S.groupDone[S.group]=heard.intro;
  const fact=actions[S.group]?.trigger_fact_id;
  if(fact&&!S.clues.includes(fact))S.clues.push(fact);
  go('group');break;
 }
 case 'leave-group':if(S.phase==='group'){prepareGroupOffers();go(S.groupContacts[S.group]?'contact-result':'contact-prompt')}break;
 case 'ask-group-contacts':if(S.phase==='contact-prompt'){exchangeGroupContacts();go('contact-result')}break;
 case 'finish-group':if(['contact-prompt','contact-result'].includes(S.phase))go('venue');break;
 case 'back-venue':go('venue');break;
 case 'finish-venue':if(S.phase==='venue')go('night');break;
 case 'open-notebook':if(S.phase==='notebook'||S.phase==='identity')return;openLayer('notebook');break;
 case 'back-from-notebook':if(S.phase==='notebook')closeLayer('night');break;
 case 'open-identity':if(S.seen.includes(id)){S.currentNotebook=id;go('identity')}break;
 case 'back-identity':go('notebook');break;
 case 'save-note':{
  if(S.phase!=='identity'||!canEditNotebook())return;
  const t=document.getElementById('faceNote');if(t)S.note[S.currentNotebook]=String(t.value).slice(0,160);
   const a=document.getElementById('aliasName');if(a){const name=String(a.value).trim().replace(/\s+/g,' ').slice(0,32);if(name)S.aliases[S.currentNotebook]=name;else delete S.aliases[S.currentNotebook]}
  S.report='表示名とメモを保存した。';go('notebook');break;
 }
 case 'submit-identity':{
  if(S.phase!=='identity'||!canEditNotebook())return;
  const n=document.getElementById('guessName')?.value||'';
  const org=document.getElementById('guessOrg')?.value||'';
  if(!n||!org){S.report='名前と所属の両方を選んでください。';go('notebook');return}
  if(!S.introduced.includes(n))return;
  const p=people[S.currentNotebook],correct=p.person_id===n&&(p.primary_org||'N')===org;
  S.guesses[p.person_id]={name:n,org,verified:correct};
  S.report=correct?'顔・名前・所属が一致した。'+(S.crossings[p.person_id]?'別の団体とのつながりにも注意しておこう。':''):
   '記憶と名簿が一致しない。別の人を取り違えたかもしれない。';
  go('notebook');break;
 }
 case 'night-sns':{
 if(S.phase!=='night'||!['TINE','Photogram','Zitter'].includes(id))return;
 S.viewedPlatforms[date()]=unique([...(S.viewedPlatforms[date()]||[]),id]);S.snsPlatform=id;recordOnline(id);go('sns');break;
}
 case 'account-match':{
  if(S.phase!=='sns')return;
  const post=D.posts.find(p=>p.post_id===id),acct=post&&accounts[post.author_id+'|'+post.platform];
  const readable=post&&(post.visibility==='公開'||(post.visibility==='鍵垢・承認制'&&S.photoFollows.includes(post.author_id))||((post.visibility==='グループ参加者'||post.visibility==='主人公との個別')&&S.contacts.includes(post.author_id)));
  if(!readable||post.platform!==S.snsPlatform||post.published_at.slice(0,10)>date()||acct?.avatar_kind!=='face'||!S.seen.length)return;
  S.selectedSocial=id;S.report='';go('sns-match');break;
 }
 case 'match-social-face':{
  if(S.phase!=='sns-match'||!S.seen.includes(id))return;
  const post=D.posts.find(p=>p.post_id===S.selectedSocial);
  if(!post)return;
  const previous=S.socialCandidates[post.post_id];
  S.socialCandidates[post.post_id]=id;
  for(const pid of unique([previous,id]).filter(Boolean)){
   S.socialLinked[pid]=unique(D.posts.filter(p=>S.socialCandidates[p.post_id]===pid).map(p=>p.platform));
  }
  S.report='この顔と同じ人かもしれない。手帳に推測を記録した。';go('sns');break;
 }
 case 'back-sns':go('sns');break;
 case 'night-board':{
 if(S.phase!=='night')return;S.viewedBoard[date()]=true;go('board');break;
}
 case 'back-night':go('night');break;
 case 'next-day':{
  if(S.phase!=='night')return;
  for(const pid of S.pendingContacts)if(!S.contacts.includes(pid))S.contacts.push(pid);S.pendingContacts=[];
  for(const pid of S.photoRequests)if(!S.photoFollows.includes(pid))S.photoFollows.push(pid);
  S.photoRequests=[];
  S.report='';if(S.day<4){S.day++;go('day')}else go('camp');break;
 }
 case 'record-suspect':{
  if(S.phase!=='camp')return;
  const v=document.getElementById('suspect')?.value||'';
  if(v&&!S.guesses[v]?.verified)return;
  S.suspect=v;S.report=v?'この人のことを忘れないようにした。':'まだ誰とも断定できない。';
  go('camp');break;
 }
 case 'choose-camp':{
  if(S.phase!=='camp'||(id!=='N'&&!clubs[id]))return;
  S.camp=id;go('saturday');break;
 }
 case 'meet-producer':if(S.phase==='saturday'&&S.camp===Story.homeOrg){S.result='FOUND';go('end')}break;
 case 'listen-only':if(S.phase==='saturday'&&S.camp===Story.homeOrg){S.result='HEARD';go('end')}break;
 case 'finish-other':if(S.phase==='saturday'&&S.camp!==Story.homeOrg){S.result=S.camp==='N'?'SKIPPED':'OTHER';go('end')}break;
 }
}
APP.addEventListener('click',e=>{
 const b=e.target.closest('[data-act]');if(!b)return;e.preventDefault();
 handle(b.dataset.act,b.dataset.id||'');
});
draw();
})();