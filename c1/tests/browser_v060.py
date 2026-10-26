#!/usr/bin/env python3
"""Local Chromium QA for C1 v0.6.0. Run with an installed Playwright Python and browser."""
import argparse
import functools
import http.server
import pathlib
import threading
from playwright.sync_api import sync_playwright

C1=pathlib.Path(__file__).resolve().parents[1]
EVENTS=__import__('json').loads((C1/'events.json').read_text())['events']
ASSETS=sorted((C1/'assets').glob('*.webp'))

class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*args):
        pass

def saved(page):
    return page.evaluate("JSON.parse(localStorage.getItem('arg_c1_save_v04'))")

def run(shots=None):
    server=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Quiet,directory=str(C1)))
    threading.Thread(target=server.serve_forever,daemon=True).start()
    url=f'http://127.0.0.1:{server.server_port}/'
    try:
        with sync_playwright() as pw:
            browser=pw.chromium.launch(headless=True)
            try:
                for width,height in [(320,740),(390,844),(1280,900)]:
                    context=browser.new_context(viewport={'width':width,'height':height})
                    page=context.new_page()
                    errors=[]
                    page.on('pageerror',lambda error:errors.append(str(error)))
                    page.goto(url,wait_until='networkidle')
                    assert page.locator('[data-action="start"]').is_visible()
                    page.locator('[data-action="start"]').click()
                    assert page.locator('.profile-section').count()>=3
                    assert page.locator('.profile-type').count()==1
                    assert page.locator('.profile-grid .info').count()>=9
                    assert page.locator('.portrait img').first.evaluate('(img)=>img.complete&&img.naturalWidth>0')
                    assert page.evaluate('document.documentElement.scrollWidth-innerWidth')<=2
                    if shots: page.screenshot(path=str(shots/f'c1-profile-{width}.png'),full_page=True)
                    identity=saved(page)['profile']
                    page.reload(wait_until='networkidle')
                    page.locator('[data-action="resume"]').click()
                    assert identity==saved(page)['profile']
                    page.locator('[data-action="begin"]').click()
                    assert page.locator('[data-action="begin-day"]').is_visible()
                    # The 0.5.9 save format has no narrative fields; it must still resume unchanged.
                    page.evaluate("""() => {const key='arg_c1_save_v04',s=JSON.parse(localStorage.getItem(key));
                      s.version='0.5.9';for(const k of ['typeId','typeName','hobby','workHabit','weakness','episode'])delete s.profile[k];
                      localStorage.setItem(key,JSON.stringify(s));}""")
                    page.reload(wait_until='networkidle')
                    page.locator('[data-action="resume"]').click()
                    assert saved(page)['profile']['name']==identity['name']
                    assert saved(page)['profile']['career']==identity['career']
                    assert page.locator('[data-action="begin-day"]').is_visible()
                    loaded=page.evaluate("""async names=>Promise.all(names.map(name=>new Promise(resolve=>{
                      const img=new Image();img.onload=()=>resolve(true);img.onerror=()=>resolve(false);img.src='./assets/'+name;
                    })))""",[p.name for p in ASSETS])
                    assert len(ASSETS)==13 and all(loaded),f'{width}px: portrait missing'
                    assert not errors,f'{width}px JS errors: {errors}'
                    context.close()

                context=browser.new_context(viewport={'width':390,'height':844})
                page=context.new_page()
                errors=[]
                page.on('pageerror',lambda error:errors.append(str(error)))
                page.goto(url,wait_until='networkidle')
                page.locator('[data-action="start"]').click()
                page.locator('[data-action="begin"]').click()
                count=0
                while count<50:
                    state=saved(page)
                    if state['phase']=='ending':break
                    if state['phase']=='briefing':
                        page.locator('[data-action="begin-day"]').click()
                    elif state['phase']=='scene':
                        e=EVENTS[state['index']]
                        alternate=state.get('eventPlan',[])
                        variants=e.get('alternates',[])
                        variant=variants[alternate[state['index']]-1] if alternate and 0<alternate[state['index']]<=len(variants) else e
                        choices=variant['choices']
                        chosen=min(choices,key=lambda c:0 if c['harassment'].endswith('疑義') else c['cp'])
                        page.locator(f'[data-choice="{chosen["id"]}"]').click()
                        assert page.locator('.result-card').is_visible()
                    elif state['phase'] in ('result','dayReview'):
                        page.locator('[data-action="next"]').click()
                    else: raise AssertionError(f'unexpected phase {state["phase"]}')
                    count+=1
                state=saved(page)
                assert state['phase']=='ending' and state['ending'] in [f'E{i:02}' for i in range(1,17)]
                assert len(state['logs'])==15,f'play ended early: {len(state["logs"])}'
                assert page.locator('.end-banner').is_visible()
                assert page.evaluate('document.documentElement.scrollWidth-innerWidth')<=2
                if shots:page.screenshot(path=str(shots/'c1-ending-390.png'),full_page=True)
                for index in range(12):
                    expected=page.evaluate("""async index=>{
                      const {createProfile,PROFILE_TYPES}=await import('./engine.mjs?v=0.6.0');
                      let draw=0;const profile=createProfile(()=>draw++===1?(index+0.5)/12:0.5);
                      const key='arg_c1_save_v04',s=JSON.parse(localStorage.getItem(key));
                      s.profile=profile;s.phase='ending';s.ending='E11';s.growth=10;s.cp=0;
                      localStorage.setItem(key,JSON.stringify(s));return PROFILE_TYPES[index].thanks;
                    }""",index)
                    page.reload(wait_until='networkidle')
                    page.locator('[data-action="resume"]').click()
                    assert expected in page.locator('.mini-employee .quote').inner_text(),f'type {index}: gratitude mismatch'
                    assert not errors,f'type {index}: JS errors {errors}'
                assert not errors,f'full play JS errors: {errors}'
                context.close()
                print('PASS C1 Chromium: 320/390/1280px profiles, save/reload, 0.5.9 resume, 13 images, 15-job playthrough, 12 character-specific thanks, no horizontal overflow or JS exceptions.')
            finally:browser.close()
    finally:server.shutdown();server.server_close()

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--shots',type=pathlib.Path);args=parser.parse_args()
    if args.shots:args.shots.mkdir(parents=True,exist_ok=True)
    run(args.shots)
