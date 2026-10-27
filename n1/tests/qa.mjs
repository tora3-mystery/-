import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const { chromium } = await import(process.env.PLAYWRIGHT_ENTRY || 'playwright');
const baseUrl = process.env.N1_URL || 'http://127.0.0.1:4173/n1/';
const outputDir = path.resolve('n1/tests/screenshots');
await mkdir(outputDir, { recursive: true });

const report = {
  baseUrl,
  startedAt: new Date().toISOString(),
  checks: [],
  viewports: [],
  fullRuns: [],
  consoleErrors: [],
  pageErrors: []
};
const check = (name, ok, detail = '') => {
  report.checks.push({ name, ok, detail });
  if (!ok) throw new Error(`${name}: ${detail}`);
};

const browser = await chromium.launch({
  headless: true,
  ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {})
});
try {
  for (const width of [320, 390, 768, 1280]) {
    const height = width <= 390 ? 844 : width === 768 ? 1024 : 800;
    const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 2 });
    page.on('console', msg => { if (msg.type() === 'error') report.consoleErrors.push({ width, text: msg.text() }); });
    page.on('pageerror', error => report.pageErrors.push({ width, text: error.message }));
    await page.goto(baseUrl, { waitUntil: 'networkidle' });
    check(`intro visible ${width}`, await page.getByRole('heading', { name: /正確に/ }).isVisible(), 'intro title');
    await page.locator('#start').click();
    await page.evaluate(() => { state.i = 1; state.phase = 'ask'; render(); });
    await page.locator('.product-zoom img').waitFor({ state: 'visible' });
    const metrics = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      portraitNatural: document.querySelector('.portrait img')?.naturalWidth || 0,
      productNatural: document.querySelector('.product-zoom img')?.naturalWidth || 0,
      productRect: Math.round(document.querySelector('.product-zoom img')?.getBoundingClientRect().width || 0)
    }));
    check(`no horizontal overflow ${width}`, metrics.scrollWidth <= metrics.clientWidth, JSON.stringify(metrics));
    check(`high-res portrait ${width}`, metrics.portraitNatural >= 1024, JSON.stringify(metrics));
    check(`product rendered ${width}`, metrics.productNatural >= 200 && metrics.productRect >= Math.min(220, width - 88), JSON.stringify(metrics));
    await page.locator('.product-zoom').click();
    check(`product zoom opens ${width}`, await page.locator('.productbox').isVisible(), 'zoom dialog');
    await page.getByRole('button', { name: '閉じる ×' }).click();
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(100);
    const screenshot = path.join(outputDir, `n1-v060-${width}px.jpg`);
    await page.screenshot({ path: screenshot, type: 'jpeg', quality: 78, fullPage: false });
    report.viewports.push({ width, height, screenshot: path.relative('.', screenshot), metrics });
    await page.close();
  }

  // Independently load every delivered category illustration at its actual browser path.
  {
    const catalogPage=await browser.newPage();
    await catalogPage.goto(baseUrl,{waitUntil:'domcontentloaded'});
    const images=await catalogPage.evaluate(async()=>Promise.all(window.N1Catalog.deliveredKeys.map(key=>new Promise(resolve=>{
      const im=new Image();
      im.onload=()=>resolve({key,ok:im.naturalWidth===800&&im.naturalHeight===600,w:im.naturalWidth,h:im.naturalHeight});
      im.onerror=()=>resolve({key,ok:false,error:'image-load-failed'});
      im.src='assets/catalog/'+key+'-neutral.webp';
    }))));
    check('all 32 WebP images load at 800x600',images.length===32&&images.every(img=>img.ok),JSON.stringify(images.filter(img=>!img.ok)));
    report.catalogImages=images;
    await catalogPage.close();
  }

  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  page.on('console', msg => { if (msg.type() === 'error') report.consoleErrors.push({ width: 390, text: msg.text() }); });
  page.on('pageerror', error => report.pageErrors.push({ width: 390, text: error.message }));
  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await page.locator('#start').click();

  for (const value of ['', '0', '-1', '1.5', '999999999999']) {
    await page.locator('#number').fill(value);
    await page.locator('#submit').click();
    check(`invalid input rejected ${JSON.stringify(value)}`, await page.locator('#number').getAttribute('aria-invalid') === 'true', await page.locator('#err').innerText());
  }
  await page.locator('#hint').click();
  check('hint decremented', (await page.locator('#hint').innerText()).includes('残2'), await page.locator('#hint').innerText());
  await page.getByRole('button', { name: '会話ログ' }).click();
  check('log opens', await page.locator('.logbox').isVisible(), 'log dialog');
  await page.getByRole('button', { name: '閉じる ×' }).click();

  for (let run = 1; run <= 3; run++) {
    const seen = [];
    for (let question = 0; question < 10; question++) {
      const data = await page.evaluate(() => {
        const q = plan.questions[state.i];
        return { item: q.item, truth: q.truth, unit: q.unit, zone: q.zone, person: q.person };
      });
      seen.push(data.item);
      await page.locator('#number').fill(String(data.truth));
      await page.locator('#submit').click();
      check(`run ${run} q${question + 1} exact score`, (await page.locator('.score').innerText()).includes('100'), data.item);
      await page.locator('#next').click();
      if (question % 2 === 1 && question < 9) {
        check(`run ${run} daybreak ${question}`, await page.getByText('本日の合計').isVisible(), 'daybreak');
        await page.locator('#nextDay').click();
      }
    }
    check(`run ${run} reaches ending`, await page.getByText('ONE WEEK COMPLETE', { exact: false }).isVisible(), 'ending');
    const recurrence = await page.evaluate(() => ({
      q2: results.find(x=>x.legacyIndex===1)?.truth,
      q9Base: results.find(x=>x.legacyIndex===1)?.truth,
      q8: results.find(x=>x.legacyIndex===7)?.truth,
      q10: results.find(x=>x.legacyIndex===11)?.truth,
      productQ2: plan.questions.find(q=>q.legacyIndex===1)?.productId,
      productQ9: plan.questions.find(q=>q.legacyIndex===8)?.productId,
      productQ8: plan.questions.find(q=>q.legacyIndex===7)?.productId,
      productQ10: plan.questions.find(q=>q.legacyIndex===11)?.productId,
      count: results.length
    }));
    check(`run ${run} q2 to q9 recurrence`, recurrence.q2 === recurrence.q9Base && recurrence.productQ2 === recurrence.productQ9, JSON.stringify(recurrence));
    check(`run ${run} q8 to q10 recurrence`, recurrence.q8 === recurrence.q10 && recurrence.productQ8 === recurrence.productQ10, JSON.stringify(recurrence));
    check(`run ${run} has 10 answers`, recurrence.count === 10, JSON.stringify(recurrence));
    report.fullRuns.push({ run, seen, recurrence });
    if (run < 3) await page.getByRole('button', { name: /別の数字で/ }).click();
  }

  // Test timeout semantics directly, avoiding a 15-second delay in the QA runner.
  await page.evaluate(() => { timedMode=true; initRound(); screen='play'; state.phase='ready'; render(); });
  await page.locator('#beginAnswer').click();
  await page.evaluate(() => timeoutAnswer());
  const timeoutResult=await page.evaluate(() => ({phase:state.phase, count:results.length, timeout:results[0]?.timeout, score:results[0]?.score}));
  check('timed mode: timeout creates one zero-point answer',timeoutResult.phase==='result'&&timeoutResult.count===1&&timeoutResult.timeout&&timeoutResult.score===0,JSON.stringify(timeoutResult));

  const matrix = await page.evaluate(() => {
    const rows = [];
    for (let k = 0; k < 3; k++) {
      const keys = Array(12).fill(k);
      const questions = window.N1ScenarioV04.createPlan(build, keys).questions;
      for (const q of questions) {
        const exact = score(q.truth, q);
        const airValue = Math.round((q.zone[0] + q.zone[1]) / 2);
        const air = score(airValue, q);
        const below = score(Math.max(q.min, q.truth - 1), q);
        const above = score(Math.min(q.max, q.truth + 1), q);
        rows.push({ index: q.index + 1, legacyIndex: q.legacyIndex, variation: k,
          truth: q.truth, zone: q.zone, mode: q.mode, exact: exact.score,
          socialScore: air.score, below: below.score, above: above.score,
          min: q.min, max: q.max, opening: q.opening, item: q.item, source: q.source });
      }
    }
    return rows;
  });
  check('30 variants produced', matrix.length === 30, String(matrix.length));
  check('30 exact answers score 100', matrix.every(row => row.exact === 100), JSON.stringify(matrix.filter(row => row.exact !== 100)));
  check('social air-zone answers score 100', matrix.filter(row=>row.mode !== 'facts').every(row => row.socialScore === 100), 'social-band score');
  check('fact one-off answers never score 100', matrix.filter(row=>row.mode === 'facts').every(row => row.below < 100 && row.above < 100), 'strict fact quiz grade');
  check('30 variants have openings', matrix.every(row => row.opening && row.opening.length >= 10), 'opening presence');
  report.variantMatrix = matrix;
  await page.close();

  check('no console errors', report.consoleErrors.length === 0, JSON.stringify(report.consoleErrors));
  check('no page errors', report.pageErrors.length === 0, JSON.stringify(report.pageErrors));
} finally {
  report.finishedAt = new Date().toISOString();
  report.passed = report.checks.every(row => row.ok);
  await writeFile('n1/tests/qa-report-v060.json', JSON.stringify(report, null, 2));
  await browser.close();
}

console.log(JSON.stringify({ passed: report.passed, checks: report.checks.length, viewports: report.viewports.length, fullRuns: report.fullRuns.length, variants: report.variantMatrix?.length || 0 }, null, 2));
