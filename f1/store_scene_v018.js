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
  // The original 34-image list remains an archive of candidates, NOT a
  // mandatory production order. v0.18 uses 28 state photos plus the existing
  // one-time register-installation report photo. Existing ending photos stay.
  const MAIN_FILES=Object.freeze([
    ...BASE.map(x=>'main-base-'+x+'.webp'),
    ...AXES.flatMap(x=>LEVELS.map(level=>'main-'+x+'-'+level+'.webp')),
    ...PAIRS.flatMap(([a,b])=>['moderate','severe'].map(level=>'main-'+a+'-'+b+'-'+level+'.webp'))
  ]);
  const RESULT_FILES=Object.freeze(['main-improved-register-added.webp']);
  const PRODUCTION_FILES=Object.freeze([...MAIN_FILES,...RESULT_FILES]);

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

    // Permanent fixture changes are NOT baked into full-floor state photos.
    // They are reported via one-time close-up and operational metrics.
    const ordered=AXES.map((name,i)=>({name,value:input.complaints[i],index:i}))
      .sort((a,b)=>b.value-a.value||a.index-b.index);
    const [worst,second]=ordered;
    const sum=input.complaints.reduce((a,b)=>a+b,0);
    let file,reason;

    if(day===8||input.ending)
      return null; // Preserve all existing endings and extraordinary scenes.

    if(worst.value>=3&&second.value>=3){
      const pair=[worst,second].sort((a,b)=>a.index-b.index);
      const severe=worst.value>=4; // severe means the leading issue is severe; secondary may remain moderate
      file='main-'+pair[0].name+'-'+pair[1].name+'-'+(severe?'severe':'moderate')+'.webp';
      reason='two-current-issues';
    }else if(worst.value>=2){
      file='main-'+worst.name+'-'+(worst.value>=4?'severe':worst.value===3?'moderate':'mild')+'.webp';
      reason='dominant-current-issue';
    }else if(input.attraction<=3){
      file='main-base-underused.webp';reason='low-footfall';
    }else if(input.attraction>=8){
      file='main-base-busy.webp';reason='high-footfall';
    }else if(sum<=2&&input.attraction>=5){
      file='main-base-orderly.webp';reason='quiet-well-run-floor';
    }else{
      file='main-base-neutral.webp';reason='ordinary-floor';
    }
    if(!MAIN_FILES.includes(file))throw Error('Missing F1 main-scene target: '+file);
    return Object.freeze({file,reason,main:true});
  }

  /*
   * Integration bridge: use s.visuals (completed measures), not s.actionCounts
   * (measures chosen before the next opening). Dedicated horror scenes continue
   * to be routed by the existing game.
   * Structural fixtures require P2 inspection. Do not treat these flags as
   * proof that the new photography consistently depicts the installed fixture.
   */
  const FIXTURES=Object.freeze({
    register:'additional-register',
    self:'self-checkout',
    pickup:'pickup-counter',
    compact:'narrow-display-shelves',
    weekendStore:'renovated-layout'
  });
  const P1_FILES=Object.freeze([
    'main-base-neutral.webp',
    'main-checkout-mild.webp',
    'main-checkout-aisle-severe.webp'
  ]);
  const P2_FILES=Object.freeze([
    'main-checkout-moderate.webp',
    'main-improved-register-added.webp',
    'main-noise-severe.webp'
  ]);
  const COMPLETED_FILES=Object.freeze([...P1_FILES,...P2_FILES]);
  const P3_FILES=Object.freeze(MAIN_FILES.filter(x=>!COMPLETED_FILES.includes(x)));
  if(MAIN_FILES.length!==28||PRODUCTION_FILES.length!==29||
     P3_FILES.length!==23||new Set(PRODUCTION_FILES).size!==29)
    throw Error('P3 reduced production manifest is inconsistent');
  function resolveGameState(state){
    if(!state||typeof state!=='object')throw Error('Game state required');
    if(state.day===8||state.day8Active
      ||(state.day===7&&state.odd>=3&&!state.finish)
      ||String(state.ending||'').startsWith('odd_'))return null;
    if((state.appliedToday||[]).some(x=>x.id==='audit'&&x.kind==='odd')
      &&state.day<=5)return null;
    const completed=(state.visuals||[])
      .filter(x=>x&&Number.isInteger(x.day)&&x.day<=state.day&&typeof x.id==='string')
      .map(x=>x.id);
    const scene=resolve({
      complaints:state.vals,attraction:state.attraction,day:state.day,
      completedActions:completed,
      ending:state.ending,endingReason:state.endingReason
    });
    if(!scene)return null;
    const fixtures=[...new Set(completed.filter(id=>FIXTURES[id]).map(id=>FIXTURES[id]))];
    // Main photos are intentionally fixture-neutral. The list below is
    // retained as disclosure for QA, not a blocker for scene selection.
    return Object.freeze({
      ...scene,derivedFrom:'current-complaint-state',
      fixtureReview:Object.freeze(fixtures),
      requiresFixtureQA:false,
      fixturesReportedSeparately:fixtures.length>0
    });
  }
  function transitionPhotoForGameState(state){
    if(!state||state.day8Active||state.odd>0||state.finish)return null;
    // The 4th register is shown once as a tightly framed implementation
    // report, NOT as the panoramic store scene that changes daily.
    // The regular scene deliberately remains the fixed-camera shop view.
    return Array.isArray(state.appliedToday)&&state.appliedToday.some(x=>x.id==='register')
      ?Object.freeze({file:'main-improved-register-added.webp',
        context:'result-detail',crop:'extra-register',oneTime:true}):null;
  }
  function operationalIndicators(state){
    const completed=(state?.visuals||[]).filter(x=>x&&
      Number.isInteger(x.day)&&x.day<=state.day).map(x=>x.id);
    return Object.freeze({
      registerInstalled:completed.includes('register'),
      selfCheckoutInstalled:completed.includes('self'),
      pickupCounterInstalled:completed.includes('pickup'),
      // No invented queue wait time: live complaint counts are the data.
      complaints:Array.isArray(state?.vals)?Object.freeze([...state.vals]):null
    });
  }
  function assetCoverage(present,phase){
    const requested={
      P1:P1_FILES,P2:P2_FILES,P3:P3_FILES,MAIN:MAIN_FILES,
      PRODUCTION:PRODUCTION_FILES,ALL:FILES
    }[phase];
    if(!requested)throw Error('phase must be P1, P2, P3, MAIN, PRODUCTION, or ALL');
    if(!Array.isArray(present))throw Error('Available filenames array required');
    const supplied=new Set(present);
    const missing=requested.filter(x=>!supplied.has(x));
    return Object.freeze({
      phase,total:requested.length,present:requested.length-missing.length,
      missing:Object.freeze(missing),ready:missing.length===0
    });
  }
  return Object.freeze({
    AXES:Object.freeze(AXES),FILES,MAIN_FILES,RESULT_FILES,PRODUCTION_FILES,
    P1_FILES,P2_FILES,P3_FILES,COMPLETED_FILES,
    FIXTURES,resolve,resolveGameState,transitionPhotoForGameState,
    operationalIndicators,assetCoverage
  });
});
