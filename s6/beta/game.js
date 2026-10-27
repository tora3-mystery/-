(() => {
'use strict';
const D=window.S6_DATA, APP=document.getElementById('app'), KEY='s6-origin-beta-010', Dialogue=window.S6_BETA_DIALOGUE;
const VERSION='0.3.1', BUILD='2026-10-27 22:48 JST';
const WEEK=['月曜 4月6日','火曜 4月7日','水曜 4月8日','木曜 4月9日','金曜 4月10日'];
const DATES=['2026-04-06','2026-04-07','2026-04-08','2026-04-09','2026-04-10'];
const people=Object.fromEntries(D.people.map(p=>[p.person_id,p]));
const clubs=Object.fromEntries(D.orgs.map(o=>[o.org_id,o]));
const events=Object.fromEntries(D.events.map(e=>[e.event_id,e]));
const groups=Object.fromEntries(D.groups.map(g=>[g.group_id,g]));
const accounts=Object.fromEntries(D.accounts.map(a=>[a.person_id+'|'+a.platform,a]));
const profiles=Object.fromEntries(D.socialProfiles.map(p=>[p.person_id,p]));
const actions=Object.fromEntries(D.actions.map(a=>[a.group_id,a]));
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const unique=a=>[...new Set(a)];
const label=id=>clubs[id]?.common_name||'新入生';
const byEvent=eid=>unique(D.members.filter(m=>m.event_id===eid).map(m=>m.person_id));
const byGroup=gid=>D.members.filter(m=>m.group_id===gid).map(m=>m.person_id);
const date=()=>DATES[Math.min(S.day,4)];
const initial=()=>({
 schema:1,phase:'title',day:0,selectedEvent:null,group:null,target:null,
 eventHistory:[],seen:[],introduced:[],flash:[],visitedGroups:[],groupDone:{},groupLog:{},spokenTo:[],affinity:{},relationshipDays:{},dailyAffinity:{},contacts:[],socialLinked:{},selectedSocial:null,
 guesses:{},note:{},clues:[],crossings:{},knownOrg:{},nightChoice:{},viewedPlatforms:{},viewedBoard:{},pendingContacts:[],
 checks:{},currentNotebook:null,suspect:'',camp:'',shared:false,privateInvite:false,
 report:'',result:'',savedAt:''
});
let S;
try {const raw=JSON.parse(localStorage.getItem(KEY));S=raw&&raw.schema===1?raw:initial()}catch{S=initial()}
function hydrate(){
 for(const k of ['eventHistory','seen','introduced','flash','visitedGroups','contacts','clues','spokenTo','pendingContacts'])if(!Array.isArray(S[k]))S[k]=[];
 for(const k of ['groupDone','guesses','note','crossings','knownOrg','nightChoice','viewedPlatforms','viewedBoard','groupLog','affinity','relationshipDays','dailyAffinity','checks','socialLinked'])if(!S[k]||typeof S[k]!=='object')S[k]={};
}
hydrate();
if(S.phase==='flash'&&!S.group){S.phase='venue';localStorage.setItem(KEY,JSON.stringify(S));}
for(const [gid,result] of Object.entries(S.groupDone))if(result&&!S.groupLog[gid])S.groupLog[gid]=[{pid:null,type:'旧版の交流',text:result}];
const PEERS=new Set(['P013','P014','P015','P016']);
const peerClass=id=>PEERS.has(id)?' peer-highlight':'';
const canEditNotebook=()=>['night','sns','board'].includes(S.returnTo);
const relationship=id=>Dialogue.relationshipLabel(S,id);
const contactBadge=id=>S.contacts.includes(id)?' ／ TINE交換済':S.pendingContacts.includes(id)?' ／ 申請確認中':'';
// Per-person contact develops gradually, with at most two meaningful exchanges per day.
const recordConversation=id=>{
 const today=date(),key=id+'|'+today,used=Number(S.dailyAffinity[key]||0);
 if(used>=2)return;
 S.dailyAffinity[key]=used+1;
 S.affinity[id]=Math.min(6,Math.max(0,Number(S.affinity[id])||0)+1);
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
 case 'title':return '<div class="hero"><div class="eyebrow">青嶺大学 / 2026年4月</div><h1>サークルは、<br>星の数ほどありますから。</h1><p>新歓の一週間。大勢の先輩と同期の顔、名前、所属は、なかなか覚えられない。</p><p>けれど、あなたには、どうしても人を見間違えたくない理由がある。</p>'+btn('はじめる','start')+'<p class="dim">β版：初期企画のゲーム性を独立して再構築中。公開中の旧版とは別の保存データです。</p></div>';
 case 'warning':return '<div class="eyebrow">PLAY NOTICE</div><h2>始める前に</h2><div class="paper tense"><p>この物語はストーキングと精神的圧迫を扱います。選択によって退室を妨げられる場面があります。</p><p><strong>過度な暴力・性的暴力・ジャンプスケアは含みません。</strong></p></div><p>不安を感じたらいつでも中断できます。犯人が分からなくても同行・緊急連絡による安全確保は可能です。</p>'+btn('続ける','show-campus')+btn('タイトルへ','back-title','','ghost');
case 'campus':return '<div class="eyebrow">CAMPUS / WELCOME</div><h2>青嶺大学へようこそ。</h2><p>春のキャンパスには新歓のチラシと音楽があふれています。六つの音楽サークルは雰囲気も活動もそれぞれ違います。</p><div class="paper"><h3>見学できるサークル</h3><div class="club-intros">'+D.orgs.map(o=>'<div class="club-intro"><strong>'+esc(o.formal_name)+'</strong><span>'+esc(o.focus)+'</span></div>').join('')+'</div><p class="dim">見学だけでも構いません。掛け持ちで活動している先輩もいます。</p></div><div class="paper"><h3>一週間の過ごし方</h3><p><strong>平日：</strong>1日1新歓、会場で2つの輪まで参加できます。輪に入ると、初めて会った相手が自己紹介します。</p><p><strong>交流：</strong>話す・質問する・連絡先を頼む・聞き耳を立てる。同じ輪で2回まで行動できます。</p><p><strong>夜：</strong>SNSや掲示は自由に読めます。手帳での顔・名前・所属の照合やメモ編集は夜だけ、回数制限はありません。</p><p><strong>週末：</strong>人間関係と情報を整理し、合宿に行くか・どこに行くか決めます。</p></div>'+btn('主人公について読む','show-intro');
case 'intro':return '<div class="eyebrow">4月、入学</div><h2>もう一度、音を出す場所を探す。</h2><div class="paper"><p>高校時代、少し名前の知られたバンドで演奏していた。SNSで見知らぬ相手から執拗につきまとわれ、公開していない居場所や行動まで言い当てられるようになった。</p><p>怖くなって音楽をやめ、浪人生活を経て大学に入った。あの相手がまた近くにいるかもしれない。それでも安心して演奏できる場所を選びたい。</p></div><p class="dim">全員の顔と名前を覚える必要はありません。覚えていた顔が、選択を助けることがあります。</p>'+btn('4月6日へ','begin');
 case 'day':return daily();
 case 'flash':return firstIntroductions();
 case 'venue':return venue();
 case 'group':return group();
 case 'choose':return chooseAction();
 case 'night':return night();
 case 'sns':return sns();
 case 'sns-match':return snsMatch();
 case 'board':return board();
 case 'notebook':return notebook();
 case 'identity':return identity();
 case 'camp':return camp();
 case 'saturday':return saturday();
 case 'private':return privateRoom();
 case 'end':return ending();
 default:return '<h2>表示を復元できませんでした</h2>'+btn('最初から','reset');
 }
};
function daily(){
 const offers=D.events.filter(e=>e.date===date());
 return '<div class="eyebrow">'+esc(WEEK[S.day])+' / 新歓の予定</div><h2>今日は、どこへ行く？</h2><p>行けるのは一日一つ。明日には別の顔が増えるかもしれない。</p>'+
 '<div class="two">'+offers.map(e=>'<article class="panel"><span class="tag">'+esc(label(e.org_id))+'</span><h3>'+esc(e.title)+'</h3><p class="dim">'+esc(e.location)+' ／ '+esc(e.start)+'〜'+esc(e.end)+'</p><p>'+esc(clubs[e.org_id].focus)+'</p>'+btn('この新歓へ','attend',e.event_id)+'</article>').join('')+'</div>'+
 '<div class="actions">'+btn('今日は参加しない','skip','','ghost')+btn('人物手帳を見る','open-notebook','','ghost')+'</div>';
}
function firstIntroductions(){
 const newcomers=S.flash,all=byGroup(S.group);
 return '<div class="eyebrow">'+esc(WEEK[S.day])+' / '+esc(groups[S.group].group_title)+'</div><h2>輪の自己紹介</h2>'+
 '<p>初めて会った人が名乗る。顔と名前が並ぶのは初回だけです。同期の新入生には赤い目印を付けています。</p>'+
 '<p class="status">新しく聞く名前 '+newcomers.length+'人 ／ この輪には '+all.length+'人</p>'+
 (newcomers.length?'<div class="faces">'+newcomers.map(id=>'<div class="intro-face'+peerClass(id)+'">'+portrait(id)+
 '<strong>'+esc(people[id].name)+'</strong><span>'+esc(people[id].year)+'年 ／ '+esc(label(people[id].primary_org))+
 (people[id].dual_org?'・'+esc(label(people[id].dual_org))+'も活動':'')+'</span>'+
 (PEERS.has(id)?'<span class="peer-tag">同期の新入生</span>':'')+'</div>').join('')+'</div>':
 '<p>この輪に、初めて自己紹介する人はいません。</p>')+
 '<div class="actions">'+btn('自己紹介を聞き終える','leave-flash')+'</div>';
}
function venue(){
 const e=events[S.selectedEvent];
 const gs=D.groups.filter(g=>g.event_id===e.event_id);
 return '<div class="eyebrow">'+esc(WEEK[S.day])+' / '+esc(label(e.org_id))+'</div><h2>'+esc(e.title)+'</h2>'+
 '<p>あちこちで演奏や会話が始まっている。どの二組に混ざろう？</p><div class="status">話したグループ '+S.visitedGroups.length+' / 2</div>'+
 '<div class="two">'+gs.map(g=>'<article class="panel"><h3>'+esc(g.group_title)+'</h3><p>'+esc(g.activity)+'</p><div class="faces small-faces">'+byGroup(g.group_id).map(id=>portrait(id,peerClass(id))).join('')+'</div>'+
 (S.visitedGroups.includes(g.group_id)?'<span class="pill">参加済み</span>':S.visitedGroups.length>=2?'<span class="dim">今日はここまで</span>':btn('この輪に入る','join-group',g.group_id))+'</article>').join('')+'</div>'+
 '<div class="actions">'+btn('会場を出て夜へ','finish-venue')+'</div>';
}
function speech(pid,text,tag=''){
 const ids=byGroup(S.group),index=ids.indexOf(pid);
 const speaker=S.guesses[pid]?.verified?people[pid].name:'参加者'+String.fromCharCode(65+Math.max(0,index));
 return '<div class="chat-line">'+portrait(pid,'chat-avatar'+peerClass(pid))+
 '<div class="chat-content"><div class="chat-speaker">'+esc(speaker)+(PEERS.has(pid)?' <span class="peer-tag">同級生</span>':'')+
 (tag?' <span class="dim">'+esc(tag)+'</span>':'')+'</div><div class="chat-bubble">'+esc(text)+'</div></div></div>';
}
function group(){
 const g=groups[S.group],lines=D.lines.filter(l=>l.group_id===g.group_id).sort((a,b)=>Number(a.order)-Number(b.order));
 const log=S.groupLog[g.group_id]||[],remaining=Math.max(0,2-log.length);
 const chats=lines.slice(0,3).map(l=>speech(l.speaker_id,Dialogue.sceneLine(l))).join('')+
 log.map(x=>x.pid&&people[x.pid]?speech(x.pid,x.text,x.type):'<div class="notice">'+esc(x.text)+'</div>').join('');
 return '<div class="eyebrow">'+esc(label(events[g.event_id].org_id))+' / '+esc(g.group_title)+'</div><h2>輪の会話</h2>'+
 '<p>'+esc(g.activity)+'</p><div class="chat-thread">'+chats+'</div>'+
 '<p class="status">あと '+remaining+' 回行動できます</p>'+
 (remaining?'<div class="paper"><h3>この輪でどう過ごす？</h3><p class="dim">誰と何を話すか決めましょう。交流はこの輪で2回まで。</p>'+
 '<div class="actions">'+btn('話しかける','action-menu','talk')+btn('質問する','action-menu','question')+
 btn('連絡先を頼む','action-menu','contact')+btn('聞き耳を立てる','listen-group','','ghost')+'</div></div>':
 '<div class="notice">この輪では十分に話した。次の輪へ移れます。</div>')+
 '<div class="actions">'+btn('会場のほかの輪へ戻る','back-venue','','ghost')+'</div>';
}
function chooseAction(){
 const mode=S.mode,questionMode=mode==='question';
 const qmap=Object.fromEntries(D.questions.filter(q=>q.group_id===S.group).map(q=>[q.target_id,q]));
 const items=byGroup(S.group).map(id=>{
  const q=qmap[id],name=S.guesses[id]?.verified?people[id].name:PEERS.has(id)?'同期の学生':'名前はまだ曖昧';
  return '<div class="person-card">'+portrait(id,peerClass(id))+'<div><strong>'+esc(name)+'</strong><p class="dim">'+esc(relationship(id))+esc(contactBadge(id))+'</p>'+
  (questionMode?'<p class="dim">'+esc(q?.question||'所属を尋ねる')+'</p>':'')+
  btn(questionMode?'この質問をする':mode==='contact'?'交換を頼む':'話しかける','act-target',id,'mini')+
  (questionMode&&q?btn('所属について聞く','ask-affiliation',id,'mini ghost'):'')+'</div></div>';
 }).join('');
 return '<div class="eyebrow">'+esc(groups[S.group].group_title)+'</div><h2>'+
 (mode==='talk'?'誰に話しかける？':mode==='contact'?'誰に連絡先を頼む？':'誰に何を聞く？')+'</h2>'+
 '<p>顔を見比べながら話す相手を選びます。会場で聞いた名前を思い出せるでしょうか。</p>'+
 '<div class="person-list">'+items+'</div>'+btn('輪に戻る','back-group','','ghost');
}
function night(){
 return '<div class="eyebrow">'+esc(WEEK[S.day])+' / 夜</div><h2>あの顔、誰だったかな。</h2>'+
 '<p>今日出会った人を思い出す。SNS・公開掲示はすべて閲覧可能。手帳での照合とメモ編集は夜だけ、回数無制限です。</p>'+
 '<div class="status">今夜は何度でも調べて照合できます</div>'+
 (S.report?'<div class="notice">'+esc(S.report)+'</div>':'')+
 '<div class="actions">'+btn('人物手帳で照合する','open-notebook')+
 btn('Photogram','night-sns','Photogram')+
 btn('Zitter','night-sns','Zitter')+
 btn('TINE','night-sns','TINE')+
 btn('学内の掲示を見る','night-board')+'</div>'+
 (S.viewedPlatforms[date()]?.length?'<p class="dim">閲覧済み：'+esc(S.viewedPlatforms[date()].join('、'))+'</p>':'')+
 '<div class="actions">'+btn(S.day===4?'金曜の夜、合宿を決める':'翌日へ','next-day')+'</div>';
}
function sns(){
 const platform=S.snsPlatform;
 const tineContacts=platform==='TINE'?unique(S.contacts).filter(id=>!!people[id]&&!!accounts[id+'|TINE']):[];
 const tineMessages=tineContacts.length?'<div class="paper"><h3>交換済みの連絡先</h3><p class="dim">連絡先交換と、相手が安全かどうかは別の話。</p>'+
  tineContacts.map(id=>{
    const msg=Dialogue.snsMessage(id,S);
    if(!msg)return '';
    const a=accounts[id+'|TINE'];
    return '<div class="social">'+(a.avatar_kind==='face'?portrait(id):'<div class="avatar-icon">♪</div>')+
      '<div><strong>'+esc(a.display_name)+'</strong><p>'+esc(msg.text)+'</p></div></div>';
  }).join('')+'</div>':'';
 const visible=D.posts.filter(p=>p.platform===platform&&p.published_at.slice(0,10)<=date()&&
 (p.visibility==='公開'||p.visibility==='匿名表示'||(p.visibility==='鍵垢・承認制'&&S.contacts.includes(p.author_id))||
 ((p.visibility==='グループ参加者'||p.visibility==='主人公との個別')&&S.contacts.includes(p.author_id))));
 return '<div class="eyebrow">SNS / '+esc(platform)+'</div><h2>タイムライン</h2>'+
 '<p class="dim">写真を出している人も、出していない人もいる。名前の似たアカウントが同じ人とは限らない。</p>'+tineMessages+
 (visible.length?visible.map(p=>{
  const a=accounts[p.author_id+'|'+platform];
  const anonymous=p.visibility==='匿名表示';
  const face=!anonymous&&a?.avatar_kind==='face';
  const avatar=face?portrait(p.author_id):'<div class="avatar-icon">♪</div>';
  return '<div class="social">'+avatar+'<div><strong>'+esc(anonymous?'匿名アカウント':a?.display_name||'不明')+'</strong>'+
  '<div class="dim">'+esc(p.published_at)+'</div><p>'+esc(p.text)+'</p>'+
  (face?'<p class="dim">見覚えがある顔かもしれない。</p>'+(S.seen.includes(p.author_id)?btn((S.socialLinked[p.author_id]||[]).includes(platform)?'照合済み':'顔を見比べる','account-match',p.post_id,'mini'):''):'')+'</div></div>';
 }).join(''):'<p>閲覧できる投稿はありません。</p>')+
 '<div class="actions">'+btn('夜の画面に戻る','back-night','','ghost')+'</div>';
}
function snsMatch(){
 const post=D.posts.find(p=>p.post_id===S.selectedSocial);
 if(!post)return '<h2>投稿が見つかりません</h2>'+btn('戻る','back-sns','','ghost');
 const a=accounts[post.author_id+'|'+post.platform];
 const entries=S.seen.map(id=>faceCard(id,S.guesses[id]?.verified?people[id].name:'名前は未確認','match-social-face','この顔かな'));
 return '<div class="eyebrow">'+esc(post.platform)+' / PHOTO</div><h2>この顔、会場で見た？</h2>'+
 '<div class="chosen">'+portrait(post.author_id,'large')+'<div><strong>'+esc(a?.display_name||'アカウント')+'</strong><p class="dim">写真を公開しているアカウント</p></div></div>'+
 '<p>新歓で見た顔と比べてみよう。合致しても本名や所属が自動的に分かるわけではありません。</p>'+
 (S.report?'<div class="notice">'+esc(S.report)+'</div>':'')+
 '<div class="faces">'+entries.join('')+'</div>'+
 btn('SNSに戻る','back-sns','','ghost');
}
const notices=[
 '学内の掲示：一部の団体は、昨年秋から新入生向けの受け入れ枠を作っていたらしい。具体的な対象者は公表されていない。',
 '学内の掲示：大規模団体の幹事が演奏経験者を個別に案内している。誰にでも届く連絡ではない。',
 '学内の掲示：公開ライブの音を知っている先輩と、非公開音源に触れる先輩は別の話かもしれない。',
 '学内の掲示：以前の学外会場には騒音苦情があったが、現在は音量ルールが導入された。',
 '学内の掲示：週末の合宿では一部の団体が希望者に個別練習の案内を出す。担当者名は記載されていない。'
];
function board(){
 return '<div class="eyebrow">学内掲示 / '+esc(WEEK[S.day])+'</div><h2>掲示板</h2>'+
 '<div class="paper"><p>'+esc(notices[S.day])+'</p></div>'+
 '<p class="dim">掲示の情報は事実の一部。誰が危険か、ここだけでは分からない。</p>'+
 btn('夜の画面へ戻る','back-night','','ghost');
}
function notebook(){
 const known=S.seen.slice().sort((a,b)=>a.localeCompare(b));
 const entries=known.map(id=>{
 const guess=S.guesses[id],verified=guess?.verified;
 const note=S.note[id]||'';
 return '<div class="person-card">'+portrait(id)+'<div><strong>'+(verified?esc(people[id].name):'名前を思い出せない')+'</strong>'+
 '<p class="dim">'+(verified?'所属：'+esc(label(people[id].primary_org))+(people[id].dual_org?' ／ 他にも所属あり':''):'写真と記憶を照合できます')+'</p>'+
 '<p class="dim">'+esc(relationship(id))+esc(contactBadge(id))+'</p>'+
 ((S.socialLinked[id]||[]).length?'<p class="dim">顔が一致したSNS：'+esc(S.socialLinked[id].join('、'))+'</p>':'')+
 (S.knownOrg[id]&&!verified?'<p class="dim">話して聞いた所属：'+esc(label(S.knownOrg[id]))+'</p>':'')+
 (note?'<p class="dim">メモ：'+esc(note)+'</p>':'')+
 btn(verified?'記録を見る':canEditNotebook()?'この顔を照合':'顔を見る','open-identity',id,'mini')+'</div></div>';
 }).join('');
 return '<div class="eyebrow">PERSONAL NOTEBOOK</div><h2>顔と名前の手帳</h2>'+
 '<p>今日までに目にした顔 '+known.length+'人。名前と顔の組み合わせは、自分で思い出す必要があります。</p>'+
 (canEditNotebook()?'<p class="status">夜の照合・メモ編集は何度でもできます</p>':'<p class="status">昼は閲覧のみ。照合・編集は夜にできます</p>')+
 (S.report?'<div class="notice">'+esc(S.report)+'</div>':'')+
 '<div class="person-list">'+(entries||'<p>まだ誰にも会っていません。</p>')+'</div>'+
 btn('戻る','back-from-notebook','','ghost');
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
 const notes=editable?'<div class="paper"><label>自由メモ<textarea id="faceNote" rows="2" maxlength="160" placeholder="髪型、見た場所、会話の印象など">'+esc(note)+'</textarea></label>'+btn('メモを保存','save-note','','mini')+'</div>':
 note?'<div class="paper"><p>メモ：'+esc(note)+'</p></div>':'';
 return '<div class="eyebrow">NOTEBOOK / FACE</div><h2>この人は誰？</h2><div class="chosen">'+portrait(id,'large')+
 '<p class="dim">どこで会ったか、何という名前だったかを思い出してください。</p></div>'+
 form+notes+btn('人物一覧へ','back-identity','','ghost');
}
function camp(){
 const choices=D.orgs.map(o=>'<article class="panel"><span class="tag">'+esc(o.common_name)+'</span><p>'+esc(o.focus)+'</p>'+
 btn('この団体の合宿へ','choose-camp',o.org_id)+'</article>').join('');
 const verifiedIds=Object.keys(S.guesses).filter(id=>S.guesses[id]?.verified);
 const targetVerified=!!S.guesses.P001?.verified;
 const hasTalk=Object.values(S.groupLog).flat().some(x=>typeof x?.text==='string'&&(x.text.includes('入学前から、きみに')||x.text.includes('去年の秋にはもう')));
 const hasArchive=S.clues.includes('F-COM-01')||S.viewedBoard['2026-04-06'];
 const clueText=targetVerified&&hasTalk&&hasArchive?
   '照合した西園寺紬の顔、こもれびの所属、入学前から準備された受け入れ枠。ばらばらだった情報が、一つの団体につながった。':
   targetVerified?(hasTalk?'あの人が自分のために席を準備していたという言葉は、まだ耳に残っている。':'西園寺紬という名前と、こもれびの所属は確認できた。これだけで危険だとは言い切れない。'):
   hasArchive?'昨年秋からの受け入れ枠は気になるが、誰が準備したのだろう。':'顔と名前が一致しない人も多い。どの団体で何が起こるか、まだ分からない。';
 const select='<option value="">誰とも断定しない</option>'+verifiedIds.filter(id=>Number(id.slice(1))<=16||id==='P018')
 .map(id=>'<option value="'+esc(id)+'">'+esc(people[id].name)+'</option>').join('');
 return '<div class="eyebrow">金曜の夜 / 週末の合宿</div><h2>誰のいる場所なら、安心できるだろう。</h2>'+
 '<p>すべての顔や名前を覚えられたわけではない。印象だけで判断するのも怖い。それでも行き先は選ばなければならない。</p><div class="paper"><h3>今週の記憶</h3><p>'+esc(clueText)+'</p></div>'+
 '<div class="paper"><p>気にかかっている人がいるなら記録しておこう。犯人を断定する必要はありません。</p><label>特に気になる人物<select id="suspect">'+select+'</select></label>'+btn('考えを記録する','record-suspect','','mini')+'</div>'+
 (S.report?'<div class="notice">'+esc(S.report)+'</div>':'')+
 '<div class="two">'+choices+'</div><div class="actions">'+btn('今回は合宿に行かない','choose-camp','N','ghost')+'</div>';
}
function saturday(){
 const isK=S.camp==='K';
 const prose=S.camp==='N'?'合宿には行かなかった。キャンパスの掲示を見ながら、一人で曲を弾いてみる。':
  label(S.camp)+'の新歓合宿が始まった。練習の音と、知らない先輩の笑い声が聞こえる。';
 return '<div class="eyebrow">土曜日 / '+esc(S.camp==='N'?'学内':label(S.camp))+'</div><h2>選んだ場所</h2><div class="paper"><p>'+esc(prose)+'</p>'+
 (isK?'<p>夕方、個別の練習スペースを案内するという連絡が届く。担当の名前は書かれていない。あなたが好きだった曲名だけが、なぜか添えられている。</p>':
 '<p>知らない人の輪に混ざっても、今日は自分のペースで演奏できそうだ。</p>')+'</div>'+
 (isK?'<div class="actions">'+btn(S.shared?'同行の相談は済ませた':'同期や大学窓口に居場所を共有する','share')+
 btn('個別練習の誘いに応じる','private')+
 btn('誘いを断り、通常の練習に戻る','finish-safe','','ghost')+'</div>':
 '<div class="actions">'+btn('一年後へ','finish-safe')+'</div>');
}
function privateRoom(){
 return '<div class="eyebrow">土曜の夜 / 別室</div><h2>扉の向こうで</h2>'+
 '<div class="paper tense"><p>指定された部屋には、あなたがかつて演奏した曲の譜面が用意されていた。</p><p>帰ろうとすると、案内役が「もう少しだけ」と出口の前に立つ。</p></div>'+
 (S.shared?'<div class="notice">居場所を伝えてあった同期が、迎えに来てくれている。</div>':'<p>まだ連絡はできる。どうする？</p>')+
 '<div class="actions">'+btn(S.shared?'同行者と帰る':'大学窓口と同期に助けを求める','escape')+
 (S.shared?'':btn('連絡せず、その場に残る','stay','','ghost'))+'</div>';
}
function ending(){
 const camp=S.camp==='N'?'合宿に参加しない':label(S.camp)+'の合宿';
 const safe=S.result!=='DANGER';
 const visited=S.eventHistory.map(id=>label(events[id].org_id));
 const group=visited.length?unique(visited).join('、'):'どの新歓にも行かなかった';
 let title='あの春を越えて',body='自分で選んだ場所から、また音楽を始める。';
 if(S.result==='DANGER'){title='閉じた練習室';body='帰り時を伝えても相手は動かなかった。誰かへ連絡する判断を、まだ残していた。'}
 else if(S.result==='RESCUED'){title='迎えに来た人';body='連絡を受けた同期と大学窓口が迎えに来た。ひとりで相手と向き合う必要はなかった。'}
 else if(S.camp==='K'){title='招待を断って';body='こもれびの個別練習の誘いは断った。団体の顔を全員把握しなくても、違和感に気づくことはできた。'}
 else if(S.camp==='N'){title='参加しない自由';body='不安が残る一週間だった。行かないという選択も、自分の居場所を守る方法だった。'}
 const linked=Object.keys(S.guesses).filter(id=>S.guesses[id]?.verified);
 const suspectCorrect=S.suspect==='P001';
 const epilogue='2027年4月。'+(safe?'いくつかの学生の顔は今も思い出せる。':'あの夜のことを、時間をかけて整理している。')+
 (visited.length?'あの週、'+group+'で聴いた音は忘れていない。':'新しい音楽に触れる機会は、これからもある。');
 const explain=(safe&&suspectCorrect?'気になった人物の所属を確かめ、大学窓口に相談した。その記録はその後の調査にも役立った。':
 linked.includes('P001')?'あのとき照合した顔と、その人が関わる小さな団体の記録が残っている。':
 '名前が分からないまま終わった人も多い。手帳の余白は、まだ残っている。');
 return '<div class="eyebrow">2026年4月12日 / 日曜</div><h1>THE END</h1><h2>'+esc(title)+'</h2>'+
 '<div class="paper"><p>'+esc(body)+'</p><p>'+esc(explain)+'</p><hr><p>'+esc(epilogue)+'</p></div>'+
 '<div class="paper"><h3>一週間の記録</h3><p>見学 '+S.eventHistory.length+'回 ／ 見かけた顔 '+S.seen.length+'人 ／ 照合した顔 '+linked.length+'人</p><p>週末：'+esc(camp)+'</p></div>'+
 btn('別の一週間を始める','reset')+btn('手帳を振り返る','open-notebook','','ghost');
}
function draw(){
 hydrate();APP.innerHTML='<div class="layout">'+header()+'<main>'+site()+'</main><footer>短編UIゲーム実験室 ／ S6 β prototype — 本番版とは別に開発中</footer></div>';
 if(S.phase==='camp'){const s=document.getElementById('suspect');if(s)s.value=S.suspect||'';}
 if(S.phase==='identity'&&S.guesses[S.currentNotebook]?.name){
  const n=document.getElementById('guessName'),o=document.getElementById('guessOrg');if(n)n.value=S.guesses[S.currentNotebook].name;if(o)o.value=S.guesses[S.currentNotebook].org||'';
 }
 window.scrollTo({top:0,behavior:'instant'});
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
 case 'save':remember();S.report='この端末に記録しました。';draw();break;
 case 'attend':{
  if(S.phase!=='day'||!events[id]||events[id].date!==date())return;
  S.selectedEvent=id;S.eventHistory.push(id);S.visitedGroups=[];S.group=null;
  // The event hall offers face recognition but no free name reveal.
  for(const pid of byEvent(id)){if(!S.seen.includes(pid))S.seen.push(pid);
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
  if(S.phase!=='venue'||!groups[id]||groups[id].event_id!==S.selectedEvent||S.visitedGroups.length>=2||S.visitedGroups.includes(id))return;
  S.group=id;S.visitedGroups.push(id);
  S.flash=byGroup(id).filter(pid=>!S.introduced.includes(pid));
  go('flash');break;
 }
 case 'action-menu':{
  if(S.phase!=='group'||!S.group||(S.groupLog[S.group]||[]).length>=2)return;
  if(!['talk','question','contact'].includes(id))return;
  S.mode=id;go('choose');break;
 }
 case 'back-group':if(S.phase==='choose')go('group');break;
 case 'act-target':
 case 'ask-affiliation':{
  if(S.phase!=='choose'||!S.group||!byGroup(S.group).includes(id)||(S.groupLog[S.group]||[]).length>=2)return;
  const type=act==='ask-affiliation'?'affiliation':S.mode;
  const q=D.questions.find(q=>q.group_id===S.group&&q.target_id===id);
  let reply,kind=type;
  if(type==='talk'){
    reply=Dialogue.talk(id,S.group,S);
    if(!S.spokenTo.includes(id))S.spokenTo.push(id);
    recordConversation(id);
  }else if(type==='question'||type==='affiliation'){
    reply=Dialogue.answer(id,S.group,type==='affiliation'?'affiliation':'question');
    recordConversation(id);
    if(reply.primaryOrg)S.knownOrg[id]=reply.primaryOrg;
    if(reply.dualOrg)S.crossings[id]=true;
    if(type==='question'&&q?.reveals?.includes('group_focus'))S.knownOrg[id]=people[id].primary_org||'N';
    // Asking somebody explicitly to introduce themself gives a name as an earned answer.
    if(type==='question'&&q?.reveals?.includes('self_name')&&q.answer?.includes(people[id].name)&&!S.introduced.includes(id))S.introduced.push(id);
    if(id==='P001'&&type==='affiliation')reply.text+=' 昨年の秋にはもう、新入生を迎える席を決めていたんだ。';
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
  (S.groupLog[S.group]??=[]).push({pid:id,type:kind,text:reply.text});
  S.groupDone[S.group]=reply.text;
  S.report='';go('group');break;
 }
 case 'listen-group':{
  if(S.phase!=='group'||(S.groupLog[S.group]||[]).length>=2)return;
  const msg=actions[S.group]?.listen_text||'周りの音と会話を聴いた。';
  (S.groupLog[S.group]??=[]).push({pid:null,type:'聞き耳',text:msg});
  S.groupDone[S.group]=msg;
  const fact=actions[S.group]?.trigger_fact_id;
  if(fact&&!S.clues.includes(fact))S.clues.push(fact);
  go('group');break;
 }
 case 'back-venue':go('venue');break;
 case 'finish-venue':if(S.phase==='venue')go('night');break;
 case 'open-notebook':if(S.phase==='notebook'||S.phase==='identity')return;S.returnTo=S.phase;go('notebook');break;
 case 'back-from-notebook':go(S.returnTo==='notebook'?'night':(S.returnTo||'night'));break;
 case 'open-identity':if(S.seen.includes(id)){S.currentNotebook=id;go('identity')}break;
 case 'back-identity':go('notebook');break;
 case 'save-note':{
  if(S.phase!=='identity'||!canEditNotebook())return;
  const t=document.getElementById('faceNote');if(t)S.note[S.currentNotebook]=String(t.value).slice(0,160);
  S.report='この顔のメモを保存した。';go('notebook');break;
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
 S.viewedPlatforms[date()]=unique([...(S.viewedPlatforms[date()]||[]),id]);S.snsPlatform=id;go('sns');break;
}
 case 'account-match':{
  if(S.phase!=='sns')return;
  const post=D.posts.find(p=>p.post_id===id),acct=post&&accounts[post.author_id+'|'+post.platform];
  if(!post||post.platform!==S.snsPlatform||post.visibility==='匿名表示'||acct?.avatar_kind!=='face'||!S.seen.includes(post.author_id))return;
  S.selectedSocial=id;S.report='';go('sns-match');break;
 }
 case 'match-social-face':{
  if(S.phase!=='sns-match'||!S.seen.includes(id))return;
  const post=D.posts.find(p=>p.post_id===S.selectedSocial);
  if(!post)return;
  if(id!==post.author_id){S.report='似ているが、別人だったようだ。';go('sns-match');return}
  S.socialLinked[id]=unique([...(S.socialLinked[id]||[]),post.platform]);
  S.report='SNSの写真と新歓で見た顔が一致した。';go('sns');break;
 }
 case 'back-sns':go('sns');break;
 case 'night-board':{
 if(S.phase!=='night')return;S.viewedBoard[date()]=true;go('board');break;
}
 case 'back-night':go('night');break;
 case 'next-day':{
  if(S.phase!=='night')return;
  for(const pid of S.pendingContacts)if(!S.contacts.includes(pid))S.contacts.push(pid);S.pendingContacts=[];
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
 case 'share':S.shared=true;go('saturday');break;
 case 'private':if(S.phase==='saturday'&&S.camp==='K'){S.privateInvite=true;go('private')}break;
 case 'finish-safe':if(S.phase==='saturday'){S.result=S.camp==='K'?'DECLINED':'SAFE';go('end')}break;
 case 'escape':if(S.phase==='private'){S.result='RESCUED';go('end')}break;
 case 'stay':if(S.phase==='private'&&!S.shared){S.result='DANGER';go('end')}break;
 }
}
APP.addEventListener('click',e=>{
 const b=e.target.closest('[data-act]');if(!b)return;e.preventDefault();
 handle(b.dataset.act,b.dataset.id||'');
});
draw();
})();