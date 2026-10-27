(() => {
'use strict';
const D=window.S6_DATA,P=window.S6_BETA_PROFILES;
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
const level=(state,id)=>state.contacts?.includes(id)?'contact':(state.affinity?.[id]||0)>=3?'familiar':
 (state.affinity?.[id]||0)>=1?'acquainted':'new';
const role=(id,gid)=>{
 const p=people[id],g=D.groups.find(x=>x.group_id===gid),e=events[g?.event_id];
 if(p.year==='1')return 'newcomer';
 if(p.primary_org===e?.org_id||p.dual_org===e?.org_id)return 'host';
 return 'guest';
};
function talk(id,gid,state){
 const p=people[id],c=P.people[id],r=role(id,gid),v=c.voice;
 const already=state.spokenTo.includes(id),close=level(state,id);
 const intro=already?(close==='contact'?'この前は連絡ありがとう。':words[v].again):words[v][r];
 const h=hooks[id];let cue=plain(h?.[already?'reunion_hook':'first_hook']||h?.first_hook||'音を聴いていってね。');
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
 if(p.year==='1')return {text:'まだどこに入るか決めてないんだ。いろいろ見学中。',reveals:'primary_org',primaryOrg:'N'};
 const main=orgNames[p.primary_org],dual=p.dual_org?orgNames[p.dual_org]:null;
 return {text:'普段は'+main+'にいるよ。'+(dual?dual+'にも顔を出すんだ。':''),reveals:'primary_org'+(dual?',dual_org':''),primaryOrg:p.primary_org,dualOrg:p.dual_org||null,kind:'affiliation'};
}
function contact(id,gid,state){
 const c=P.people[id],rule=D.contactChannels.find(x=>x.group_id===gid&&x.person_id===id&&x.platform==='TINE');
 const a=D.accounts.find(x=>x.person_id===id&&x.platform==='TINE');
 const closeness=level(state,id);
 if(!rule||!a)return {result:'decline',text:'連絡先は、また今度でいい？'};
 if(rule.approval_policy==='after_week')return {result:'decline',text:'もう少し話してからでもいいかな。'};
 if(rule.approval_policy==='next_day'&&c.caution>=4&&closeness==='new')
  return {result:'decline',text:'会ったばかりだから、もう少し話してからでもいい？'};
 if(rule.approval_policy==='next_day')return {result:'pending',text:c.warmth>=3?'いいよ。夜に申請を見ておくね。':'あとで確認しておくね。'};
 return {result:'accept',text:c.warmth>=3?'いいよ、つながろう。':'うん、大丈夫。',accountName:a.display_name};
}
const sceneLine=line=>P.sceneOverrides[line.group_id+'|'+line.speaker_id]||line.text;
const chatAudit=()=>({firstYearLines:D.lines.filter(x=>people[x.speaker_id]?.year==='1').length,
 overridden:Object.keys(P.sceneOverrides).length,allScenes:D.lines.length,profiles:Object.keys(P.people).length});
window.S6_BETA_DIALOGUE={talk,answer,contact,sceneLine,level,role,chatAudit};
})();