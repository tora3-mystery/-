(() => {
  'use strict';
  const D = window.S6_DATA;
  const APP = document.getElementById('app');
  const SAVE_KEY = 's6-case-a-v03-save';
  const AUTO_KEY = 's6-case-a-v03-auto';
  const META_KEY = 's6-case-a-v03-meta';
  const BUILD_AT = '2026-10-27 11:23 JST';
  const DAYS = [
    ['2026-04-06','4月6日 月曜'],['2026-04-07','4月7日 火曜'],
    ['2026-04-08','4月8日 水曜'],['2026-04-09','4月9日 木曜'],
    ['2026-04-10','4月10日 金曜']
  ];
  const ORG = {L:'LAMP',Z:'残響',J:'JAMBOX',K:'こもれび音楽同好会',W:'wav.',F:'404'};
  const CAMP = ['LAMP','残響','JAMBOX','こもれび音楽同好会','wav.','404','辞退'];
  const CAMP_STORY = {
    LAMP:'広い部屋で、何人もの音が一曲の入りに集まる。無理に前へ出なくても、客席から音の輪郭をつかめた。',
    残響:'未完成の曲に一音を足す。作者がうなずき、その一音は「借り物」ではなくここで生まれた音になる。',
    JAMBOX:'合図を見失っても、八代が次の小節から戻してくれる。失敗を止めない音楽がある。',
    'こもれび音楽同好会':'小さな部屋で、一人の音が終わるまで誰も急かさない。紬は温かいお茶を差し出した。',
    'wav.':'画面を閉じてもよい共同制作。公開範囲を自分で選べることが、今日は何より大事だった。',
    '404':'学外ライブの準備は音量計から始まった。噂の背景を話し、今の約束を守る人たちがいる。',
    辞退:'菜月と渚に誘われ、学内の空き教室で短く音を出す。合宿に行かない選択も、音楽を諦めることではない。'
  };
  const pmap = Object.fromEntries(D.people.map(x=>[x.person_id,x]));
  const emap = Object.fromEntries(D.events.map(x=>[x.event_id,x]));
  const gmap = Object.fromEntries(D.groups.map(x=>[x.group_id,x]));
  const amap = Object.fromEntries(D.accounts.map(x=>[x.person_id+'|'+x.platform,x]));
  const evid = Object.fromEntries(D.evidence.map(x=>[x.cohort_id,x]));
  const receipts = Object.fromEntries(D.receipts.map(x=>[x.cohort_id,x]));
  const esc = x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const getMeta=()=>{try{return JSON.parse(localStorage.getItem(META_KEY))||{}}catch{return {}}};
  const makeState=()=>({
    schema:3,caseId:'A',phase:'title',returnPhase:null,day:0,eventId:null,eventHistory:[],
    visitedGroups:[],groupActions:{},groupReunions:{},activeGroup:null,groupResult:'',reunionText:'',preEventState:{},
    person:{},contactSince:{},replyLog:{},nightUsed:{},nightDone:{},nightMessage:'',lunchSeenDates:[],lunchPreState:{},lunchTalked:{},lunchMessage:'',
    evidence:{},oldNew:false,bridge:false,bridgeAvailable:false,
    discoveredFacts:[],viewedPosts:[],platform:'Photogram',
    campChoice:null,safety:false,risky:false,rescued:false,
    inference:false,deductionMessage:'',ending:null,hintsOpen:0,sundayPreserved:false,
    selectedPerson:null,notebookFilter:'seen',boardMessage:'',
    alias:'κ-'+Math.random().toString(36).slice(2,6).toUpperCase()
  });
  let S=makeState();
  const ps=pid=>{
    const p=(S.person[pid]??={seen:false,met:false,introduced:false,contact_requested:false,contact_exchanged:false,contact_pending:false,contacts:[],pendingContacts:[],identity_confirmed:false,clearPortrait:false,bookmark:false,nameKnownFromDoc:false,note:'',hypothesis:'未設定'});
    if(!Array.isArray(p.contacts))p.contacts=p.contact_exchanged?['TINE']:[];
    if(!Array.isArray(p.pendingContacts))p.pendingContacts=[];
    return p;
  };
  const currentDate=()=>DAYS[Math.min(S.day,4)][0];
  const currentLabel=()=>DAYS[Math.min(S.day,4)][1];
  const nightCount=()=>S.nightUsed[currentDate()]||0;
  const platformPosts=p=>D.posts.filter(x=>x.platform===p&&x.published_at.slice(0,10)<=currentDate());
  const postAccessible=p=>{
    const contacts=ps(p.author_id).contacts;
    return p.visibility==='公開'||p.visibility==='匿名表示'
      ||(p.visibility==='鍵垢・承認制'&&contacts.includes('Photogram'))
      ||((p.visibility==='グループ参加者'||p.visibility==='主人公との個別')&&contacts.includes('TINE'));
  };
  const platformNeedsAction=p=>platformPosts(p).some(x=>postAccessible(x)&&!S.viewedPosts.includes(x.post_id));
  const saved=()=>localStorage.setItem(AUTO_KEY,JSON.stringify(S));
  const saveAndRender=()=>{saved();render()};
  const photo=(pid,opts={})=>{
    const p=pmap[pid],state=ps(pid),blur=opts.venue?false:(state.seen&&!state.met&&!state.clearPortrait);
    if (!p || (!opts.venue&&!state.seen&&!state.clearPortrait)) return '<span class="face"><span class="silhouette" aria-hidden="true">◇</span></span>';
    const cls='face'+(opts.large?' large':'')+(blur?' blurred':'');
    if(p.portrait_status==='ready')return '<span class="'+cls+'"><img src="'+esc(p.portrait_path)+'" alt="架空人物の顔写真"></span>';
    return '<span class="'+cls+'" role="img" aria-label="顔写真未受領の仮表示"><span class="silhouette" aria-hidden="true">◌</span></span>';
  };
  const publicAppearance=pid=>(pmap[pid]?.appearance||'').replace(/。?顔素材は未制作/g,'').trim();
  const knownName=pid=>{const x=ps(pid);return x.introduced||x.identity_confirmed||x.nameKnownFromDoc?pmap[pid].name:'名前未確認'};
  const side=()=>{
    const seen=Object.values(S.person).filter(x=>x.seen).length;
    const met=Object.values(S.person).filter(x=>x.met).length;
    const mark=S.discoveredFacts.length;
    const weekend=['camp','saturday','risk','sunday','deduction','ending'].includes(S.phase);
    return '<aside class="sidebar"><h3>いまの手がかり</h3><div class="side-card"><p><strong>'+esc(S.phase==='title'?'プレイ前':weekend?'週末・その後':currentLabel())+'</strong></p><p>見かけた顔 '+seen+'人／会話した人 '+met+'人</p><p>気づいた違和感 '+mark+'件</p></div><div class="side-card"><p><strong>調査</strong></p><p>'+(weekend?'平日の調査は終了':('今夜 '+nightCount()+'/3 回'))+'</p><p>資料の再読・手帳の編集は無料。</p></div><div class="side-card"><p><strong>顔写真</strong></p><p>別Workの素材を待っています。現在は仮表示です。</p></div></aside>';
  };
  const header=()=>{
    const game=S.phase!=='title'&&S.phase!=='warning';
    return '<header class="topbar"><div class="brand">新歓のご案内です。</div><div class="build">v'+D.version+'<br>更新 '+BUILD_AT+'</div><div class="top-actions">'+
      (game?'<button data-act="notebook">人物手帳</button><button data-act="dossier">資料</button>':'')+
      '<button data-act="save">保存</button><button data-act="load">読込</button>'+(game?'<button data-act="start">最初から</button>':'')+'</div></header>';
  };
  const btn=(label,act,extra='',kind='secondary')=>'<button class="btn '+kind+'" data-act="'+esc(act)+'" '+extra+'>'+esc(label)+'</button>';
  const note=(s,bad=false)=>'<div class="notice'+(bad?' bad':'')+'">'+s+'</div>';
  const title=()=>'<p class="eyebrow">S6 / 2026 APRIL</p><h1>新歓の<br>ご案内です。</h1><p class="lead">新しい大学、新しい音。まずは、気になる新歓へ。<br>一週間の選択で、出会う人と見えてくる情報が変わります。</p><div class="btnrow">'+btn('最初から','start','','')+btn('保存から続ける','load','','ghost')+'</div>'+note('CASE Aの試遊版です。CASE B〜Dは設計中のため、選択画面には表示しません。')+'<p class="subtle">顔写真は制作中です。仮表示で操作確認はできますが、人物照合の最終試遊には実際の架空人物写真が必要です。</p>';
  const warning=()=>'<p class="eyebrow">PLAY NOTICE</p><h2>始める前に</h2><div class="card warn"><p>この物語は、ストーキングと精神的圧迫を扱います。選択によって、監禁や行動制限を示す危険な結末があります。過度な暴力や性的暴力は描かず、ジャンプスケア中心ではありません。</p></div><p class="lead">不安を感じたら、いつでも中断できます。ゲーム内では犯人が分からなくても相談と安全確保を選べます。</p><div class="btnrow">'+btn('続ける','intro','','')+btn('タイトルへ','title','','ghost')+'</div>';
  const intro=()=>'<p class="eyebrow">APRIL 2026</p><h2>もう一度、音を出す場所を探す。</h2><div class="card"><p class="lead">高校時代、少し名前の知られたバンドで演奏していた。匿名の相手は帰り道に現れ、行動を言い当てる連絡を続けた。音楽をやめ、浪人を経て、今年ようやく大学へ入った。</p><p class="lead">ここにも、あの頃を知る誰かがいるかもしれない。それでも、自分で安心できる場所を選びたい。</p></div><p class="subtle">平日は一日一つまで新歓を選べます。各会場では二つのグループと交流できます。行かない日も選べます。</p><div class="btnrow">'+btn('4月6日へ','begin','','')+'</div>';
  const day=()=>{
    const [date,label]=DAYS[S.day], list=D.events.filter(e=>e.date===date);
    const lunchCount=D.recurring.filter(x=>x.date===date).length;
    const cards=list.map(e=>{
      const familiar=[...new Set(D.members.filter(m=>m.event_id===e.event_id).map(m=>m.person_id))]
        .filter(pid=>S.person[pid]?.met&&S.person[pid]?.introduced);
      const reunionBadge=familiar.length?
        '<p class="subtle">前に話した'+esc(familiar.slice(0,2).map(pid=>pmap[pid].name).join('・'))+
        (familiar.length>2?'たち':'')+'も参加予定らしい。</p>':'';
      return '<article class="card event-card"><p class="eyebrow">'+esc(ORG[e.org_id])+'</p><h3>'+esc(e.title)+'</h3><div class="meta">'+esc(e.start)+'–'+esc(e.end)+' / '+esc(e.location)+'</div><p>'+esc(D.orgs.find(o=>o.org_id===e.org_id).focus)+'。会場にいる人を見てから、話す二組を選べます。</p>'+reunionBadge+btn('この新歓に参加','event','data-eid="'+esc(e.event_id)+'"','')+'</article>';}).join('');
    return '<p class="eyebrow">DAY '+(S.day+1)+' / 5</p><h2>'+esc(label)+'：どこへ行こう？</h2><p class="lead">犯人を探すためではなく、今日は音楽を楽しむために選ぶ。</p>'+(lunchCount?'<div class="card soft"><h3>昼休みの学内</h3><p>今日は'+lunchCount+'人の姿がある。顔を見て、気になる人と話せる。夜の調査や新歓の選択には影響しない。</p>'+btn('昼休みに立ち寄る','lunch','','secondary')+'</div>':'')+'<div class="grid2">'+cards+'</div><div class="btnrow">'+btn('学内の公開掲示を読む','board','','secondary')+btn('今日は新歓に参加しない','skip-day','','ghost')+'</div>';
  };
  const lunch=()=>{
    const date=currentDate(),list=D.recurring.filter(x=>x.date===date),talked=S.lunchTalked[date]||[],prior=S.lunchPreState[date]||{};
    return '<p class="eyebrow">LUNCH / '+esc(date)+'</p><h2>学食前ですれ違う</h2><p class="subtle">この場では顔が見える。まだ紹介されていない人の名前は表示しない。今日は二人まで話せる。</p>'+(S.lunchMessage?note(esc(S.lunchMessage)):'')+'<p class="score">会話 '+talked.length+' / 2 人</p><div class="person-list">'+list.map(x=>'<div class="person-card">'+photo(x.person_id,{venue:true})+'<div><div class="name">'+esc(knownName(x.person_id))+'</div><div class="small">'+esc(pmap[x.person_id].appearance)+'</div>'+(talked.includes(x.person_id)?'<span class="chip">会話済み</span>':talked.length<2?btn('話しかける','lunch-talk','data-pid="'+x.person_id+'"','tiny'):'<span class="chip dim">今日は見かけた</span>')+'</div></div>').join('')+'</div><div class="btnrow">'+btn('新歓を選ぶ','back-lunch','','')+'</div>';
  };
  const venue=()=>{
    const e=emap[S.eventId], groups=D.groups.filter(g=>g.event_id===e.event_id);
    const cards=groups.map(g=>{
      const ms=D.members.filter(m=>m.group_id===g.group_id);
      const faces=ms.map(m=>'<div class="face-slot">'+photo(m.person_id,{venue:true})+'</div>').join('');
      const visited=S.visitedGroups.includes(g.group_id);
      return '<article class="card"><p class="eyebrow">'+esc(g.group_title)+'</p><h3>'+esc(g.location.split('／').at(-1))+'</h3><div class="chips"><span class="chip">'+ms.length+'人</span><span class="chip dim">'+esc(g.tone)+'</span></div><div class="faces" aria-label="会場にいる人の顔">'+faces+'</div><p class="subtle">'+esc(g.activity)+'</p>'+(visited?btn('会話を読み返す','reopen-group','data-gid="'+esc(g.group_id)+'"','ghost'):S.visitedGroups.length>=2?'<span class="chip dim">今日はここまで</span>':btn('この輪に加わる','join-group','data-gid="'+esc(g.group_id)+'"',''))+'</article>';
    }).join('');
    return '<p class="eyebrow">'+esc(ORG[e.org_id])+' / '+esc(e.start)+'–'+esc(e.end)+'</p><h2>'+esc(e.title)+'</h2><p class="subtle">会場に入ると全員の顔が見えます。名前は、本人が名乗るか別の資料で確認するまで分かりません。顔だけの記憶は手帳へ残ります。</p><p class="score">交流 '+S.visitedGroups.length+' / 2 組</p><div class="grid2">'+cards+'</div><div class="btnrow">'+btn('会場を出て夜へ','finish-venue','','')+'</div>';
  };
  const group=()=>{
    const g=gmap[S.activeGroup], e=emap[g.event_id], ms=D.members.filter(m=>m.group_id===g.group_id);
    const lines=D.lines.filter(l=>l.group_id===g.group_id).sort((a,b)=>Number(a.order)-Number(b.order));
    const convo=lines.map((l,i)=>'<div class="line"><span class="who">'+esc(i===0?pmap[l.speaker_id].name:knownName(l.speaker_id))+'</span>'+esc(l.text)+'</div>').join('');
    const done=!!S.groupActions[g.group_id];
    return '<p class="eyebrow">'+esc(ORG[e.org_id])+' / '+esc(g.group_title)+'</p><h2>輪に入る</h2><p class="subtle">'+esc(g.activity)+'</p><div class="faces">'+ms.map(m=>'<div class="face-slot">'+photo(m.person_id,{venue:true})+'<div>'+esc(knownName(m.person_id))+'</div></div>').join('')+'</div>'+ (S.reunionText?note(esc(S.reunionText)):'')+'<div class="card">'+convo+'</div><div class="action-panel"><h3>追加行動を一つ選ぶ</h3>'+ (done?'<p>'+esc(S.groupResult)+'</p>': '<p class="subtle">「話を聞く」「質問する」「連絡先を交換する」は、それぞれ違う情報を残します。</p><div class="grid3">'+btn('話を聞く','listen','','')+btn('質問する','ask-menu','','secondary')+btn('連絡先を交換','contact-menu','','secondary')+'</div>')+'</div><div class="btnrow">'+btn('会場の他の輪へ戻る','back-venue','','ghost')+'</div>';
  };
  const choiceMenu=(type)=>{
    const gid=S.activeGroup, g=gmap[gid];
    const candidates=type==='question'?D.questions.filter(q=>q.group_id===gid).map(q=>q.target_id):D.members.filter(m=>m.group_id===gid).map(m=>m.person_id);
    const action=type==='question'?'ask-person':'contact-person';
    return '<p class="eyebrow">'+esc(g.group_title)+'</p><h2>'+(type==='question'?'誰に、何を聞く？':'誰に交換を頼む？')+'</h2><p class="subtle">この追加行動を選ぶと、同じ輪ではほかの追加行動を選べません。</p><div class="person-list">'+candidates.map(pid=>'<div class="person-card">'+photo(pid,{venue:true})+'<div><div class="name">'+esc(knownName(pid))+'</div><div class="small">'+esc(publicAppearance(pid))+'</div>'+(type==='question'?'<p class="subtle">'+esc(D.questions.find(q=>q.group_id===gid&&q.target_id===pid)?.question||'質問する')+'</p>'+btn('この質問をする',action,'data-pid="'+pid+'"','tiny'):['TINE','Photogram'].filter(platform=>!!amap[pid+'|'+platform]).map(platform=>btn(platform+'を頼む',action,'data-pid="'+pid+'" data-platform="'+platform+'"','tiny')).join(' '))+'</div></div>').join('')+'</div><div class="btnrow">'+btn('会話に戻る','back-group','','ghost')+'</div>';
  };

  // TINEで交換した知り合いから届く、ゲーム内の日常連絡。推理の証拠は解除しない。
  const TINE_LINES={
    L:['見学で聴くだけでも歓迎だよ。合いそうな場所を探してね。','演奏したい曲が決まらなくても大丈夫。気軽に相談して。','人が多かったね。無理に全部覚えなくてもいいからね。'],
    Z:['まだ完成していない曲も、誰かが音を重ねると変わるね。','次の練習は音量を合わせるところから。見学だけでもどうぞ。','好きなフレーズがあったら、次に聴かせて。'],
    J:['即興は間違えても曲が止まらないのがいいところだよ。','楽器が違ってもセッションに混ざれるよ。','今日は何か新しい音楽に出会えた？'],
    K:['急いで決める必要はないよ。見学だけでも気にしないで。','小さな部屋でも、音を出すと雰囲気が変わるね。','また演奏したくなったら、声をかけてね。'],
    W:['完成していない音源でも、聴き合うだけなら歓迎だよ。','公開する前に、誰に聴かせるか決めるのも大事だね。','音作りの相談なら、短いメモだけでも送ってね。'],
    F:['機材の扱いは細かく確認するけど、見学は自由だよ。','知らない曲でも、ライブで聴くと印象が変わるよ。','次に音を出すときは、耳を守る準備も忘れずに。'],
    N:['今週は新しい顔をたくさん見たね。','どこの新歓が気になった？','またどこかで会えたら話そう。']
  };
  const tineMessages=()=>{
    const ids=Object.entries(S.person).filter(([id,p])=>p.met&&p.introduced&&Array.isArray(p.contacts)&&p.contacts.includes('TINE')&&amap[id+'|TINE']).map(([id])=>id);
    if(!ids.length)return [];
    const start=S.day%ids.length;
    return Array.from({length:Math.min(2,ids.length)},(_,i)=>{
      const pid=ids[(start+i)%ids.length];
      const lines=TINE_LINES[pmap[pid].primary_org]||TINE_LINES.N;
      return {pid,text:lines[S.day%lines.length]};
    });
  };
  const tineFeed=()=>{
    const messages=tineMessages();
    if(!messages.length)return '';
    const replied=S.replyLog?.[currentDate()];
    const rows=messages.map(({pid,text:body})=>
      '<div class="document"><strong>'+esc(knownName(pid))+' / TINE</strong><p>'+esc(body)+'</p>'+
      (replied===pid?'<span class="chip">返信済み</span>':replied?'':
        btn('短く返信する','reply-contact','data-pid="'+esc(pid)+'"','tiny'))+'</div>'
    ).join('');
    return '<div class="card soft"><h3>知り合いからの連絡</h3><p class="subtle">連絡先を交換した人との日常のやり取り。返信は今夜一人まで、調査回数には含まれません。</p>'+rows+'</div>';
  };
  const researchItems=()=>{
    const day=S.day;
    const specs=[
      ['c1','限定案内の版を調べる','月曜以降',day>=0],
      ['c2','非公開デモの版メモを調べる','火曜以降',day>=1],
      ['legacy','昔の匿名文と新着文を比較','火曜以降',day>=1],
      ['c3','備品準備の公開控えを調べる','木曜以降',day>=3],
      ['bridge','金曜の匿名追伸を保全','金曜20:30以降',day>=4]
    ];
    return specs.filter(x=>x[3]).map(([id,label,when])=>{
      const done=id==='legacy'?S.oldNew:id==='bridge'?S.bridge:!!S.evidence[id.toUpperCase()];
      return '<div class="document"><strong>'+esc(label)+'</strong><span class="subtle">'+esc(when)+' / '+(done?'取得済み：再読無料':'新規調査：1回')+'</span><div class="btnrow">'+btn(done?'読み返す':'調査する','research','data-key="'+id+'"',done?'ghost':'secondary')+'</div></div>';
    }).join('');
  };
  const night=()=>{
    const date=currentDate();
    return '<p class="eyebrow">EVENING / '+esc(date)+'</p><h2>夜の時間</h2><p class="lead">今日は誰と話しただろう。調査は残り '+(3-nightCount())+' 回。調べずに眠ることもできる。</p>'+tineFeed()+'<div class="progress"><span style="width:'+(nightCount()/3*100)+'%"></span></div>'+(S.nightMessage?note(esc(S.nightMessage)):'')+'<h3>手がかりを探す</h3>'+researchItems()+'<h3>SNSを読む</h3><div class="grid3">'+['TINE','Photogram','Zitter'].map(p=>btn(p,platformNeedsAction(p)?'browse-sns':'open-sns','data-platform="'+p+'"',platformNeedsAction(p)?'secondary':'ghost')).join('')+'</div><p class="subtle">新しい投稿の確認は1回。既読投稿の再読は無料。鍵投稿は承認条件を満たさなければ開きません。</p><div class="btnrow">'+btn(S.day===4?'合宿の選択へ':'翌日へ','end-night','','')+'</div>';
  };
  const sns=()=>{
    const platform=S.platform, date=currentDate();
    const posts=D.posts.filter(p=>p.platform===platform&&p.published_at.slice(0,10)<=date);
    const rows=posts.map(p=>{
      const acct=amap[p.author_id+'|'+platform];
      const open=postAccessible(p)&&S.viewedPosts.includes(p.post_id);
      const label=acct?.display_name||'未確認のアカウント';
      const media=p.media_id?'<p class="subtle">写真資料 '+esc(p.media_id)+'：顔画像は別Workから未受領</p>':'';
      const avatar=platform==='Zitter'&&p.visibility==='匿名表示'?'<span class="face"><span class="silhouette" aria-hidden="true">◇</span></span>':photo(p.author_id,{venue:true});
      return '<article class="post'+(open?'':' locked')+'"><div class="post-head">'+avatar+'<div><div class="meta">'+esc(platform)+' / '+esc(p.published_at)+' / '+esc(p.visibility)+'</div><strong>'+esc(label)+'</strong></div></div><p>'+esc(open?p.text:postAccessible(p)?'この投稿の本文はまだ読んでいません。':'閲覧には本人の承認または参加条件が必要です。')+'</p>'+(open?media:'')+'</article>';
    }).join('');
    const alt=D.publicInfo.map(x=>'<div class="document"><strong>'+esc(x.topic)+'</strong>'+esc(x.confirms)+'<p class="subtle">別経路：'+esc(x.route_1)+'／'+esc(x.route_2)+'</p></div>').join('');
    return '<p class="eyebrow">SOCIAL / '+esc(platform)+'</p><h2>今夜のタイムライン</h2>'+(platform==='TINE'?tineFeed():'')+'<div class="tabs">'+['TINE','Photogram','Zitter'].map(p=>btn(p,platformNeedsAction(p)?'browse-sns':'sns-tab','data-platform="'+p+'"',p===platform?'':'ghost')).join('')+'</div>'+(rows||'<p class="subtle">今夜までの投稿はありません。</p>')+'<h3>鍵投稿を使わず確認できる案内</h3>'+alt+'<div class="btnrow">'+btn('夜の行動に戻る','back-night','','ghost')+'</div>';
  };
  const board=()=>{
    const rows=D.factExposures.filter(x=>x.fact_id!=='F-COM-02'&&x.available_at.slice(0,10)<=currentDate());
    return '<p class="eyebrow">CAMPUS BOARD</p><h2>学内の公開掲示</h2><p class="subtle">掲載の事実だけを読めます。鍵アカウントの投稿本文を開くものではありません。</p>'+(S.boardMessage?note(esc(S.boardMessage)):'')+rows.map(x=>{
      const fact=D.facts.find(f=>f.fact_id===x.fact_id);
      const read=S.discoveredFacts.includes(x.fact_id);
      return '<div class="document"><strong>'+esc(pmap[fact.person_id].name)+'に関する掲示</strong><p>'+esc(read?x.presented_text:'公開掲示を確認できます。')+'</p>'+btn(read?'再読する':'掲示を読む','read-board','data-fid="'+esc(x.fact_id)+'"',read?'ghost':'secondary')+'</div>';
    }).join('')+'<div class="btnrow">'+btn('イベント選択へ戻る','back-board','','ghost')+'</div>';
  };
  const camp=()=>'<p class="eyebrow">FRIDAY / 21:00</p><h2>週末の行き先を選ぶ</h2><p class="lead">有志主催の合同新歓体験合宿。どの班にも音楽の時間がある。参加せず、学内で過ごしてもよい。</p>'+note('金曜20:30の匿名追伸が届いている。読んでいなくても、後から保全資料で確認できます。')+'<div class="grid2">'+CAMP.map(c=>'<div class="card"><h3>'+esc(c)+'</h3><p>'+esc(CAMP_STORY[c])+'</p>'+btn(c==='辞退'?'参加せず過ごす':'この班に参加','choose-camp','data-choice="'+esc(c)+'"','')+'</div>').join('')+'</div>';
  const saturday=()=>{
    const risky=S.campChoice!=='辞退';
    return '<p class="eyebrow">SATURDAY / '+esc(S.campChoice)+'</p><h2>選んだ場所の音</h2><div class="card"><p class="lead">'+esc(CAMP_STORY[S.campChoice])+'</p></div>'+(risky?'<p class="subtle">合同合宿の共用棟に、希望者向けの個別練習案内が出ている。担当者の名前は書かれていない。</p>':'')+(S.safety?note('同行・居場所の共有を済ませた。必要なときは相談できる。'):note('いつでも無料で、同行や居場所の共有を頼めます。'))+'<div class="btnrow">'+(!S.safety?btn('同行・居場所を共有する','share-safety','','secondary'):'')+(risky?btn('共用棟の個別練習に立ち寄る','accept-risk','','secondary'):'')+btn(risky?'個別練習には行かず日曜へ':'日曜へ進む','go-sunday','','')+'</div>';
  };
  const risk=()=>'<p class="eyebrow">SATURDAY / EVENING</p><h2>扉の向こう</h2><div class="card warn"><p>共用棟の奥で個別練習が始まる。帰る時刻を伝えると、案内役の先輩が「もう少しだけ」と出口の前に立った。</p></div><p>緊急連絡は調査回数を使いません。</p>'+(S.safety?note('事前に居場所を共有していた同行者が、約束の時刻に迎えに来た。'):note('連絡できる相手はいる。今、どうする？',true))+'<div class="btnrow">'+(S.safety?btn('同行者と会場を離れる','rescue','',''):btn('連絡して助けを求める','rescue','','')+btn('連絡しない','danger-end','','danger'))+'</div>';
  const evidenceCards=()=>['C1','C2','C3'].map(k=>{
    const x=evid[k],st=S.evidence[k]||'unseen',txt=st==='full'?x.full_fact:st==='pre'?x.preliminary_fact:'まだ調べていない。';
    return '<div class="document"><strong>'+esc(x.source_system)+'</strong><span class="chip '+(st==='full'?'':'dim')+'">'+esc(st==='full'?'署名付き保全写し':st==='pre'?'予備情報':'未取得')+'</span><p>'+esc(txt)+'</p>'+(st==='full'?'<p class="subtle">操作ハッシュ '+esc(receipts[k].operation_hash)+' ／ 署名付き匿名照合子 '+esc(S.alias)+'。所有者は非表示。</p>':'')+'</div>';
  }).join('');
  const sunday=()=>'<p class="eyebrow">SUNDAY / 4月12日</p><h2>相談と照合</h2><p class="lead">大学の週末安全窓口は、現地でも遠隔でも使える。安全相談と証拠の保全は別々に進められる。</p>'+(S.deductionMessage?note(esc(S.deductionMessage),!S.inference):'')+'<div class="btnrow">'+btn(S.safety?'安全相談済み':'安全窓口に相談する','safety','','secondary')+btn('署名付き写しを保全する','preserve','','secondary')+btn('旧文と追伸を照合する','sunday-continuity','','secondary')+'</div><h3>三つの操作</h3>'+evidenceCards()+'<div class="btnrow">'+btn('推理を組み立てる','deduce','','')+btn('犯人は保留して安全に距離を置く','safe-end','','secondary')+btn('今は結論を出さない','unresolved-end','','ghost')+'</div>'+(S.inference?'<div class="card soft"><h3>週明けの正規確認へ</h3><p>日曜の推理を、本人認証・端末・旧鍵の記録を調べられる担当者へ提出する。安全相談も同時に行う。</p>'+btn('正規確認を依頼する','official-review','','')+'</div>':'');
  const deduction=()=>{
    const full=['C1','C2','C3'].every(k=>S.evidence[k]==='full');
    return '<p class="eyebrow">SUNDAY / INFERENCE</p><h2>どこまで言えるだろう</h2><p class="subtle">アクセスの共通者、同じ認証アカウント、過去との継続性は別々に判断する。日曜の推理だけで人物の実行を確定しない。</p>'+(!full?note('三系統の署名付き保全写しがそろっていません。日曜窓口で取得できます。',true):'')+'<div class="card"><div class="form-row"><label for="candidate">三つのアクセス権限の共通候補</label><select id="candidate"><option value="">選択する</option>'+['P001','P002','P003','P004'].map(id=>'<option value="'+id+'">'+esc(pmap[id].name)+'</option>').join('')+'</select></div><div class="form-row"><label for="accountLogic">三つの操作について確かめること</label><select id="accountLogic"><option value="">選択する</option><option value="project">企画番号が同じなら同一人物</option><option value="signed">異なる操作ハッシュと署名付き照合子から同じ認証アカウントを確認</option><option value="person">照合子が同じなら、手を動かした人物も確定</option></select></div><div class="form-row"><label for="legacyLogic">高校時代との関係</label><select id="legacyLogic"><option value="">選択する</option><option value="style">文体が似ていれば確定</option><option value="independent">旧新の鍵指紋と未公表情報で継続性を支持し、漏洩も検討</option><option value="cohort">アクセス権限の交差だけで過去も証明</option></select></div><div class="form-row"><label for="counterLogic">残る反論への対応</label><select id="counterLogic"><option value="">選択する</option><option value="accuse">その場で犯人を断定する</option><option value="official">盗用・共用・資料漏洩を週明けの正規確認へ渡す</option></select></div>'+btn('日曜の推理を提出','submit-deduction','','')+'</div><div class="btnrow">'+btn('窓口に戻る','back-sunday','','ghost')+'</div>';
  };
  const dossier=()=>{
    const pre=['C1','C2','C3'].filter(k=>S.evidence[k]).length, full=['C1','C2','C3'].filter(k=>S.evidence[k]==='full').length;
    return '<p class="eyebrow">ARCHIVE</p><h2>保全した資料</h2><p class="subtle">予備情報と署名付き原本の写しは区別します。認証アカウントが同じでも、操作した身体や過去の行為まで直ちに確定しません。</p><p class="score">予備以上 '+pre+'/3 ／ 署名付き '+full+'/3</p>'+evidenceCards()+'<div class="document"><strong>旧匿名文と新着文</strong>'+esc(S.oldNew?'署名鍵指紋と未公表の待ち伏せ情報が一致。ただし漏洩の余地は残る。':'まだ照合していない。')+'</div><div class="document"><strong>金曜の匿名追伸</strong>'+esc(S.bridge?'三つの異なる操作ハッシュを知っていた。転送や共犯の余地は残る。':S.bridgeAvailable?'届いているが未照合。':'まだ届いていない。')+'</div><div class="btnrow">'+btn('戻る','back-overlay','','ghost')+'</div>';
  };
  const notebook=()=>{
    const filter=S.notebookFilter;
    let ids=Object.keys(S.person).filter(id=>{
      const p=ps(id);
      if(filter==='met')return p.met;
      if(filter==='marked')return p.bookmark||D.marks.some(m=>m.person_id===id&&S.discoveredFacts.includes(m.trigger_fact_id));
      return p.seen||p.nameKnownFromDoc;
    }).sort();
    const cards=ids.map(id=>{
      const p=ps(id),auto=D.marks.some(m=>m.person_id===id&&S.discoveredFacts.includes(m.trigger_fact_id));
      return '<div class="person-card">'+photo(id)+'<div><div class="name">'+esc(knownName(id))+' '+(auto?'<span class="chip alert">?</span>':'')+(p.bookmark?'<span class="chip">★</span>':'')+'</div><div class="small">'+(p.met?'会話済み':p.seen?'顔だけ見た':'資料で名前を知った')+(p.identity_confirmed?' ／ 照合済み':'')+'</div>'+btn('手帳を開く','open-person','data-pid="'+id+'"','tiny')+'</div></div>';
    }).join('');
    return '<p class="eyebrow">NOTEBOOK</p><h2>人物手帳</h2><p class="subtle">見かけただけの顔は曖昧な記憶としてぼかします。名前を聞いたことと、顔・名前・SNSの照合は別です。</p><div class="tabs">'+[['seen','見かけた人'],['met','知り合った人'],['marked','注目人物']].map(([k,v])=>btn(v,'filter-notebook','data-filter="'+k+'"',k===filter?'':'ghost')).join('')+'</div><div class="person-list">'+(cards||'<p class="subtle">該当する人物はいません。</p>')+'</div><div class="btnrow">'+btn('元の画面へ','back-overlay','','ghost')+'</div>';
  };
  const personDetail=()=>{
    const id=S.selectedPerson,p=ps(id),base=pmap[id];
    const autoFacts=D.marks.filter(m=>m.person_id===id&&S.discoveredFacts.includes(m.trigger_fact_id)).map(m=>D.facts.find(f=>f.fact_id===m.trigger_fact_id));
    const reason=autoFacts.length?autoFacts.map(f=>'<div class="notice"><strong>？の理由：</strong>'+esc(f.ambiguous_fact)+'<br><span class="subtle">通常の読み方：'+esc(f.ordinary_reading)+'</span></div>').join(''):'<p class="subtle">自動「？」の理由はありません。</p>';
    const st=['見かけた','会話した','名前を聞いた','交換を依頼','連絡先交換','顔・氏名・SNSを照合'].map((x,i)=>'<span class="chip '+([p.seen,p.met,p.introduced,p.contact_requested,p.contact_exchanged,p.identity_confirmed][i]?'':'dim')+'">'+x+'</span>').join('');
    return '<p class="eyebrow">NOTEBOOK / PERSON</p><h2>'+esc(knownName(id))+'</h2><div class="card"><div style="display:flex;gap:14px;align-items:center">'+photo(id,{large:true})+'<div><div class="chips">'+st+'</div><p class="subtle">'+esc(p.seen?base.appearance:'顔はまだ見ていない')+'</p></div></div>'+reason+'<div class="btnrow">'+btn(p.bookmark?'★を外す':'★を付ける','bookmark','data-pid="'+id+'"','secondary')+(p.introduced&&p.contact_exchanged&&!p.identity_confirmed?btn('顔・氏名・SNSを照合','confirm-identity','data-pid="'+id+'"','secondary'):'')+'</div><div class="form-row"><label for="hypothesis">仮説（事実とは別）</label><select id="hypothesis"><option>未設定</option><option>気になる</option><option>協力を頼める</option><option>保留</option></select></div><div class="form-row"><label for="personNote">自由メモ</label><textarea id="personNote" maxlength="2000" placeholder="覚えておきたいこと">'+esc(p.note)+'</textarea></div>'+btn('メモを保存','save-person','data-pid="'+id+'"','')+'</div><div class="btnrow">'+btn('人物一覧へ','back-notebook','','ghost')+'</div>';
  };
  const weekReflection=()=>{
    const visited=Array.isArray(S.eventHistory)?S.eventHistory:[];
    const orgIds=visited.map(eid=>emap[eid]?.org_id).filter(Boolean);
    const counts={};orgIds.forEach(id=>{counts[id]=(counts[id]||0)+1});
    const repeated=Object.keys(counts).filter(id=>counts[id]>1).map(id=>ORG[id]);
    let activity;
    if(!visited.length)activity='今週、新歓には参加しなかった。自分のペースで、新しい生活を始める。';
    else if(repeated.length)activity='何度か足を運んだ'+repeated.join('と')+'の新歓。そこで聴いた音や、見かけた顔を覚えている。';
    else activity='この一週間、'+[...new Set(orgIds.map(id=>ORG[id]))].join('、')+'の新歓を訪れた。';
    const metPeers=['P013','P014','P015','P016'].filter(id=>S.person[id]?.met);
    const repliedIds=[...new Set(Object.values(S.replyLog||{}))].filter(id=>S.person[id]?.introduced);
    const social=repliedIds.length?'TINEで'+repliedIds.slice(0,2).map(id=>pmap[id].name).join('や')+'に返信した日もあった。':metPeers.length?'同期と話した時間も、大学生活の一部になった。':'まだ名前の分からない顔も、いくつか記憶に残った。';
    const weekend=S.campChoice==='辞退'?'合宿への参加は見送った。':S.campChoice?'週末は'+S.campChoice+'の班を選んだ。':'';
    return [activity,social,weekend].filter(Boolean).join(' ');
  };
  const ending=()=>{
    const texts={
      'A-TRUE-SAFE':['音を選び直す','日曜の資料から紬が最有力となった。週明け、権限ある担当者が認証端末、委任・復旧履歴、旧匿名鍵の移転と送信記録を照合し、盗用や伝聞の反論を退けた。真相は西園寺紬だった。','2027年4月。支援と接触制限の中で、あなたは自分で選んだ場所で再び演奏する。'],
      'A-TRUE-RISK':['帰るための音','個別練習の場から助けを求めた。日曜の保全と週明けの正規確認で、紬の行為が裏付けられた。','2027年4月。回復を急ぐ必要はない。あなたのペースで、もう一度音を出す。'],
      'A-SAFE-UNSOLVED':['答えを急がない','相手を断定できなくても、安全窓口に相談し、同行と記録の保全を選べた。調査は続く。','2027年4月。真相が保留でも、安心できる人との演奏は続いている。'],
      'A-UNRESOLVED':['今週はここまで','音を楽しむ一週間を過ごした。気になる記録は残るが、今は結論を出さない。','2027年4月。必要になれば資料を持って相談できる。'],
      'A-DANGER':['途切れた帰り道','個別練習の場所で退室を妨げられた。画面はここで暗転する。','ここから再挑戦できる。次は同行や緊急連絡を選んでよい。']
    };
    const [head,body,epi]=texts[S.ending];
    const hints=(S.ending==='A-UNRESOLVED'||S.ending==='A-SAFE-UNSOLVED'||S.ending==='A-DANGER')?'<div class="card soft"><h3>任意の段階的ヒント</h3><p class="subtle">ヒントを使ってもペナルティはありません。</p>'+[
      '案内・音源・備品を別々の資料として扱おう。親切さや噂は証明ではない。',
      '三つの作業者照合子と異なる操作ハッシュを比べよう。旧匿名文は別の線で確認する。',
      'C1・C2・C3の共通者は紬。ただし日曜は最有力にとどまる。週明けの認証と旧鍵の確認が必要。'
    ].slice(0,S.hintsOpen).map((h,i)=>'<p><strong>ヒント '+(i+1)+'</strong> '+esc(h)+'</p>').join('')+(S.hintsOpen<3?btn('次のヒントを見る','hint','','secondary'):'')+'</div>':'';
    return '<p class="eyebrow">ENDING / CASE A</p><h2>'+esc(head)+'</h2><div class="card"><p class="lead">'+esc(body)+'</p><hr class="divider"><p>'+esc(epi)+'</p></div>'+(S.ending==='A-DANGER'?'':'<div class="card soft"><h3>この一週間の記憶</h3><p>'+esc(weekReflection())+'</p></div>')+hints+'<div class="btnrow">'+btn('最初から遊ぶ','replay','','')+btn('人物手帳を読む','notebook','','ghost')+'</div>';
  };
  function render(){
    let content;
    switch(S.phase){
      case 'title':content=title();break; case 'warning':content=warning();break;case 'intro':content=intro();break;
      case 'day':content=day();break;case 'lunch':content=lunch();break;case 'venue':content=venue();break;case 'group':content=group();break;
      case 'question':content=choiceMenu('question');break;case 'contact':content=choiceMenu('contact');break;
      case 'night':content=night();break;case 'sns':content=sns();break;case 'board':content=board();break;case 'camp':content=camp();break;
      case 'saturday':content=saturday();break;case 'risk':content=risk();break;case 'sunday':content=sunday();break;
      case 'deduction':content=deduction();break;case 'dossier':content=dossier();break;
      case 'notebook':content=notebook();break;case 'person':content=personDetail();break;case 'ending':content=ending();break;
      default:content=title();
    }
    APP.innerHTML='<div class="shell">'+header()+'<div class="layout"><main>'+content+'</main>'+side()+'</div></div>';
    if(S.phase==='person'){const h=document.getElementById('hypothesis');if(h)h.value=ps(S.selectedPerson).hypothesis}
    window.scrollTo({top:0,behavior:'instant'});
  }
  const discoverFact=id=>{
    if(S.discoveredFacts.includes(id))return;
    S.discoveredFacts.push(id);
    const fact=D.facts.find(f=>f.fact_id===id);
    if(fact)ps(fact.person_id).nameKnownFromDoc=true;
  };
  const signedThreeSources=()=>{
    const rs=['C1','C2','C3'].map(k=>receipts[k]);
    return rs.every(r=>r.signature_verified==='yes'&&S.evidence[r.cohort_id]==='full'&&r.owner_visible_to_student==='no')
      && new Set(rs.map(r=>r.operation_hash)).size===3
      && new Set(rs.map(r=>r.source_system)).size===3;
  };
  const addNightAction=(key,fn)=>{
    const date=currentDate();
    if(S.nightDone[date+'|'+key]){fn(false);saveAndRender();return}
    if(nightCount()>=3){S.nightMessage='今夜の能動的調査は3回までです。取得済み資料の再読は無料です。';saveAndRender();return}
    S.nightUsed[date]=nightCount()+1;S.nightDone[date+'|'+key]=true;fn(true);saveAndRender();
  };
  const research=(key)=>{
    if(key==='legacy'&&S.oldNew||key==='bridge'&&S.bridge||['c1','c2','c3'].includes(key)&&S.evidence[key.toUpperCase()]){
      S.nightMessage=key==='legacy'?'旧新の鍵指紋と未公表情報が一致。ただし漏洩は未排除。':key==='bridge'?'匿名追伸には三操作の固有ハッシュがある。ただし転送は未排除。':evid[key.toUpperCase()].preliminary_fact;
      saveAndRender();return;
    }
    const min={c1:0,c2:1,legacy:1,c3:3,bridge:4}[key];
    if(S.day<min)return;
    addNightAction(key,()=>{
      if(key==='legacy'){S.oldNew=true;S.nightMessage='保存していた旧匿名文と新着文の鍵指紋、未公表情報が一致する。ただし漏洩の可能性は残る。'}
      else if(key==='bridge'){S.bridge=true;S.nightMessage='匿名追伸には別々の操作ハッシュ '+['C1','C2','C3'].map(k=>receipts[k].operation_hash).join('／')+' があった。転送や共犯はまだ除外できない。'}
      else{S.evidence[key.toUpperCase()]='pre';S.nightMessage=evid[key.toUpperCase()].preliminary_fact}
    });
  };
  const finish=(id)=>{S.ending=id;S.phase='ending';S.hintsOpen=0;if(id.startsWith('A-TRUE')){let meta=getMeta();meta.caseAUnlocked=true;localStorage.setItem(META_KEY,JSON.stringify(meta))}saveAndRender()};
  function handle(act,el){
    const id=el.dataset.pid,gid=el.dataset.gid,date=currentDate();
    if(act==='start'||act==='replay'){S=makeState();S.phase='warning';saveAndRender();return}
    if(act==='title'){S.phase='title';saveAndRender();return}
    if(act==='intro'){S.phase='intro';saveAndRender();return}
    if(act==='begin'){S.phase='day';saveAndRender();return}
    if(act==='lunch'){
      const date=currentDate();
      if(!S.lunchSeenDates.includes(date)){
        S.lunchPreState[date]={};
        D.recurring.filter(x=>x.date===date).forEach(x=>{const p=ps(x.person_id);S.lunchPreState[date][x.person_id]={seen:p.seen,met:p.met};p.seen=true});
        S.lunchSeenDates.push(date);
      }
      S.lunchMessage='';S.phase='lunch';saveAndRender();return;
    }
    if(act==='lunch-talk'){
      const date=currentDate(),talked=(S.lunchTalked[date]??=[]),x=D.recurring.find(x=>x.date===date&&x.person_id===id);
      if(!x||talked.includes(id)||talked.length>=2)return;
      const prior=S.lunchPreState[date]?.[id]||{seen:false,met:false};
      const p=ps(id);p.seen=true;p.met=true;p.introduced=true;p.clearPortrait=true;
      S.lunchMessage=prior.met?x.reunion_line:prior.seen?x.seen_only_line+' '+pmap[id].name+'です。'+x.new_contact_line:pmap[id].name+'です。'+x.new_contact_line;
      talked.push(id);saveAndRender();return;
    }
    if(act==='back-lunch'){S.lunchMessage='';S.phase='day';saveAndRender();return}
    if(act==='save'){localStorage.setItem(SAVE_KEY,JSON.stringify(S));alert('この端末に保存しました。');return}
    if(act==='load'){try{const x=JSON.parse(localStorage.getItem(SAVE_KEY)||localStorage.getItem(AUTO_KEY));if(x?.schema===3&&x.caseId==='A'){S=x;render()}else alert('この版で読み込める保存データがありません。')}catch{alert('保存データを読み込めませんでした。')}return}
    if(act==='notebook'||act==='dossier'){if(S.phase!=='notebook'&&S.phase!=='person'&&S.phase!=='dossier')S.returnPhase=S.phase;S.phase=act;saveAndRender();return}
    if(act==='back-overlay'){S.phase=S.returnPhase||'day';S.returnPhase=null;saveAndRender();return}
    if(act==='event'){
      S.eventId=el.dataset.eid;
      if(!Array.isArray(S.eventHistory))S.eventHistory=[];
      S.eventHistory.push(S.eventId);
      S.visitedGroups=[];S.groupActions={};S.groupReunions={};S.preEventState={};
      D.members.filter(m=>m.event_id===S.eventId).forEach(m=>{const x=ps(m.person_id);S.preEventState[m.person_id]={seen:x.seen,met:x.met,contact:x.contact_exchanged};x.seen=true});
      S.phase='venue';saveAndRender();return;
    }
    if(act==='board'){S.boardMessage='';S.phase='board';saveAndRender();return}
    if(act==='read-board'){
      const fid=el.dataset.fid,ex=D.factExposures.find(x=>x.fact_id===fid);
      if(ex){discoverFact(fid);S.boardMessage=ex.presented_text}
      saveAndRender();return;
    }
    if(act==='back-board'){S.phase='day';saveAndRender();return}
    if(act==='skip-day'){S.eventId=null;S.phase='night';saveAndRender();return}
    if(act==='join-group'||act==='reopen-group'){
      if(act==='join-group'&&S.visitedGroups.length>=2)return;
      if(act==='join-group'){
        const ms=D.members.filter(m=>m.group_id===gid);
        const prior=ms.map(m=>({pid:m.person_id,...(S.preEventState[m.person_id]||{seen:false,met:false,contact:false})}));
        const again=prior.find(x=>x.contact)||prior.find(x=>x.met)||prior.find(x=>x.seen);
        const condition=again?.contact?'contact_exchanged_before_this_event':again?.met?'met_before_this_event':again?.seen?'seen_only_before_this_event':'';
        S.reunionText=condition?D.reunions.find(r=>r.group_id===gid&&r.person_id===again.pid&&r.condition===condition)?.line||'':'';
        ms.forEach(m=>{ps(m.person_id).seen=true;ps(m.person_id).met=true;ps(m.person_id).clearPortrait=true});
        const first=D.lines.find(l=>l.group_id===gid&&l.introduced_effect==='speaker_self_intro');
        if(first)ps(first.speaker_id).introduced=true;
        S.groupReunions??={};S.groupReunions[gid]=S.reunionText;
        S.visitedGroups.push(gid);S.groupResult='';
      }else{
        S.reunionText=S.groupReunions?.[gid]||'';
      }
      S.activeGroup=gid;S.phase='group';saveAndRender();return;
    }
    if(act==='back-venue'){S.phase='venue';saveAndRender();return}
    if(act==='listen'){const a=D.actions.find(a=>a.group_id===S.activeGroup);S.groupActions[S.activeGroup]='listen';S.groupResult=a.listen_text;if(a.trigger_fact_id)discoverFact(a.trigger_fact_id);saveAndRender();return}
    if(act==='ask-menu'){S.phase='question';saveAndRender();return}
    if(act==='contact-menu'){S.phase='contact';saveAndRender();return}
    if(act==='back-group'){S.phase='group';saveAndRender();return}
    if(act==='ask-person'){
      const q=D.questions.find(q=>q.group_id===S.activeGroup&&q.target_id===id);if(!q)return;
      ps(id).introduced=true;S.groupActions[S.activeGroup]='question';S.groupResult=q.answer;
      S.phase='group';saveAndRender();return;
    }
    if(act==='contact-person'){
      const platform=el.dataset.platform||'TINE',a=amap[id+'|'+platform],p=ps(id);
      const policy=D.contactChannels.find(c=>c.group_id===S.activeGroup&&c.person_id===id&&c.platform===platform)?.approval_policy;
      if(!a||!policy){S.groupResult='この連絡手段では交換できない。';S.phase='group';saveAndRender();return}
      p.contact_requested=true;p.introduced=true;
      S.groupActions[S.activeGroup]='contact';
      const intro=pmap[id].name+'と名前を確かめた。';
      if(p.contacts.includes(platform)){
        S.groupResult=intro+'既に'+platform+'で連絡できる。';
      }else if(policy==='after_week'){
        S.groupResult=intro+' '+platform+'の交換は今週は保留になった。急がなくてもよさそうだ。';
      }else if(policy==='next_day'){
        p.contact_pending=true;
        if(!p.pendingContacts.includes(platform))p.pendingContacts.push(platform);
        S.groupResult=intro+' '+platform+'の交換を申請した。承認は翌日以降。';
      }else{
        if(!p.contacts.includes(platform))p.contacts.push(platform);
        p.contact_exchanged=true;p.clearPortrait=true;
        if(platform==='TINE'){S.contactSince??={};S.contactSince[id]=currentDate()}
        S.groupResult=intro+' '+platform+'の交換を了承してもらえた。表示名「'+a.display_name+'」を確認した。';
      }
      S.phase='group';saveAndRender();return;
    }
    if(act==='reply-contact'){
      S.replyLog??={};
      if(!S.replyLog[date]&&tineMessages().some(x=>x.pid===id))S.replyLog[date]=id;
      saveAndRender();return;
    }
    if(act==='finish-venue'){S.phase='night';saveAndRender();return}
    if(act==='research'){research(el.dataset.key);return}
    if(act==='browse-sns'||act==='open-sns'){
      const platform=el.dataset.platform, key=date+'|'+platform;
      if(act==='browse-sns'&&platformNeedsAction(platform)&&!S.nightDone[key]){
        if(nightCount()>=3){S.nightMessage='今夜の調査は3回までです。';saveAndRender();return}
        S.nightUsed[date]=nightCount()+1;S.nightDone[key]=true;
      }
      platformPosts(platform).filter(postAccessible).forEach(p=>{if(!S.viewedPosts.includes(p.post_id))S.viewedPosts.push(p.post_id)});
      S.platform=platform;S.phase='sns';saveAndRender();return;
    }
    if(act==='sns-tab'){S.platform=el.dataset.platform;saveAndRender();return}
    if(act==='back-night'){S.phase='night';saveAndRender();return}
    if(act==='end-night'){
      for(const [pid,p] of Object.entries(S.person)){
        ps(pid);
        const approved=p.pendingContacts.filter(platform=>D.contactChannels.some(c=>c.person_id===pid&&c.platform===platform&&c.approval_policy==='next_day'));
        approved.forEach(platform=>{if(!p.contacts.includes(platform))p.contacts.push(platform);if(platform==='TINE'){S.contactSince??={};S.contactSince[pid]=currentDate()}});
        p.pendingContacts=p.pendingContacts.filter(platform=>!approved.includes(platform));
        p.contact_pending=p.pendingContacts.length>0;
        p.contact_exchanged=p.contacts.length>0;
        if(approved.length)p.clearPortrait=p.seen||p.clearPortrait;
      }
      if(S.day===4){S.bridgeAvailable=true;S.phase='camp'}
      else{S.day++;S.eventId=null;S.nightMessage='';S.phase='day'}
      saveAndRender();return;
    }
    if(act==='choose-camp'){S.campChoice=el.dataset.choice;S.phase='saturday';saveAndRender();return}
    if(act==='share-safety'||act==='safety'){S.safety=true;saveAndRender();return}
    if(act==='accept-risk'){S.risky=true;S.phase='risk';saveAndRender();return}
    if(act==='rescue'){S.rescued=true;S.safety=true;S.phase='sunday';saveAndRender();return}
    if(act==='danger-end'){finish('A-DANGER');return}
    if(act==='go-sunday'){S.phase='sunday';saveAndRender();return}
    if(act==='preserve'){
      if(!S.sundayPreserved){
        const pre=['C1','C2','C3'].filter(k=>S.evidence[k]==='pre');
        const missing=['C1','C2','C3'].filter(k=>!S.evidence[k]);
        const eligible=pre.concat(pre.length>=2?missing.slice(0,1):[]);
        eligible.forEach(k=>S.evidence[k]='full');
        S.sundayPreserved=true;
        S.deductionMessage=eligible.length===3?'予備情報を手掛かりに、週末安全窓口が三つの別システムの署名付き写しを保全した。個人所有者の調査は週明け。':'週末窓口で照会できた写しを保全した。三系統をそろえるには、平日の予備情報がもう少し必要だった。安全相談は続けられる。';
      }else S.deductionMessage='保全済みの写しを再閲覧した。';
      saveAndRender();return;
    }
    if(act==='sunday-continuity'){S.oldNew=true;S.bridge=true;S.deductionMessage='旧文と新着文の鍵指紋・未公表情報、金曜追伸の三操作ハッシュを保全した。漏洩と共犯はまだ排除できない。';saveAndRender();return}
    if(act==='deduce'){S.phase='deduction';saveAndRender();return}
    if(act==='back-sunday'){S.phase='sunday';saveAndRender();return}
    if(act==='submit-deduction'){
      const c=document.getElementById('candidate')?.value;
      const a=document.getElementById('accountLogic')?.value;
      const l=document.getElementById('legacyLogic')?.value;
      const h=document.getElementById('counterLogic')?.value;
      const full=['C1','C2','C3'].every(k=>S.evidence[k]==='full');
      S.inference=!!(full&&signedThreeSources()&&S.oldNew&&S.bridge&&c==='P001'&&a==='signed'&&l==='independent'&&h==='official');
      S.deductionMessage=S.inference?'日曜の段階では紬が最有力。盗用、共犯、旧情報の漏洩を週明けの正規調査に渡す。':'まだ論証が足りない。安全相談はいつでも可能。資料を見直してから再提出できる。';
      S.phase='sunday';saveAndRender();return;
    }
    if(act==='safe-end'){S.safety=true;finish('A-SAFE-UNSOLVED');return}
    if(act==='unresolved-end'){finish(S.safety?'A-SAFE-UNSOLVED':'A-UNRESOLVED');return}
    if(act==='official-review'){S.safety=true;finish(S.inference?(S.risky?'A-TRUE-RISK':'A-TRUE-SAFE'):'A-SAFE-UNSOLVED');return}
    if(act==='hint'){S.hintsOpen=Math.min(3,S.hintsOpen+1);saveAndRender();return}
    if(act==='filter-notebook'){S.notebookFilter=el.dataset.filter;saveAndRender();return}
    if(act==='open-person'){S.selectedPerson=id;S.phase='person';saveAndRender();return}
    if(act==='back-notebook'){S.phase='notebook';saveAndRender();return}
    if(act==='bookmark'){ps(id).bookmark=!ps(id).bookmark;saveAndRender();return}
    if(act==='confirm-identity'){const p=ps(id);if(p.introduced&&p.contact_exchanged)p.identity_confirmed=true;saveAndRender();return}
    if(act==='save-person'){const p=ps(id);p.note=document.getElementById('personNote').value;p.hypothesis=document.getElementById('hypothesis').value;saveAndRender();return}
  }
  APP.addEventListener('click',ev=>{const el=ev.target.closest('[data-act]');if(el){ev.preventDefault();handle(el.dataset.act,el)}});
  render();
})();
