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
 const already=state.spokenTo?.includes(id)||false,close=level(state,id);
 const intro=already?(
  close==='easygoing'?(v==='reserved'||v==='quiet'?'今日も来てたんだね。':'お、また会えたね。'):
  close==='familiar'?(v==='precise'||v==='reserved'?'この前の話、覚えてるよ。':'また会ったね。この前の続きも話せそう。'):
  words[v].again):words[v][r];
 const h=hooks[id];let cue=plain(h?.[already?'reunion_hook':'first_hook']||h?.first_hook||'音を聴いていってね。');
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
 if(kind==='question'&&q)return {text:plain(q.answer),reveals:q.reveals||'',kind:'question'};
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
 const shared=a.primary_org===b.primary_org||a.primary_org===b.dual_org||
  (a.dual_org&&a.dual_org===b.primary_org);
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
const sceneLine=line=>P.sceneOverrides[line.group_id+'|'+line.speaker_id+'|'+line.order]||
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
 const nickname=addressFor(id,targetId);
 const introEligible=!state.personalIntroduced?.[id]&&trait.initiative>=3&&trait.warmth>=3;
 const introRoll=(((Math.imul(seed^0x2b992ddf,3266489917)>>>0)%1000)/1000);
 const spontaneousIntro=introEligible&&introRoll<Math.min(.6,.13+trait.expressiveness*.1);
 let words;
 if(sceneMode(gid)==='performance'){
  words=yr===1&&targetYear>1?'今のところ、自分ももう一回聴いてみたいです。':
   yr===1?'今のところ、もう一回聴きたいね。':
   action==='question'?'今の演奏の話なら、私も少し聞いてみたいな。':'今の一小節、もう一度合わせてみようか。';
 }else if(yr===1&&targetYear>1){
  words=action==='question'?nickname+'、自分もそこが気になってました。':
   'あ、自分も今の話、聞いてみたかったです。';
 }else if(yr===1){
  words=action==='question'?'それ、私も気になってた。':'あ、同じこと考えてた。';
 }else if(targetYear===1){
  words=action==='question'?'最初は分からないよね。聞いてくれて大丈夫だよ。':
   'そうそう、無理に今日決めなくていいよ。';
 }else words=action==='question'?nickname+'、そこは私も確認しておきたい。':
  'なるほど。それは少し気になるね。';
 const nameLine=spontaneousIntro?selfIntroduction(id,state,'bystander'):'';
 return {pid:id,text:[words,nameLine].filter(Boolean).join(' '),type:'輪の反応',
   selfIntroduced:spontaneousIntro};
};
const chatAudit=()=>({firstYearLines:D.lines.filter(x=>people[x.speaker_id]?.year==='1').length,
 overridden:Object.keys(P.sceneOverrides).length,allScenes:D.lines.length,profiles:Object.keys(P.people).length});
window.S6_BETA_DIALOGUE={talk,answer,contact,sceneLine,sceneMode,thirdParty,selfIntroduction,addressFor,level,relationshipLabel,responseGain,snsMessage,role,chatAudit};
})();