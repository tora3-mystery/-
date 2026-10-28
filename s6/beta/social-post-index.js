(() => {
'use strict';
// S6 beta only. Every person has an explicit per-platform post record.
// Counts are derived from canonical D.posts; they are never invented from
// following/contact state and they never include future posts.
const START_DATE='2026-04-06';
const D=window.S6_DATA,Social=window.S6_BETA_SOCIAL;
const platforms=['TINE','Photogram','Zitter'];
const accountByKey=Object.fromEntries(Social.accounts.map(a=>[a.person_id+'|'+a.platform,a]));
const postsByKey={};
for(const a of Social.accounts)postsByKey[a.person_id+'|'+a.platform]=[];
for(const p of D.posts){
 const key=p.author_id+'|'+p.platform;
 if(!postsByKey[key])throw Error('S6 missing SNS account for '+p.post_id);
 postsByKey[key].push(p);
}
const people=Object.fromEntries(D.people.map(p=>{
 const accounts=Object.fromEntries(platforms.map(platform=>{
  const a=accountByKey[p.person_id+'|'+platform];
  if(!a)return [platform,null]; // no account: NOT "0 posts"
  const posts=postsByKey[p.person_id+'|'+platform].slice().sort((x,y)=>x.published_at.localeCompare(y.published_at));
  return [platform,Object.freeze({
   account_id:a.account_id,person_id:p.person_id,platform,
   post_ids:Object.freeze(posts.map(x=>x.post_id)),
   starting_posts:posts.filter(x=>x.published_at.slice(0,10)<START_DATE).length,
   total_scripted_posts:posts.length
  })];
 }));
 return [p.person_id,Object.freeze({person_id:p.person_id,accounts:Object.freeze(accounts)})];
}));
function at(personId,platform,date){
 const item=people[personId]?.accounts[platform];
 if(!item)return null;
 const day=String(date||START_DATE).slice(0,10);
 return Object.freeze({
  account_id:item.account_id,
  person_id:personId,platform,
  start:item.starting_posts,
  count:item.post_ids.filter(id=>{
   const post=D.posts.find(p=>p.post_id===id);
   return post.published_at.slice(0,10)<=day;
  }).length
 });
}
window.S6_BETA_POST_ACTIVITY=Object.freeze({
 version:'0.7.2',startDate:START_DATE,
 people:Object.freeze(people),
 at
});
})();
