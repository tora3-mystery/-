/* F1 v0.16 business-engine browser acceptance QA (adapted for v0.17+ phrase-first choices). Run with Playwright. */
'use strict';
const assert=require('node:assert/strict');
const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const shots=process.env.F1_QA_SHOTS||'/private/tmp/f1-v016-qa';
fs.mkdirSync(shots,{recursive:true});
const mime={'.html':'text/html; charset=utf-8','.jpg':'image/jpeg','.webp':'image/webp','.js':'text/javascript'};
const server=http.createServer((req,res)=>{
 const target=path.resolve(root,'.'+decodeURIComponent((req.url||'/index.html').split('?')[0]));
 if(!target.startsWith(root+path.sep)){res.writeHead(403).end();return}
 fs.readFile(target,(e,data)=>{if(e){res.writeHead(404).end();return}res.writeHead(200,{'Content-Type':mime[path.extname(target)]||'application/octet-stream'}).end(data)});
});
const browserErrors=[];
const visible=async(page,sel)=>assert(await page.locator(sel).isVisible(),sel+' should be visible');
const state=page=>page.evaluate(()=>window.__F1_DEBUG__.getState());
async function select(page,id){
  // Older scenario tests isolate business and horror mechanics; v0171 checks true complaint discovery.
  await page.evaluate(id=>{
   const d=window.__F1_DEBUG__;
   if(id==='inspectBack')d.focus('f17-back-review','裏手の社の周りが暗く');
   if(!d.availableIds().includes(id)&&!['audit','camera0','open0','shrine','removeShrine','idle'].includes(id)){
    const st=d.getState();d.setState({...st,discoveredActions:[...new Set([...(st.discoveredActions||[]),id])]});
   }
  },id);
  const actions=await page.evaluate(()=>window.__F1_DEBUG__.getAvailableActions());
  const action=actions.find(a=>a.id===id);assert(action,`DAY ${(await state(page)).day}: ${id} unavailable`);
  const main=page.locator('#actions .action').filter({hasText:action.name}).first();
  const extra=page.locator('#moreActionsBody .action').filter({hasText:action.name}).first();
  if(await main.count())await main.click();
  else{
    assert(await extra.count(),`Discovered action ${id} missing from DOM`);
    await page.locator('#moreActions summary').click();
    await extra.click();
  }
  await visible(page,'#overlay');await page.locator('#next').click();
  if(await page.locator('#dayTransition').isVisible())await page.locator('#transitionContinue').click();
}
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const browser=await chromium.launch({headless:true,executablePath:process.env.F1_CHROME||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
 let checks=0;
 try{
  const url=`http://127.0.0.1:${server.address().port}/index.html`;
  for(const width of [320,390,768,1280]){
   const context=await browser.newContext({viewport:{width,height:width===320?760:844},deviceScaleFactor:1});
   const page=await context.newPage();page.on('pageerror',e=>browserErrors.push(String(e)));
   await page.goto(url);await visible(page,'#intro');
   assert((await page.locator('#intro').innerText()).includes('仕事は2つだけ'));
   await page.screenshot({path:path.join(shots,`intro-${width}.png`),fullPage:true});
   await page.locator('#start').click();await visible(page,'#game');
   assert.equal(await page.locator('#actions .action').count(),2);
   assert.equal(await page.locator('#moneyDetail').innerText(),'本部目標：今週の売上500万円');
   const layout=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth-innerWidth,
    minTap:Math.min(...[...document.querySelectorAll('#actions .action')].map(x=>x.getBoundingClientRect().height)),
    image:document.querySelector('#storeImage').naturalWidth,src:document.querySelector('#storeImage').getAttribute('src')}));
   assert(layout.overflow<=2,`${width}px overflow ${layout.overflow}`);assert(layout.minTap>=44);assert(layout.image>0);assert(layout.src.endsWith('.webp'));
   await page.screenshot({path:path.join(shots,`day1-${width}.png`),fullPage:true});
   await page.locator('#actions .action').first().click();await visible(page,'#overlay');
   await page.locator('#undo').click();assert.equal((await state(page)).day,1);
   await page.locator('#actions .action').last().click();await page.reload();await visible(page,'#intro');
   await page.locator('#resume').click();await visible(page,'#overlay');
   await page.locator('#next').click();await visible(page,'#dayTransition');
   await page.locator('#transitionContinue').click();assert.equal((await state(page)).day,2);
   await page.locator('#help').click();await visible(page,'#backToGame');await page.locator('#backToGame').click();
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)<=2,true);
   checks+=9;await context.close();
  }
  const context=await browser.newContext({viewport:{width:390,height:844}});
  const page=await context.newPage();page.on('pageerror',e=>browserErrors.push(String(e)));await page.goto(url);
  await page.locator('#start').click();
  const images=await page.evaluate(async()=>{const files=['scene-checkout-normal.webp','scene-checkout-added.webp','scene-checkout-overflow.webp','scene-aisle-cleared.webp','scene-stock-empty.webp','scene-stock-replenished.webp','scene-stock-work-crowd.webp','scene-quiet-floor.webp','scene-renovated-floor.webp','scene-false-stock-sign.webp','scene-date-label.webp','scene-owner-inspection.webp','scene-shrine-back.webp','scene-day8-floor.webp','scene-complaint-box-close.webp','scene-day8-strange.webp'];return Promise.all(files.map(file=>new Promise(resolve=>{const i=new Image();i.onload=()=>resolve([file,i.naturalWidth,i.naturalHeight]);i.onerror=()=>resolve([file,0,0]);i.src='./assets/'+file}))) });
  assert(images.every(x=>x[1]===1100&&x[2]===619));checks++;
  await select(page,'register');assert((await page.locator('#storeImage').getAttribute('src')).includes('scene-checkout-added.webp'));
  await visible(page,'#sceneSide');assert((await page.locator('#sceneSideText').innerText()).includes('通路'));checks+=3;
  assert((await page.evaluate(()=>window.__F1_DEBUG__.availableIds())).includes('queueLane'));checks++;
  const graySeeds=await page.evaluate(()=>{
   const d=window.__F1_DEBUG__,seeds={};
   for(let seed=0;seed<200&&Object.keys(seeds).length<2;seed++){
    d.restart();d.setState({...d.getState(),discoveredActions:['pickup','complaintHide']});d.play('pickup');d.advance();d.closeTransition();
    d.setState({...d.getState(),grayAuditSeed:seed});d.play('complaintHide');
    const detected=d.getState().jobs.find(x=>x.grayAudit)?.detected;
    seeds[detected?'detected':'undetected']??=seed;
   }
   return seeds;
  });
  assert(Number.isInteger(graySeeds.detected)&&Number.isInteger(graySeeds.undetected));
  for(const outcome of ['detected','undetected']){
   await page.evaluate(()=>window.__F1_DEBUG__.restart());await select(page,'pickup');
   await page.evaluate(seed=>window.__F1_DEBUG__.setState({...window.__F1_DEBUG__.getState(),grayAuditSeed:seed}),graySeeds[outcome]);
   await select(page,'complaintHide');
   const actions=await page.evaluate(()=>window.__F1_DEBUG__.getAvailableActions());
   await page.locator('#actions .action').filter({hasText:'何も対策しない'}).click();
   await page.locator('#next').click();await visible(page,'#dayTransition');
   assert.equal(await page.locator('#transitionAudit').isVisible(),outcome==='detected');
   const result=await state(page);assert.equal(result.auditEvents.length,outcome==='detected'?1:0);
   if(outcome==='detected'){
    assert((await page.locator('#transitionImage').getAttribute('src')).includes('scene-owner-inspection.webp'));
    await page.screenshot({path:path.join(shots,'gray-owner-guidance.png'),fullPage:true});
   }
   await page.locator('#transitionContinue').click();checks+=3;
  }
  await page.evaluate(()=>window.__F1_DEBUG__.restart());
  for(const id of ['pickup','vibration','floorcheck','delivery','quietDesk','display','receive'])await select(page,id);
  assert.equal((await state(page)).ending,'normal_success');await page.screenshot({path:path.join(shots,'normal-success.png'),fullPage:true});checks+=8;
  await page.evaluate(()=>window.__F1_DEBUG__.restart());
  const initial=(await state(page)).vals.reduce((a,b)=>a+b,0);
  for(let i=0;i<7&&!(await state(page)).finish;i++)await select(page,'idle');
  assert.equal((await state(page)).ending,'normal_strain');assert((await state(page)).complaintTickets.length>initial);checks+=2;
  await page.evaluate(()=>window.__F1_DEBUG__.restart());
  for(const id of ['pickup','inspectBack','audit','camera0','open0'])await select(page,id);
  assert.equal((await state(page)).day,6);assert.equal((await state(page)).odd,3);
  const letters=await page.locator('#complaintBoard .complaint-letter').allInnerTexts();
  assert(letters.filter(x=>x.includes('レジのご案内が丁寧でした。ありがとうございました。')).length===10);
  await page.screenshot({path:path.join(shots,'day6-ten-posts.png'),fullPage:true});checks+=3;
  await select(page,'idle');assert.equal((await state(page)).day,7);
  assert.equal(await page.locator('#complaintBoard .complaint-letter').count()>0,true);
  assert(!(await page.locator('#complaintBoard').innerText()).includes('レジのご案内が丁寧でした。ありがとうございました。'));
  await page.screenshot({path:path.join(shots,'day7-normal.png'),fullPage:true});checks+=3;
  await select(page,'idle');assert.equal((await state(page)).day,8);await visible(page,'#day8Panel');
  assert((await page.locator('#day8Image').getAttribute('src')).includes('scene-day8-floor.webp'));
  await page.screenshot({path:path.join(shots,'day8-stage0.png'),fullPage:true});
  await page.locator('#day8Next').click();assert((await page.locator('#day8Image').getAttribute('src')).includes('scene-day8-strange.webp'));
  assert((await page.locator('#day8Message').innerText()).includes('会計件数88件'));
  await page.screenshot({path:path.join(shots,'day8-stage1.png'),fullPage:true});
  await page.reload();await page.locator('#resume').click();await visible(page,'#day8Panel');
  await page.locator('#day8Next').click();await page.locator('#day8Next').click();
  assert.equal((await state(page)).ending,'odd_day8');await page.screenshot({path:path.join(shots,'day8-ending.png'),fullPage:true});checks+=8;
  await page.evaluate(()=>window.__F1_DEBUG__.restart());
  await page.evaluate(()=>window.__F1_DEBUG__.setState({day:4,grayStrikes:1,grayFines:20,grayUsed:['complaintHide'],grayAuditSeed:0,jobs:[{id:'dateShift-risk',name:'後日の苦情・発覚確認',delta:[0,0,2,1],finishDay:5,grayAudit:true,sourceAction:'dateShift',detected:true}],days:[{day:1,sales:50},{day:2,sales:60},{day:3,sales:70}],revenue:180}));
  await select(page,'idle');assert.equal((await state(page)).endingReason,'重大な不正発覚による解任');
  assert((await page.locator('#ending').innerText()).includes('オーナー通知'));await page.screenshot({path:path.join(shots,'gray-dismissal.png'),fullPage:true});checks+=2;
  assert.equal(browserErrors.length,0,browserErrors.join('\n'));checks++;
  console.log(JSON.stringify({result:'PASS',checks,viewports:[320,390,768,1280],images:images.length,screenshots:shots},null,2));
  await context.close();
 }finally{await browser.close();await new Promise(resolve=>server.close(resolve))}
})().catch(e=>{console.error(e.stack||e);server.close();process.exitCode=1});
