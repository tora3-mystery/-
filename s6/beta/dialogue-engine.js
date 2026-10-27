(() => {
'use strict';
const D=window.S6_DATA,P=window.S6_BETA_PROFILES,Social=window.S6_BETA_SOCIAL;
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
const importantAnswers={"E01-E":"初めて聴く人が入りやすい曲を最初に置くことかな。でも、知らない曲も一曲は聴いてほしい。","E02-A":"作った本人が公開範囲を決められること。未完成の音を勝手に外へ出さないようにしてる。","E03-B":"作者の意図を確かめてから版を選ぶことかな。声の残し方でも印象が変わるから。","E03-C":"歌詞を詰め込みすぎないことかな。ドラムの間も聴いてもらえるといい。","E05-A":"上手に弾けるかより、安心して一曲聴いて帰れること。無理に歌ってもらわなくていいんだ。","E05-B":"譜面も写真も、記録する前に相手へ確認すること。残したくない人もいるからね。","E06-D":"歌う人が無理なく入れること。ギターが大きすぎたら、こっちで音量を下げるよ。","E06-E":"その場で入会を決めさせないことかな。来週も見学できるって分かると、選びやすいでしょ。","E08-B":"素材を交換しても、元の作者が分かるようにすること。あとで音を直すときにも役立つ。","E08-C":"名義を自分で選べること。匿名にするなら、公開範囲も一緒に決めたいな。","E10-A":"一曲が終わるまで、話を挟まずに聴くこと。弾くのが不安な人もいるから。","E10-B":"撮りたい人の都合より、写る人の意思を優先すること。譜面だけ残す方法もあるよ。","E11-D":"演奏しない人も、耳で次の入りを考えられること。聴く役にも発見があるから。","E12-A":"音量だけじゃなく、帰り道まで確認しておくこと。安心して演奏したいからね。"};
const politeQuestions={"担当しているパートを教えて。":"担当しているパートを教えてもらえますか？","普段はどんな音楽を聴く？":"普段はどんな音楽を聴きますか？","今、この輪では何をしてるの？":"今はどんなことをしているんですか？","自己紹介してもらってもいい？":"お名前を聞いてもいいですか？","好きなアーティストって誰？":"好きなアーティストは誰ですか？","今日の活動では何が大事？":"今日の活動で大切にしていることは何ですか？"};
const questionText=q=>!q?'所属を尋ねる':Number(people[q.target_id]?.year)>1?(politeQuestions[q.question]||q.question):q.question;
const sceneActivity=gid=>gid==='E04-B'?'ギターとドラムの入りを交互に試している。':D.groups.find(x=>x.group_id===gid)?.activity||'';
const listenText=gid=>listeningCorrections[gid]||D.actions.find(x=>x.group_id===gid)?.listen_text||'周りの音と会話を聴いた。';
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
function talk(id,gid,state){
 const p=people[id],c=P.people[id],r=role(id,gid),v=c.voice;
 const already=!!(state.spokenTo?.includes(id)||state.interacted?.includes(id)),close=level(state,id);
 const sameCircle=!!state.groupLog?.[gid]?.some(x=>x.pid===id);
 const intro=sameCircle?(v==='reserved'||v==='precise'?'さっきの話だけど。':'そうそう、もう少し話していい？'):
  already?(
   close==='easygoing'?(v==='reserved'||v==='quiet'?'今日も来てたんだね。':'お、また会えたね。'):
   close==='familiar'?(v==='precise'||v==='reserved'?'この前の話、覚えてるよ。':'また会ったね。この前の続きも話せそう。'):
   words[v].again):words[v][r];
 const h=hooks[id];let cue=plain(sameCircle?'今の話、どう思った？':h?.[already?'reunion_hook':'first_hook']||h?.first_hook||'音を聴いていってね。');
 if(id==='P003'&&gid!=='E01-A'&&!already)cue='次の演奏順を確認してたんだ。みんなが迷わないといいな。';
 if(sceneMode(gid)==='performance'&&r==='host'&&/(受付|入会届|今日決め)/.test(cue))
  cue='曲が一区切りついたところ。よかったら、今の演奏の感想を聞かせて。';
 if(!already&&r==='newcomer'&&cue.includes('見学中なんだ'))cue=cue.replace('、見学中なんだ','');
 // Preserve original character hook; add contextual color only when it fits the character.
 const g=D.groups.find(x=>x.group_id===gid),e=events[g?.event_id],theme=sceneContext[e?.org_id];
 const context=!already&&r==='host'&&c.initiative>=3&&c.expressiveness>=3&&Number(id.slice(1))%4===1&&theme?
  '今日は'+theme+'が中心なんだ。':'';
 const special=id==='P001'&&!already?'入学前から、きみに合いそうな席を考えていたんだ。':'';
 return {text:[intro,context,cue,special].filter(Boolean).join(' '),role:r,voice:v,relationship:close,clue:special?'P001-PREPARATION':null};
}
function answer(id,gid,kind){
 const p=people[id],q=D.questions.find(x=>x.group_id===gid&&x.target_id===id);
 if(kind==='question'&&q)return {text:plain(importantAnswers[gid]&&/今日の活動では何が大事/.test(q.question)?importantAnswers[gid]:q.answer),reveals:q.reveals||'',kind:'question'};
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
 const c=P.people[id],p=people[id],roleType=Number(p.year)===1?'newcomer':'member';
 const base=roleType==='newcomer'?'同じ新入生の':'';
 if(source==='bystander'){
  if(c.initiative>=3&&c.warmth>=3)return 'あ、名乗ってなかったね。'+base+p.name+'です。よろしく。';
  return 'そういえば、'+p.name+'です。よろしく。';
 }
 if(c.voice==='reserved'||c.voice==='precise')return '改めて、'+p.name+'です。';
 if(c.voice==='energetic'||c.voice==='friendly')return 'あ、'+p.name+'です。よろしく！';
 return 'そういえばまだ直接話してなかったね。'+base+p.name+'です。';
};
const sceneLine=line=>sceneCorrections[line.group_id+'|'+line.speaker_id+'|'+line.order]||P.sceneOverrides[line.group_id+'|'+line.speaker_id+'|'+line.order]||
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
 if(roll>=probability)return null;
 const yr=Number(people[id].year),targetYear=Number(people[targetId].year);
  const question=D.questions.find(q=>q.group_id===gid&&q.target_id===targetId)?.question||'';
  const aboutIdentity=/自己紹介/.test(question),aboutMusic=/音楽|アーティスト/.test(question);
 const nickname=addressFor(id,targetId);
 const introEligible=!state.personalIntroduced?.[id]&&trait.initiative>=3&&trait.warmth>=3;
 const introRoll=(((Math.imul(seed^0x2b992ddf,3266489917)>>>0)%1000)/1000);
 const spontaneousIntro=introEligible&&introRoll<Math.min(.6,.13+trait.expressiveness*.1);
 let words;
 if(action==='photo'){
  words=yr===1&&targetYear>1?'先輩、写真を上げるときって公開範囲も決められるんですね。':
   yr===1?'あ、私も写真を見ることはあるよ。':
   '投稿を見るだけの人もいるし、使い方はそれぞれだよね。';
 }else if(action==='contact'){
  words=yr===1&&targetYear>1?'自分も、もう少し話してから聞いてみようと思います。':
   yr===1?'連絡先、交換するかまだ迷ってるんだよね。':
   '連絡先の交換って、急いで決めなくても大丈夫だよ。';
 }else if(sceneMode(gid)==='performance'){
  words=yr===1&&targetYear>1?'さっきの演奏、自分ももう一度聴いてみたいです。':
   yr===1?'今のところ、もう一回聴いてみたいね。':
   action==='question'?(aboutIdentity?'あ、お名前なら私も聞いてみたかった。':aboutMusic?'どんな音楽が好きか、私も気になるな。':'その話、私も聞いてみたいな。'):'今の一小節、もう一度合わせてみようか。';
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
const chatAudit=()=>({firstYearLines:D.lines.filter(x=>people[x.speaker_id]?.year==='1').length,
 overridden:Object.keys(P.sceneOverrides).length,allScenes:D.lines.length,profiles:Object.keys(P.people).length});
window.S6_BETA_DIALOGUE={talk,answer,contact,sceneLine,sceneActivity,listenText,questionText,sceneMode,thirdParty,selfIntroduction,addressFor,level,relationshipLabel,responseGain,snsMessage,role,chatAudit};
})();