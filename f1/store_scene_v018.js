/*
 * F1 v0.18 main-photo resolver (prepared for Work image assets).
 *
 * Pure, deterministic selection. Does not change game metrics or current
 * public v0.17 artwork until every new image is available and integrated.
 * Fixed master camera is specified in STORE_PHOTO_STATE_SPEC_V018.md.
 */
(function(root,factory){
  'use strict';
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.F1StoreSceneV018=api;
})(typeof window!=='undefined'?window:undefined,function(){
  'use strict';
  const AXES=['checkout','aisle','stock','noise'];
  const BASE=['neutral','orderly','busy','underused'];
  const LEVELS=['mild','moderate','severe'];
  const PAIRS=[];
  for(let i=0;i<4;i++)for(let j=i+1;j<4;j++)PAIRS.push([AXES[i],AXES[j]]);
  const IMPROVEMENTS=['register-added','aisle-rearranged','restocked','renovated'];
  const OUTCOMES=['success','decline'];
  const filenames=[
    ...BASE.map(x=>'main-base-'+x+'.webp'),
    ...AXES.flatMap(x=>LEVELS.map(level=>'main-'+x+'-'+level+'.webp')),
    ...PAIRS.flatMap(([a,b])=>['moderate','severe'].map(level=>'main-'+a+'-'+b+'-'+level+'.webp')),
    ...IMPROVEMENTS.map(x=>'main-improved-'+x+'.webp'),
    ...OUTCOMES.map(x=>'main-outcome-'+x+'.webp')
  ];
  const FILES=Object.freeze(filenames);
  const FILE_SET=new Set(FILES);
  if(FILES.length!==34||FILE_SET.size!==34)throw Error('F1 scene manifest must contain 34 unique files');

  /**
   * input: {complaints:[q,aisle,stock,noise], attraction:0..10,
   *         day:1..8, ending?:string|null, completedActions?:string[]}
   * Excludes special shrine, DAY7-masked and DAY8 images: caller retains
   * existing dedicated routing for those sequences.
   */
  function resolve(input){
    if(!input||!Array.isArray(input.complaints)||input.complaints.length!==4
      ||input.complaints.some(x=>!Number.isInteger(x)||x<0||x>5))
      throw Error('Four integer complaint scores 0..5 required');
    if(!Number.isInteger(input.attraction)||input.attraction<0||input.attraction>10)
      throw Error('Attraction 0..10 required');
    const day=input.day==null?1:input.day;
    if(!Number.isInteger(day)||day<1||day>8)throw Error('DAY 1..8 required');

    const actions=new Set(input.completedActions||[]);
    const ordered=AXES.map((name,i)=>({name,value:input.complaints[i],index:i}))
      .sort((a,b)=>b.value-a.value||a.index-b.index);
    const [worst,second]=ordered;
    const sum=input.complaints.reduce((a,b)=>a+b,0);
    let file,reason;

    if(day===8||String(input.ending||'').startsWith('odd_'))
      return null; // Keep existing extraordinary-scene rules untouched.

    if(input.ending==='normal_success'){
      file='main-outcome-success.webp';reason='weekly-success';
    }else if(input.ending==='normal_strain'||input.endingReason==='閉店'
      ||input.endingReason==='店長交代'){
      file='main-outcome-decline.webp';reason='weekly-decline';
    }else if(worst.value>=3&&second.value>=3){
      const pair=[worst,second].sort((a,b)=>a.index-b.index);
      const severe=worst.value>=4; // severe means the leading issue is severe; secondary may remain moderate
      file='main-'+pair[0].name+'-'+pair[1].name+'-'+(severe?'severe':'moderate')+'.webp';
      reason='two-current-issues';
    }else if(worst.value>=2){
      file='main-'+worst.name+'-'+(worst.value>=4?'severe':worst.value===3?'moderate':'mild')+'.webp';
      reason='dominant-current-issue';
    }else if(actions.has('weekendStore')){
      file='main-improved-renovated.webp';reason='visible-permanent-renovation';
    }else if(actions.has('register')||actions.has('self')){
      file='main-improved-register-added.webp';reason='visible-register-layout';
    }else if(actions.has('lane')||actions.has('compact')){
      file='main-improved-aisle-rearranged.webp';reason='visible-aisle-layout';
    }else if(actions.has('receive')||actions.has('forecast')||actions.has('farmer')){
      file='main-improved-restocked.webp';reason='visible-refilled-shelves';
    }else if(input.attraction<=3){
      file='main-base-underused.webp';reason='low-footfall';
    }else if(input.attraction>=8){
      file='main-base-busy.webp';reason='high-footfall';
    }else if(sum<=2&&input.attraction>=5){
      file='main-base-orderly.webp';reason='quiet-well-run-floor';
    }else{
      file='main-base-neutral.webp';reason='ordinary-floor';
    }
    if(!FILE_SET.has(file))throw Error('Missing F1 scene target: '+file);
    return Object.freeze({file,reason,main:true});
  }
  return Object.freeze({AXES:Object.freeze(AXES),FILES,resolve});
});
