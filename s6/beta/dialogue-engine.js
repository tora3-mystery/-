(() => {
'use strict';
const D=window.S6_DATA,P=window.S6_BETA_PROFILES,Social=window.S6_BETA_SOCIAL,Story=window.S6_BETA_STORY;
const people=Object.fromEntries(D.people.map(x=>[x.person_id,x]));
const hooks=Object.fromEntries(D.socialProfiles.map(x=>[x.person_id,x]));
const events=Object.fromEntries(D.events.map(x=>[x.event_id,x]));
const orgNames=Object.fromEntries(D.orgs.map(x=>[x.org_id,x.common_name]));
const words={
 friendly:{host:'見学、どう？',newcomer:'自分も見学に来たんだ。',guest:'別の団体も気になっててね。',again:'あ、また会ったね。'},
 energetic:{host:'来てくれてありがとう！',newcomer:'同じ一年生？ よろしく！',guest:'こっちにも来てみたんだ！',again:'あ、また会えた！'},
 casual:{host:'気軽に聴いていって。',newcomer:'まだどこも決めてなくて。',guest:'こっちも覗いてるんだ。',again:'この前もいたよね。'},
 quiet:{host:'ゆっくり聴いていってね。',newcomer:'自分も初めてで。',guest:'今日はこっちの音を聴きに来た。',again:'あ、この前の。'},
 soft:{host:'来てくれてありがとう。',newcomer:'どこにするか悩むよね。',guest:'今日はこっちも気になって。',again:'また会えたね。'},
 precise:{host:'今日は見学の人も多いよ。',newcomer:'ほかも見てから決めようと思ってる。',guest:'今日は普段と違う団体を見学してる。',again:'前にも話したよね。'},
 reserved:{host:'よかったら、ゆっくり見ていって。',newcomer:'自分もまだ迷ってて。',guest:'今日は、こっちも気になって。',again:'この前はどうも。'}
};
const sceneContext={
 L:'カバー曲',Z:'オリジナル曲',J:'セッション',K:'弾き語り',W:'DTM',F:'学外ライブ'
};
const sceneCorrections={"E01-A|P003|1":"演奏する人と聴くだけの人、同じ入口でどう案内しようか？","E03-C|P027|2":"言葉を詰めると、伴奏の余白が消えるんだよね。","E04-A|P031|2":"音を外しても大丈夫。次の小節で戻る合図を出すね。","E04-B|P009|1":"次はギターから入る？　ドラムから入る？","E04-B|P032|2":"低い弦の音を先に出すから、上は自由に遊んで。","E08-D|P044|2":"片方が音を止めると、もう片方のフレーズがはっきり聴こえるね。","E11-A|P016|3":"先輩、さっき間違えたところ、次の小節は意外とうまく合いました。","E11-C|P035|2":"歌の返事を少し遅らせると、ドラムとの掛け合いが面白くなるね。"};
const listeningCorrections={"E04-B":"ギターの低い弦の音をドラムが追いかけ、次はドラムが先に拍を置く。交代してもテンポは崩れなかった。","E06-C":"ベースが二拍のカウントを取り、歌が重なる。最初は少しずれた入りが、二回目にはそろった。","E07-C":"ベースの短い合図に合わせて、歌声と電子音が一斉に入る。止まるタイミングまでぴたりと重なった。","E11-B":"ギターとサックスが目線を合わせ、フレーズの受け渡しをする。言葉がなくても次の入りが伝わった。","E11-C":"短いドラムのフレーズへ歌声が少し遅れて応える。返事を待つ間も、演奏の一部になっていた。","E12-C":"短いリハーサルを終えると、最後の音の余韻をみんなで確かめた。拍手は一呼吸遅れて起きた。"};
const importantAnswers={"E01-E":"初めて聴く人が入りやすい曲を最初に置くことかな。でも、知らない曲も一曲は聴いてほしい。","E02-A":"歌声合成の音色と生ギターをどう重ねるかだね。何度も聴いて、曲に合う音を探してる。","E03-B":"作者の意図を確かめてから版を選ぶことかな。声の残し方でも印象が変わるから。","E03-C":"歌詞を詰め込みすぎないことかな。ドラムの間も聴いてもらえるといい。","E05-A":"上手に弾けるかより、安心して一曲聴いて帰れること。無理に歌ってもらわなくていいんだ。","E05-B":"譜面も写真も、記録する前に相手へ確認すること。残したくない人もいるからね。","E06-D":"歌う人が無理なく入れること。ギターが大きすぎたら、こっちで音量を下げるよ。","E06-E":"その場で入会を決めさせないことかな。来週も見学できるって分かると、選びやすいでしょ。","E08-B":"素材を交換しても、元の作者が分かるようにすること。あとで音を直すときにも役立つ。","E08-C":"名義を自分で選べること。匿名にするなら、公開範囲も一緒に決めたいな。","E10-A":"一曲が終わるまで、話を挟まずに聴くこと。弾くのが不安な人もいるから。","E10-B":"撮りたい人の都合より、写る人の意思を優先すること。譜面だけ残す方法もあるよ。","E11-D":"演奏しない人も、耳で次の入りを考えられること。聴く役にも発見があるから。","E12-A":"音量だけじゃなく、帰り道まで確認しておくこと。安心して演奏したいからね。"};
const contextualAnswers={
 "E01-A|P003": "ベース担当だよ。今日は受付にいるの。演奏する人も聴くだけの人も、迷わず入れるように案内してるんだ。",
 "E01-B|P020": "ベースのアンプをちょっと内側に向けてる。前の席だけ音が大きくならない配置を試してるんだ。",
 "E01-C|P017": "歌い出しのタイミングを比べてるよ！ 同じサビでも一拍ずらすと雰囲気が変わるんだ。",
 "E02-A|P004": "DTMを担当してる。今は生ギターの録音と歌声合成を重ねて、どちらも埋もれない音量を探しているところ。",
 "E02-B|P041": "DTM担当！ 同じメロディーでも音色を変えると別の曲みたいになるから、順番に聴いてもらってるんだ。",
 "E02-C|P078": "短いビートを組み直してる。ギターのカッティングを一個足したら、さっきより跳ねる感じになってさ。",
 "E02-D|P043": "共同制作の役割をメモしてる。誰が録音して、誰が最後に確認するか、先に決めておきたくて。",
 "E03-C|P027": "キーボードを弾いてるよ。歌詞の後に少し間を残すように、伴奏を短く切ってみてる。",
 "E04-A|P005": "ドラムだよ！ 間違えた人が戻れるように、最初の一小節だけはっきり合図してるんだ。",
 "E04-B|P032": "ギターの低い弦を短く鳴らして、ドラムに次の拍を渡してる。今はどっちが先に入るか試してる。",
 "E04-C|P033": "最初は手拍子だけだったんだけど、今はそのリズムにキーボードを少し乗せてるよ。誰でも途中から入れるんだ。",
 "E05-B|P036": "歌を担当してるよ。今日は小編成の譜面を見ながら、写真に写りたくない人の席も相談してるの。",
 "E05-C|P037": "ギターです。声を重ねる前に、各自がどんな響きを好むか確かめています。同じコードでも弾き方で変わるので。",
 "E06-A|P019": "次に出る人の順番を確かめてるよ。ドラムを運び込む時間もいるから、転換が慌ただしくならないようにね。",
 "E06-B|P007": "同じギターでも弦とアンプで音が変わるから、順番に鳴らして聴き比べてるよ。好きな方があったら教えて。",
 "E06-E|P055": "キーボード担当だよ。今日は見学した人が次にどう参加できるか、客席で話してるの。今日決めなくても大丈夫。",
 "E07-A|P018": "ギター担当です。ここでは音量と終わる時間を先に確かめてる。周りの人にも気持ちよく聴いてほしいから。",
 "E07-B|P045": "昔の会場の噂と、今の運営の決まりを分けて話してるんだ。ドラムの音量も、今日はちゃんと測ってるよ！",
 "E07-C|P046": "短い曲の出だしをそろえてるところ。私の歌が先に入ると伴奏が迷うから、合図を一つ決めたんだ。",
 "E08-C|P081": "歌を担当しています。今日は、作品を本名で出すか別の名義にするか話しています。本人が選べるのが大事だと思う。",
 "E08-D|P043": "DTM担当。今は二人で作った短い音を重ねてる。一人ずつの音が消えない組み合わせを試してるところ。",
 "E09-A|P008": "三音だけのメロディーを出発点にして、ベースの動きで展開を作っています。音を増やしすぎないのが目標です。",
 "E09-B|P006": "歌詞の一語だけ替えて、歌い心地を確かめてる。鍵盤は少し控えめにして、声の余韻を残したいんだ。",
 "E10-B|P036": "歌の譜面を見ながら、写真に入っていい人を確かめてるよ。写りたくない人の譜面は別の場所に置こうと思って。",
 "E10-C|P039": "歌を担当しています。でも今日は演奏しない人の席も作ってるんです。聴いてくれた感想が次の練習に役立つから。",
 "E11-A|P031": "サックスで短いフレーズを吹いて、次の人に一小節ずつ渡してるよ。初めてでも返事しやすい長さにしてるの。",
 "E11-B|P007": "テンポは変えずに、目線とギターの一音で次の人へ合図してるよ。言葉を使わなくても伝わるか試してるんだ。",
 "E12-A|P045": "ドラム担当！ 音量の上限と帰る通路を確認してる。最後まで安全に演奏できてこそのライブだからね。",
 "E12-B|P048": "ギター担当だよ。撮影していい人を確かめてから、荷物をどの順で運ぶか決めてる。通路は空けときたいし。",
 "E12-C|P047": "ベースで曲を一度通しています。長い練習はできないので、入りと終わりだけ全員で合わせて確認中です。"
};
const passiveExchangeCorrections={"E11-C|P009":{"question":"歌とドラムの掛け合い、次はどうする？","answer":"一拍だけ空けてから叩くよ。歌の返事が来るまで待ってみる。"}};
const answerForQuestion=q=>plain(Story.questionAnswers[q.group_id+'|'+q.target_id]||contextualAnswers[q.group_id+'|'+q.target_id]||(importantAnswers[q.group_id]&&/今日の活動では何が大事/.test(q.question)?importantAnswers[q.group_id]:q.answer));
const politeQuestions={"担当しているパートを教えて。":"担当しているパートを教えてもらえますか？","普段はどんな音楽を聴く？":"普段はどんな音楽を聴きますか？","今、この輪では何をしてるの？":"今はどんなことをしているんですか？","自己紹介してもらってもいい？":"お名前を聞いてもいいですか？","好きなアーティストって誰？":"好きなアーティストは誰ですか？","今日の活動では何が大事？":"今日の活動で大切にしていることは何ですか？"};
const questionText=q=>!q?'所属を尋ねる':Number(people[q.target_id]?.year)>1?(politeQuestions[q.question]||q.question):q.question;
const sceneActivity=gid=>gid==='E02-A'?'歌声合成と生ギターの音色を重ね、ボカロ曲の試作を聴き比べている。':gid==='E04-B'?'ギターとドラムの入りを交互に試している。':D.groups.find(x=>x.group_id===gid)?.activity||'';
const listenText=gid=>Story.listening[gid]||listeningCorrections[gid]||D.actions.find(x=>x.group_id===gid)?.listen_text||'周りの音と会話を聴いた。';
const plain=x=>String(x??'').trim().replace(/^「|」$/g,'').replace(/^『|』$/g,'');
// "Familiarity" is social comfort, not romance or evidence that an NPC is safe.
const stage=(state,id)=>{
 const score=Math.max(0,Math.min(6,Number(state.affinity?.[id])||0));
 const days=new Set(state.relationshipDays?.[id]||[]);
 if(score>=5&&days.size>=3)return 'easygoing';
 if(score>=3&&days.size>=2)return 'familiar';
 return score>0||state.interacted?.includes(id)||state.spokenTo?.includes(id)||state.personalIntroduced?.[id]?'acquainted':'new';
};
const level=(state,id)=>stage(state,id);
const relationshipLabel=(state,id)=>{
 if(stage(state,id)==='new')return 'まだ話しかけたことがない';
 if(!state.interacted?.includes(id)&&!state.spokenTo?.includes(id)&&state.personalIntroduced?.[id])
  return '向こうから自己紹介された';
 return ({acquainted:'話したことがある',familiar:'少し話しやすくなった',easygoing:'気軽に話せる'})[stage(state,id)];
};
// Conversational responsiveness is a stable character property, not a moral or safety rating.
// A guarded character can warm up more through a thoughtful question than through small talk.
const responseGain=(id,action)=>{
 const p=P.people[id];if(!p||!['talk','question','affiliation'].includes(action))return 0;
 const sociallyOpen=p.warmth+p.initiative-p.caution;
 let gain=1;
 if(sociallyOpen>=5)gain=1.25;
 else if(sociallyOpen<=-1)gain=0.5;
 else if(sociallyOpen<=1)gain=0.75;
 if(action==='talk'&&p.caution>=4)gain=Math.max(.5,gain-.25);
 if(action==='question'||action==='affiliation'){
  if(p.caution>=3&&p.expressiveness<=2)gain=Math.min(1.25,gain+.25);
  if(p.initiative>=3&&p.caution<=1)gain=Math.max(.75,gain-.25);
 }
 return Math.max(.5,Math.min(1.25,gain));
};
const role=(id,gid)=>{
 const p=people[id],g=D.groups.find(x=>x.group_id===gid),e=events[g?.event_id];
 if(p.year==='1')return 'newcomer';
 if(p.primary_org===e?.org_id||p.dual_org===e?.org_id)return 'host';
 return 'guest';
};
// Authored first-contact openings for scene/role mismatches; never combine a generic greeting with a hook.
const firstScenes={
'E02-C|P042':'今日はリズムの下書きを作ってるよ。私は歌も担当していて、ネットでは匿名の方が歌いやすいって人もいるよね。',
'E03-B|P057':'普段はLAMPだけど、今日は残響のデモを聴きに来たんだ。小さい部屋だと声の細かいところまで聴こえるね。',
'E03-B|P058':'今日は残響の音源を聴き比べてるよ。ベースの弦を替えると、同じ曲でもかなり違って聴こえる。',
'E04-D|P064':'普段は残響でギターを弾いてる。今日はセッションも見に来たんだ。音を削る時って意外と迷うよね。',
'E04-D|P065':'今日はセッションを見学しに来たんだ。いつもは残響で歌っていて、歌詞より先に歌い方を変えることもあるよ。',
'E05-C|P071':'普段はJAMBOXで歌ってるけど、今日はこもれびで聴く側に回ってる。こういう日も楽しいね。',
'E05-B|P072':'普段はJAMBOXで打楽器をやってる。今日は譜面の整理を手伝いに来たんだ。',
'E02-C|P078':'普段はこもれびでギターを弾いてる。今日はwav.のリズム制作が気になって見に来たんだ。',
'E07-C|P084':'普段はwav.で音作りしてる。今日は404のリハで音源を整える手伝いをしてるんだ。',
'E01-B|P010':'ボーカルをやってるけど、今日はアンプの音量を相談してるんだ。声が埋もれないようにしたくて。',
'E06-C|P010':'今日はリズムを合わせてるところ。声の入りとベースの音量を確かめてるんだ。',
'E07-B|P009':'普段はJAMBOXのドラム担当。今日は404の昔の会場の話を聞きに来たんだ。',
'E03-A|P030':'歌い方を変えて、今作ってるメロディーがどう変わるか試してるんだ。',
'E01-A|P019':'今は受付の片付け順も決めてるんだ。見学者が来たら、演奏の輪まで案内するよ。'
};
function talk(id,gid,state,knownBefore){
 const c=P.people[id],v=c.voice,r=role(id,gid);
 const already=typeof knownBefore==='boolean'?knownBefore:!!(state.spokenTo?.includes(id)||state.interacted?.includes(id));
 const sameCircle=!!state.groupLog?.[gid]?.some(x=>x.pid===id);
 const close=level(state,id),h=hooks[id];
 let line;
 if(sameCircle)line=sceneMode(gid)==='performance'?
  'さっきの演奏、ほかに気になるところあった？':
  'さっきの話の続きだけど、ほかにも聞きたいことある？';
 else if(already){
  const greeting=close==='easygoing'?'また会えたね。':close==='familiar'?'この前はどうも。また会えたね。':words[v].again;
  line=[greeting,plain(h?.reunion_hook||'今日はこっちの輪にいるんだ。')].join(' ');
 }else{
  line=plain(firstScenes[gid+'|'+id]||h?.first_hook||'今日はこの輪で音を聴いているところ。');
  if(id==='P001')line+=' 曲って、鳴らしていない一拍も含めて残ると思うんだ。';
 }
 return {text:line,role:r,voice:v,relationship:close,clue:id==='P001'&&!already&&!sameCircle?'P001-SILENCE':null};
}
function answer(id,gid,kind){
 const p=people[id],q=D.questions.find(x=>x.group_id===gid&&x.target_id===id);
 if(kind==='question'&&q)return {text:answerForQuestion(q),reveals:q.reveals||'',kind:'question'};
 const voice=P.people[id]?.voice||'soft';
 if(p.year==='1'){
  const msg=voice==='reserved'||voice==='precise'?'まだ決めてないんだ。いくつか見比べてる。':
    voice==='energetic'||voice==='friendly'?'まだ迷ってる！ いろんな新歓に行ってみたいんだ。':
    'まだ決めてない。いくつか見て回ってるところ。';
  return {text:msg,reveals:'primary_org',primaryOrg:'N',kind:'affiliation'};
 }
 const main=orgNames[p.primary_org],dual=p.dual_org?orgNames[p.dual_org]:null;
 const first=voice==='precise'||voice==='reserved'?'主な活動は'+main+'。':
   voice==='energetic'||voice==='friendly'?main+'がメインだよ！':
   voice==='quiet'?main+'でやってる。':'普段は'+main+'にいるよ。';
 const second=dual?(voice==='precise'||voice==='reserved'?dual+'も掛け持ちしてる。':dual+'にも顔を出してるよ。'):'';
 return {text:first+second,reveals:'primary_org'+(dual?',dual_org':''),primaryOrg:p.primary_org,dualOrg:p.dual_org||null,kind:'affiliation'};
}
function contact(id,gid,state){
 const c=P.people[id],rule=D.contactChannels.find(x=>x.group_id===gid&&x.person_id===id&&x.platform==='TINE');
 const a=Social.accounts.find(x=>x.person_id===id&&x.platform==='TINE');
 const closeness=level(state,id);
 if(!rule||!a)return {result:'decline',text:'連絡先は、また今度でいい？'};
 if(rule.approval_policy==='after_week')return {result:'decline',text:'もう少し話してからでもいいかな。'};
 if(rule.approval_policy==='next_day'&&c.caution>=4&&closeness==='new')
  return {result:'decline',text:'会ったばかりだから、もう少し話してからでもいい？'};
 if(rule.approval_policy==='next_day')return {result:'pending',text:c.warmth>=3?'いいよ。夜に申請を見ておくね。':'あとで確認しておくね。'};
 return {result:'accept',text:c.warmth>=3?'いいよ、つながろう。':'うん、大丈夫。',accountName:a.display_name};
}
const snsMessage=(id,state)=>{
 const p=people[id],c=P.people[id];
 if(!p||!c||!state.contacts?.includes(id))return null;
 const close=level(state,id),main=orgNames[p.primary_org]||'新歓';
 const opening={
  active:'今日は新歓どうだった？',quiet:'この前はどうも。',private:'連絡先、登録しておいたよ。',
  curated:'今日は来てくれてありがとう。'
 }[c.snsTone]||'この前はどうも。';
 const continuity=close==='easygoing'?'また時間が合ったら話そう。':
   close==='familiar'?'今度、会場でもう少し話せるといいね。':
   p.year==='1'?'ほかの新歓にも行ってみる？':
   c.caution>=3?'困ったことがあれば、案内くらいならできるよ。':
   main+'も、見学だけで大丈夫だよ。';
 return {text:opening+' '+continuity,stage:close,accountName:Social.accounts.find(a=>a.person_id===id&&a.platform==='TINE')?.display_name||'アカウント'};
};
// Scene-specific dialogue must override per (group, speaker, order), because a single member may speak twice.
// Names are explicit in the beta DB. A pair's address is stable by grade, shared organization and tone.
// This is a conversational clue, not automatic notebook verification.
const addressFor=(speakerId,targetId)=>{
 const a=people[speakerId],b=people[targetId],ca=P.people[speakerId],cb=P.people[targetId];
 if(!a||!b||!ca||!cb)return '';
 const names=cb.nameParts||{family:b.name.slice(0,2),given:b.name.slice(2)};
 if(Number(a.year)<Number(b.year))return names.family+'先輩';
 const sameYear=a.year===b.year;
 const shared=a.primary_org!=='N'&&(a.primary_org===b.primary_org||a.primary_org===b.dual_org||
  (a.dual_org&&a.dual_org===b.primary_org));
 const relaxed=sameYear&&shared&&ca.addressStyle==='casual'&&cb.addressStyle!=='formal';
 if(relaxed)return names.nickname||names.given;
 return names.family+(sameYear?'さん':'さん');
};
const selfIntroduction=(id,state,source='direct')=>{
 if(state.personalIntroduced?.[id])return '';
 const c=P.people[id],p=people[id];
 if(source==='bystander')return (c.initiative>=3&&c.warmth>=3?'そういえば名乗ってなかったね。':'初めまして、')+p.name+'です。';
 if(Number(p.year)===1)return p.name+'です。よろしく。';
 if(c.voice==='energetic'||c.voice==='friendly')return p.name+'です。よろしくね。';
 if(c.voice==='reserved'||c.voice==='precise')return p.name+'です。よろしく。';
 return p.name+'です。今日はよろしくね。';
};
const sceneLine=line=>Story.lines[line.group_id+'|'+line.speaker_id+'|'+line.order]||sceneCorrections[line.group_id+'|'+line.speaker_id+'|'+line.order]||P.sceneOverrides[line.group_id+'|'+line.speaker_id+'|'+line.order]||
 P.sceneOverrides[line.group_id+'|'+line.speaker_id]||line.text;
const performanceGroups=new Set(['E01-C','E03-A','E04-A','E04-B','E04-C','E04-D','E05-C','E06-B','E06-C','E06-D','E07-C','E09-A','E09-B','E10-A','E11-A','E11-B','E11-C','E11-D','E12-C']);
const sceneMode=gid=>performanceGroups.has(gid)?'performance':'conversation';
const thirdParty=(targetId,gid,state,action)=>{
 const peers=D.members.filter(m=>m.group_id===gid&&m.person_id!==targetId).map(m=>m.person_id);
 if(!peers.length)return null;
 const history=state.groupLog?.[gid]?.length||0;
 const key=gid+'|'+targetId+'|'+history+'|'+action;
 let seed=Number(state.presentationSeed)>>>0;
 for(const char of key)seed=Math.imul(seed^char.charCodeAt(0),16777619)>>>0;
 const id=peers[seed%peers.length],trait=P.people[id];
 // Personality controls whether the bystander joins at all. A quiet person often just listens.
 const probability=Math.max(0.10,Math.min(.85,
   .15+trait.initiative*.105+trait.warmth*.045+trait.expressiveness*.045-trait.caution*.08));
 const roll=(((Math.imul(seed^0x9e3779b9,2246822519)>>>0)%1000)/1000);
 if(roll>=probability&&!(['talk','talk-producer'].includes(action)&&!state.groupLog?.[gid]?.some(x=>x.reply)))return null;
 const yr=Number(people[id].year),targetYear=Number(people[targetId].year);
  const question=D.questions.find(q=>q.group_id===gid&&q.target_id===targetId)?.question||'';
  const aboutIdentity=/自己紹介/.test(question),aboutMusic=/音楽|アーティスト/.test(question);
 const nickname=addressFor(id,targetId);
 const introEligible=!state.personalIntroduced?.[id]&&trait.initiative>=3&&trait.warmth>=3;
 const introRoll=(((Math.imul(seed^0x2b992ddf,3266489917)>>>0)%1000)/1000);
 const spontaneousIntro=introEligible&&introRoll<Math.min(.6,.13+trait.expressiveness*.1);
 let words;
 if(action==='producer'||action==='talk-producer'){
  words=yr===1&&targetYear>1?'その曲なら私も聴いたことがあります。':yr===1?'その曲、どこかで聴いたことあるかも。':'その名義の話、気になるよね。';
 }else if(action==='music'){
  words=yr===1&&targetYear>1?'そのパートの話、私も聞いてみたかったです。':yr===1?'それ、私も気になってた。':'その楽器の話、続きが気になるね。';
 }else if(action==='photo'){
  words=yr===1&&targetYear>1?'先輩、写真を上げるときって公開範囲も決められるんですね。':
   yr===1?'あ、私も写真を見ることはあるよ。':
   '投稿を見るだけの人もいるし、使い方はそれぞれだよね。';
 }else if(action==='contact'){
  words=yr===1&&targetYear>1?'自分も、もう少し話してから聞いてみようと思います。':
   yr===1?'連絡先、交換するかまだ迷ってるんだよね。':
   '連絡先の交換って、急いで決めなくても大丈夫だよ。';
 }else if(action==='question'||action==='affiliation'){
  const topic=action==='affiliation'?'どこのサークルで活動しているか':aboutIdentity?'お名前':aboutMusic?'好きな音楽':/パート/.test(question)?'担当パート':/何が大事/.test(question)?'大切にしていること':'今の活動';
  words=yr===1&&targetYear>1?nickname+'、'+topic+'は自分も聞きたかったです。':
   yr===1?topic+'は私も気になってた。':
   targetYear===1?topic+'の話、私もしてみたいな。':
   nickname+'、'+topic+'の話は私も気になるな。';
 }else if(sceneMode(gid)==='performance'){
  words=yr===1&&targetYear>1?'さっきの演奏、自分ももう一度聴いてみたいです。':
   yr===1?'今のところ、もう一回聴いてみたいね。':
   '今の一小節、もう一度合わせてみようか。';
 }else if(yr===1&&targetYear>1){
  words=action==='question'?nickname+'、自分もそこが気になってました。':
   'そうなんですね。自分も話を聞いてみたかったです。';
 }else if(yr===1){
  words=action==='question'?'それ、私も気になってた。':'あ、同じこと考えてた。';
 }else if(targetYear===1){
  words=action==='question'?'初めてだと分からないよね。聞いてくれて大丈夫だよ。':
   'そうそう、気になったことは聞いていいんだよ。';
 }else words=action==='question'?nickname+'、そこは私も確認しておきたい。':
  'なるほど。それは少し気になるね。';
 const nameLine=spontaneousIntro?selfIntroduction(id,state,'bystander'):'';
 return {pid:id,text:[words,nameLine].filter(Boolean).join(' '),type:'輪の反応',
   selfIntroduced:spontaneousIntro};
};
// Listening is deliberately passive: an authored question goes between two group members.
// Only an outgoing character may turn and address the protagonist.
const momentSeed=(state,key)=>{
 let n=(Number(state.presentationSeed)||0)>>>0;
 for(const char of String(key))n=Math.imul(n^char.charCodeAt(0),16777619)>>>0;
 return n>>>0;
};
const passiveListen=(gid,state)=>{
 const ids=D.members.filter(m=>m.group_id===gid).map(m=>m.person_id);
 const used=(state.groupLog?.[gid]||[]).filter(x=>x.type==='話を聞く'||x.type==='聞き耳').length;
 const questions=D.questions.filter(q=>q.group_id===gid&&ids.includes(q.target_id));
 const seed=momentSeed(state,gid+'|overheard');
 const q=questions.length?questions[(seed+used)%questions.length]:null;
 const respondent=q?.target_id||ids[(seed+used)%ids.length];
 const other=ids.filter(id=>id!==respondent);
 const asker=other[(seed+used)%other.length];
 const familiar=!!(people[asker]&&people[respondent]&&Number(people[asker].year)>=Number(people[respondent].year));
 const correction=q?passiveExchangeCorrections[gid+'|'+respondent]:null;
 const ask=correction?.question||(q?(familiar?q.question:questionText(q)):'さっきのところ、どうだった？');
 const answer=correction?.answer||(q?answerForQuestion(q):'次はもう少し合わせてみたいね。');
 const intro=used===0?'少し離れたところで、参加者同士の会話が聞こえる。':'そのまま耳を傾けると、別の話題になった。';
 const overheard=[
  {pid:asker,text:addressFor(asker,respondent)+'、'+ask,tag:'ほかの参加者へ'},
  {pid:respondent,text:answer,tag:'返事'}
 ];
 const outgoing=ids.filter(id=>P.people[id]?.initiative>=3&&P.people[id]?.warmth>=3&&P.people[id]?.caution<=3);
 const addressId=outgoing.length?outgoing[momentSeed(state,gid+'|approach|'+used)%outgoing.length]:null;
 let address=null;
 if(addressId){
  const c=P.people[addressId];
  const chance=Math.max(.12,Math.min(.50,.08+c.initiative*.065+c.warmth*.035-c.caution*.065));
  const roll=(momentSeed(state,gid+'|address-roll|'+used)%1000)/1000;
  if(roll<chance){
   const already=!!state.personalIntroduced?.[addressId];
   const greet=already?'さっきもいたよね。楽しめてる？':c.voice==='energetic'?'あ、見学の人だよね！ よかったら近くで聴いていって。':c.voice==='friendly'?'見学に来たんだよね？ 分からないことがあったら聞いてね。':'よかったら、こっちでも話を聞いていって。';
   const nameLine=already?'':selfIntroduction(addressId,state,'bystander');
   address={pid:addressId,text:[greet,nameLine].filter(Boolean).join(' '),tag:'向こうから声をかけられた',selfIntroduced:!!nameLine};
  }
 }
 return {intro,overheard,address};
};
// Only a close, sociable character may voluntarily offer a shareable channel.
// Account and consent policies remain authoritative even at high affinity.
const spontaneousContact=(id,gid,state)=>{
 const c=P.people[id],close=level(state,id);
 // An orientation event is a plausible first-day opportunity to exchange contacts.
 const talked=!!(state.interacted?.includes(id)||state.spokenTo?.includes(id)||state.personalIntroduced?.[id]);
 if(!c||c.initiative<3||c.warmth<3||c.caution>3)return null;
 const host=role(id,gid)==='host';
 const closenessBoost=close==='easygoing'?.16:close==='familiar'?.11:0;
 const privatePenalty=c.snsTone==='private'&&!talked?.10:0;
 const chance=Math.max(.025,Math.min(.82,.09+(c.initiative-3)*.13+(c.warmth-3)*.07-
  (c.caution-1)*.06+(host?.09:0)+(talked?.18:0)+closenessBoost-privatePenalty));
 if((momentSeed(state,gid+'|spontaneous-contact|'+id)%1000)/1000>=chance)return null;
 const rules=D.contactChannels.filter(r=>r.group_id===gid&&r.person_id===id);
 const tine=rules.find(r=>r.platform==='TINE'),photo=rules.find(r=>r.platform==='Photogram');
 const account=platform=>Social.accounts.find(a=>a.person_id===id&&a.platform===platform);
 const existing=state.contacts?.includes(id)||state.pendingContacts?.includes(id);
 const tag=close==='easygoing'?'また今度も話したいし、':
  close==='familiar'?'また会ったときにも連絡できるように、':
  talked?'せっかく話せたし、':
  host?'新歓のお知らせも送れるし、':'またどこかで話せるといいし、';
 if(tine&&account('TINE')&&!existing&&tine.approval_policy!=='after_week'){
  const pending=tine.approval_policy==='next_day';
  return {pid:id,platform:'TINE',status:pending?'pending':'accept',
   text:tag+(pending?'よかったらTINEの申請を送って。明日確認するね。':'よかったらTINEを交換しない？')};
 }
 if(photo&&account('Photogram')&&!state.photoFollows?.includes(id)&&!state.photoRequests?.includes(id)&&photo.approval_policy!=='after_week'){
  const pending=photo.approval_policy==='next_day';
  return {pid:id,platform:'Photogram',status:pending?'pending':'accept',
   text:tag+(pending?'Photogramの申請を送ってくれる？ 明日見ておくね。':'Photogramもつながっておく？')};
 }
 const z=account('Zitter');
 if(z&&z.visibility==='公開'&&c.snsTone==='active'&&!state.zitterFollows?.includes(id))
  return {pid:id,platform:'Zitter',status:'accept',text:'よかったら公開しているZitterも見てみて。音楽の話を載せてるんだ。'};
 return null;
};
const contactReaction=(id,gid,state,kind)=>{
 const c=P.people[id],close=level(state,id),voice=c?.voice||'soft';
 const warm=c?.warmth||2,guard=c?.caution||2,active=c?.initiative>=3;
 const variants={
  accept:active&&warm>=3?['いいよ！ また新歓で会えたらうれしいな。','もちろん。イベントの話も送るね。']:guard>=3?['うん、見学の案内なら大丈夫だよ。','必要なときに連絡してね。']:['いいよ、よろしくね。','うん、つながっておこう。'],
  pending:guard>=3?['申請は受け取るけど、承認は落ち着いてからにするね。','今すぐは見られないから、明日確認するよ。']:['ありがとう！ 明日見ておくね。','通知を見落とすかも。明日まで待っててね。'],
  after_week:close==='new'?['連絡先は、もう少し顔を合わせてからにしてるんだ。','今週は見学の人に個人アカウントを渡していないんだ。']:['今週の間は申請を受けていないけど、また会場で話そう。','来週以降にまた聞いてくれるとうれしい。'],
  privacy:guard>=3?['そのアカウントは身内向けにしてるんだ。','公開範囲を分けているから、今は教えないでおくね。']:['個人用は非公開にしてるんだ。','そのSNSは見るだけにしていて。'],
  no_sns:voice==='precise'||voice==='reserved'?['そのサービスは使っていません。','連絡には別の手段を使っているんだ。']:['そこはやってないんだ、ごめんね。','最近そのSNSは開いてなくて。'],
  cautious:guard>=4?['まだ会ったばかりだから、今は交換しないでおくね。','個人の連絡先は、もう少し話してからがいいかな。']:['また会えたときに聞いてくれる？','今日はまだ見学だけにしておきたいな。'],
  public:active?['公開してる方なら見てもらって大丈夫！','公開の投稿なら、よかったら覗いてみて。']:['公開している投稿だけならどうぞ。','見るだけなら、公開アカウントがあるよ。'],
  already:['あ、もうつながってたね。','前に交換した方で大丈夫だよ。']
 };
 const options=variants[kind]||variants.cautious;
 return options[momentSeed(state,gid+'|contact-tone|'+id+'|'+kind)%options.length];
};
const chatAudit=()=>({firstYearLines:D.lines.filter(x=>people[x.speaker_id]?.year==='1').length,
 overridden:Object.keys(P.sceneOverrides).length,allScenes:D.lines.length,profiles:Object.keys(P.people).length});
window.S6_BETA_DIALOGUE={talk,answer,contact,sceneLine,sceneActivity,listenText,passiveListen,spontaneousContact,contactReaction,questionText,sceneMode,thirdParty,selfIntroduction,addressFor,level,relationshipLabel,responseGain,snsMessage,role,chatAudit};
})();