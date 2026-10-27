(() => {
'use strict';
const D=window.S6_DATA, APP=document.getElementById('app'), KEY='s6-origin-beta-010';
const VERSION='0.1.0', BUILD='2026-10-27 21:50 JST';
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
 eventHistory:[],seen:[],introduced:[],flash:[],visitedGroups:[],groupDone:{},contacts:[],socialLinked:{},selectedSocial:null,
 guesses:{},note:{},clues:[],crossings:{},knownOrg:{},nightChoice:{},
 checks:{},currentNotebook:null,suspect:'',camp:'',shared:false,privateInvite:false,
 report:'',result:'',savedAt:''
});
let S;
try {const raw=JSON.parse(localStorage.getItem(KEY));S=raw&&raw.schema===1?raw:initial()}catch{S=initial()}
function hydrate(){
 for(const k of ['eventHistory','seen','introduced','flash','visitedGroups','contacts','clues'])if(!Array.isArray(S[k]))S[k]=[];
 for(const k of ['groupDone','guesses','note','crossings','knownOrg','nightChoice','checks','socialLinked'])if(!S[k]||typeof S[k]!=='object')S[k]={};
}
hydrate();
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
 case 'intro':return '<div class="eyebrow">4月、入学</div><h2>知っている顔は、まだいない。</h2><div class="paper"><p>高校時代、バンドをやっていた。匿名の誰かが帰り道を知り、あなたの行動を言い当てるようになった。音楽から離れ、浪人生活を経て大学に入った。</p><p>ここでは、安心して演奏できる場所を探したい。だが、あの人がまた近くにいるかもしれない。</p></div><h3>一週間の流れ</h3><p>平日は新歓を一日一つまで選べます。会場では二組だけに参加できます。自己紹介の顔と名前が並ぶのは最初の一度だけ。覚えきれないこともあります。</p><p>夜には公開SNSと掲示を確認し、手帳で「この顔は誰だった？」と照合できます。週末には、安全だと思うサークルの合宿先を一つ選びます。</p>'+btn('月曜日へ','begin');
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
 const newcomers=S.flash;
 return '<div class="eyebrow">'+esc(WEEK[S.day])+' / '+esc(label(events[S.selectedEvent].org_id))+'</div><h2>一度きりの自己紹介</h2><p>受付が、次々に名前を呼んでいく。顔と名前が並ぶのはここだけ。必要なら今、覚えたりメモしたりしてください。</p>'+
 '<p class="status">'+newcomers.length+'人の新しい顔 ／ 会場全体 '+byEvent(S.selectedEvent).length+'人</p>'+
 '<div class="faces">'+newcomers.map(id=>'<div class="intro-face">'+portrait(id)+
 '<strong>'+esc(people[id].name)+'</strong><span>'+esc(people[id].year)+'年 ／ '+esc(label(people[id].primary_org))+
 (people[id].dual_org?'・'+esc(label(people[id].dual_org))+'も参加':'')+'</span></div>').join('')+'</div>'+
 '<div class="actions">'+btn('自己紹介を聞き終えて会場へ','leave-flash')+'</div>';
}
function venue(){
 const e=events[S.selectedEvent];
 const gs=D.groups.filter(g=>g.event_id===e.event_id);
 return '<div class="eyebrow">'+esc(WEEK[S.day])+' / '+esc(label(e.org_id))+'</div><h2>'+esc(e.title)+'</h2>'+
 '<p>あちこちで演奏や会話が始まっている。どの二組に混ざろう？</p><div class="status">話したグループ '+S.visitedGroups.length+' / 2</div>'+
 '<div class="two">'+gs.map(g=>'<article class="panel"><h3>'+esc(g.group_title)+'</h3><p>'+esc(g.activity)+'</p><div class="faces small-faces">'+byGroup(g.group_id).map(id=>portrait(id)).join('')+'</div>'+
 (S.visitedGroups.includes(g.group_id)?'<span class="pill">参加済み</span>':S.visitedGroups.length>=2?'<span class="dim">今日はここまで</span>':btn('この輪に入る','join-group',g.group_id))+'</article>').join('')+'</div>'+
 '<div class="actions">'+btn('会場を出て夜へ','finish-venue')+'</div>';
}
function group(){
 const g=groups[S.group],ids=byGroup(g.group_id),lines=D.lines.filter(l=>l.group_id===g.group_id);
 const result=S.groupDone[g.group_id];
 return '<div class="eyebrow">'+esc(label(events[g.event_id].org_id))+' / '+esc(g.group_title)+'</div><h2>輪の中の顔</h2>'+
 '<p>'+esc(g.activity)+'</p><div class="speech">'+lines.slice(0,3).map(l=>'<p>「'+esc(l.text)+'」</p>').join('')+'</div>'+
 '<p class="dim">誰の名前だったか、もう自信がない。顔を選んで確かめよう。</p>'+
 (result?'<div class="notice">'+esc(result)+'</div>':'<div class="faces">'+ids.map(id=>faceCard(id,'', 'choose-person','この人と関わる')).join('')+'</div>'+
 '<div class="actions">'+btn('輪の雰囲気を見ておく','listen-group')+'</div>')+
 '<div class="actions">'+btn('会場に戻る','back-venue','','ghost')+'</div>';
}
function chooseAction(){
 const id=S.target,p=people[id];
 return '<div class="eyebrow">'+esc(groups[S.group].group_title)+'</div><h2>この人と何を話そう？</h2><div class="chosen">'+portrait(id,'large')+'<div><p>'+esc(p.appearance)+'</p><p class="dim">一つだけ行動を選べます。</p></div></div>'+
 '<div class="actions">'+btn('話しかける','interact','talk')+btn('所属を聞く','interact','club')+btn('連絡先を頼む','interact','contact')+'</div>'+
 btn('選び直す','back-group','','ghost');
}
function night(){
 return '<div class="eyebrow">'+esc(WEEK[S.day])+' / 夜</div><h2>あの顔、誰だったかな。</h2>'+
 '<p>今日、会った人を思い出す。夜はSNSか公開掲示を一つ確認できる。手帳での名前照合は二回まで。</p>'+
 '<div class="status">名前と所属の照合 '+(S.checks[date()]||0)+' / 2</div>'+
 (S.report?'<div class="notice">'+esc(S.report)+'</div>':'')+
 '<div class="actions">'+btn('人物手帳で照合する','open-notebook')+
 btn('Photogram','night-sns','Photogram',S.nightChoice[date()]?'ghost':'')+
 btn('Zitter','night-sns','Zitter',S.nightChoice[date()]?'ghost':'')+
 btn('TINE','night-sns','TINE',S.nightChoice[date()]?'ghost':'')+
 btn('学内の掲示を見る','night-board','',S.nightChoice[date()]?'ghost':'')+'</div>'+
 (S.nightChoice[date()]?'<p class="dim">今夜確認したもの：'+esc(S.nightChoice[date()])+'</p>':'')+
 '<div class="actions">'+btn(S.day===4?'金曜の夜、合宿を決める':'翌日へ','next-day')+'</div>';
}
function sns(){
 const platform=S.snsPlatform;
 const visible=D.posts.filter(p=>p.platform===platform&&p.published_at.slice(0,10)<=date()&&
 (p.visibility==='公開'||p.visibility==='匿名表示'||(p.visibility==='鍵垢・承認制'&&S.contacts.includes(p.author_id))||
 ((p.visibility==='グループ参加者'||p.visibility==='主人公との個別')&&S.contacts.includes(p.author_id))));
 return '<div class="eyebrow">SNS / '+esc(platform)+'</div><h2>タイムライン</h2>'+
 '<p class="dim">写真を出している人も、出していない人もいる。名前の似たアカウントが同じ人とは限らない。</p>'+
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
 ((S.socialLinked[id]||[]).length?'<p class="dim">顔が一致したSNS：'+esc(S.socialLinked[id].join('、'))+'</p>':'')+
 (S.knownOrg[id]&&!verified?'<p class="dim">話して聞いた所属：'+esc(label(S.knownOrg[id]))+'</p>':'')+
 (note?'<p class="dim">メモ：'+esc(note)+'</p>':'')+
 btn(verified?'メモを見る':'この顔を照合','open-identity',id,'mini')+'</div></div>';
 }).join('');
 return '<div class="eyebrow">PERSONAL NOTEBOOK</div><h2>顔と名前の手帳</h2>'+
 '<p>今日までに目にした顔 '+known.length+'人。自己紹介の名前は記録の候補に残っていますが、対応する顔は自分で思い出す必要があります。</p>'+
 '<p class="status">今夜の照合 '+(S.checks[date()]||0)+' / 2</p>'+
 (S.report?'<div class="notice">'+esc(S.report)+'</div>':'')+
 '<div class="person-list">'+(entries||'<p>まだ誰にも会っていません。</p>')+'</div>'+
 btn('戻る','back-from-notebook','','ghost');
}
function identity(){
 const id=S.currentNotebook,person=people[id],guess=S.guesses[id],names=unique(S.introduced).map(pid=>people[pid]).sort((a,b)=>a.name.localeCompare(b.name,'ja'));
 const options=names.map(p=>'<option value="'+esc(p.person_id)+'">'+esc(p.name)+'</option>').join('');
 const note=S.note[id]||'';
 return '<div class="eyebrow">NOTEBOOK / FACE</div><h2>この人は誰？</h2><div class="chosen">'+portrait(id,'large')+
 '<p class="dim">どこで会ったか、何という名前だったかを思い出してください。</p></div>'+
 (guess?.verified?'<div class="notice">'+esc(person.name)+' ／ '+esc(label(person.primary_org))+'。照合済み。</div>':
 '<div class="paper"><label>名前<select id="guessName"><option value="">選ぶ</option>'+options+'</select></label>'+
 '<label>主に所属している団体<select id="guessOrg"><option value="">選ぶ</option>'+D.orgs.map(o=>'<option value="'+esc(o.org_id)+'">'+esc(o.common_name)+'</option>').join('')+
 '<option value="N">まだサークルに所属していない新入生</option></select></label>'+
 '<p class="dim">照合は一日二回まで。答えが違っても記録できますが、確認の機会を一回使います。</p>'+btn('名前と所属を照合','submit-identity')+'</div>')+
 '<div class="paper"><label>自由メモ<textarea id="faceNote" rows="2" maxlength="160" placeholder="髪型、見た場所、会話の印象など">'+esc(note)+'</textarea></label>'+btn('メモを保存','save-note','','mini')+'</div>'+
 btn('人物一覧へ','back-identity','','ghost');
}
function camp(){
 const choices=D.orgs.map(o=>'<article class="panel"><span class="tag">'+esc(o.common_name)+'</span><p>'+esc(o.focus)+'</p>'+
 btn('この団体の合宿へ','choose-camp',o.org_id)+'</article>').join('');
 const verifiedIds=Object.keys(S.guesses).filter(id=>S.guesses[id]?.verified);
 const targetVerified=!!S.guesses.P001?.verified;
 const hasTalk=Object.values(S.groupDone).some(t=>typeof t==='string'&&(t.includes('入学前から、きみに')||t.includes('去年の秋にはもう')));
 const hasArchive=S.clues.includes('F-COM-01')||S.nightChoice['2026-04-06']==='掲示板';
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
 case 'start':go('intro');break;
 case 'begin':go('day');break;
 case 'reset':S=initial();go('title');break;
 case 'save':remember();S.report='この端末に記録しました。';draw();break;
 case 'attend':{
  if(S.phase!=='day'||!events[id]||events[id].date!==date())return;
  S.selectedEvent=id;S.eventHistory.push(id);S.visitedGroups=[];S.group=null;
  const full=byEvent(id);
  S.flash=full.filter(pid=>!S.introduced.includes(pid));
  for(const pid of full){if(!S.seen.includes(pid))S.seen.push(pid);
    const inOther=D.members.filter(m=>m.person_id===pid&&events[m.event_id].org_id!==events[id].org_id&&S.eventHistory.includes(m.event_id));
    if(inOther.length)S.crossings[pid]=true;
  }
  go('flash');break;
 }
 case 'leave-flash':{
  for(const pid of S.flash)if(!S.introduced.includes(pid))S.introduced.push(pid);
  S.flash=[];go('venue');break;
 }
 case 'skip':if(S.phase==='day')go('night');break;
 case 'join-group':{
  if(S.phase!=='venue'||!groups[id]||groups[id].event_id!==S.selectedEvent||S.visitedGroups.length>=2||S.visitedGroups.includes(id))return;
  S.group=id;S.visitedGroups.push(id);go('group');break;
 }
 case 'choose-person':if(S.phase==='group'&&!S.groupDone[S.group]&&byGroup(S.group).includes(id)){S.target=id;go('choose')}break;
 case 'back-group':go('group');break;
 case 'interact':{
  if(S.phase!=='choose'||!S.group||S.groupDone[S.group]||!byGroup(S.group).includes(S.target))return;
  const p=people[S.target],a=accounts[p.person_id+'|TINE'];
  let msg='';
  if(id==='talk'){msg='話しかけると「'+(profiles[p.person_id]?.first_hook||'新歓、楽しんでいってね。')+'」と返ってきた。';
   if(p.person_id==='P001')msg+='「入学前から、きみに合いそうな席を考えていたんだ」と付け足した。';}
  else if(id==='club'){msg='普段は'+label(p.primary_org)+'で活動しているらしい。'+(p.dual_org?'別の団体にも顔を出していると言う。':'');
   S.knownOrg[p.person_id]=p.primary_org; if(p.dual_org)S.crossings[p.person_id]=true;
   if(p.person_id==='P001')msg+='去年の秋にはもう、新入生を迎える席を決めていたらしい。';}
  else if(id==='contact'){S.contacts.push(p.person_id);msg='TINEの表示名「'+(a?.display_name||'アカウント')+'」を教えてもらった。顔と本名が一致しているかは、自分で覚えておこう。';}
  else return;
  S.groupDone[S.group]=msg;go('group');break;
 }
 case 'listen-group':{
  if(S.phase!=='group'||S.groupDone[S.group])return;
  S.groupDone[S.group]=actions[S.group]?.listen_text||'演奏と雑談を聞いた。';
  if(actions[S.group]?.trigger_fact_id&&!S.clues.includes(actions[S.group].trigger_fact_id))S.clues.push(actions[S.group].trigger_fact_id);
  go('group');break;
 }
 case 'back-venue':go('venue');break;
 case 'finish-venue':if(S.phase==='venue')go('night');break;
 case 'open-notebook':S.returnTo=S.phase;go('notebook');break;
 case 'back-from-notebook':go(S.returnTo==='notebook'?'night':(S.returnTo||'night'));break;
 case 'open-identity':if(S.seen.includes(id)){S.currentNotebook=id;go('identity')}break;
 case 'back-identity':go('notebook');break;
 case 'save-note':{
  const t=document.getElementById('faceNote');if(t)S.note[S.currentNotebook]=String(t.value).slice(0,160);
  S.report='この顔のメモを保存した。';go('notebook');break;
 }
 case 'submit-identity':{
  if(S.phase!=='identity'||(S.checks[date()]||0)>=2)return;
  const n=document.getElementById('guessName')?.value||'';
  const org=document.getElementById('guessOrg')?.value||'';
  if(!n||!org){S.report='名前と所属の両方を選んでください。';go('notebook');return}
  if(!S.introduced.includes(n))return;
  S.checks[date()]=(S.checks[date()]||0)+1;
  const p=people[S.currentNotebook],correct=p.person_id===n&&(p.primary_org||'N')===org;
  S.guesses[p.person_id]={name:n,org,verified:correct};
  S.report=correct?'顔・名前・所属が一致した。'+(S.crossings[p.person_id]?'別の団体とのつながりにも注意しておこう。':''):
   '記憶と名簿が一致しない。別の人を取り違えたかもしれない。';
  go('notebook');break;
 }
 case 'night-sns':{
  if(S.phase!=='night')return;
  const used=S.nightChoice[date()];
  if(used&&used!==id)return;
  S.nightChoice[date()]=id;S.snsPlatform=id;go('sns');break;
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
  if(S.phase!=='night')return;
  const used=S.nightChoice[date()];
  if(used&&used!=='掲示板')return;
  S.nightChoice[date()]='掲示板';go('board');break;
 }
 case 'back-night':go('night');break;
 case 'next-day':{
  if(S.phase!=='night')return;
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