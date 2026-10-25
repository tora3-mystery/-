#!/usr/bin/env python3
"""F1 v0.9 browser acceptance smoke test. Run from repo root:
  python -m pip install playwright
  python -m playwright install chromium
  python f1/tests/v09_browser_smoke.py --screenshots

Runs a local HTTP server against f1/ (NOT GitHub Pages).
Browser tests are NOT substitutes for verifying the live deployed URL.
"""
import argparse
import functools
import http.server
import pathlib
import threading
from playwright.sync_api import sync_playwright

F1_DIR=pathlib.Path(__file__).resolve().parents[1]
ROUTES={
    "N1":(["pickup","delivery","vibration","forecast","register","rest","floorcheck"],"normal_success"),
    "N2":(["pickup","vibration","farmer","rest","display","gourmet","discount"],"normal_customer"),
    "N3":(["pickup","quiet","display","quiet","floorcheck","quiet","floorcheck"],"normal_strain"),
    "CLOSE":(["discount","sampling","gourmet","sale"],"normal_strain"),
    "DISMISS":(["quiet","lane","early","limit","early"],"normal_strain"),
    "X1":(["register","delivery","audit","camera0","open0","glitch6","display"],"odd_stop"),
    "X2":(["floorcheck","display","quiet","delivery","audit","camera0","discount"],"odd_missing"),
    "X3":(["discount","receive","audit","camera0","open0","glitch6","ticket"],"odd_day8"),
    "X4":(["quiet","delivery","audit","camera0","open0","glitch6","ticket"],"odd_hidden")
}
SCENES=[
    "store-normal.jpg","store-queue.jpg","store-aisle.jpg","store-stock.jpg","store-noise.jpg",
    "store-thriving.jpg","store-popular-chaos.jpg","store-underused.jpg","store-declining.jpg",
    "store-construction.jpg","store-odd1.jpg","store-odd2.jpg","store-odd3.jpg",
    "store-human-day.jpg","store-closed.jpg"
]

class SilentHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, fmt, *args):
        return

def run_test(screenshots):
    handler=functools.partial(SilentHandler,directory=str(F1_DIR))
    server=http.server.ThreadingHTTPServer(("127.0.0.1",0),handler)
    threading.Thread(target=server.serve_forever,daemon=True).start()
    address=f"http://127.0.0.1:{server.server_port}/index.html"
    shots=F1_DIR/"tests"/"artifacts"
    if screenshots: shots.mkdir(parents=True,exist_ok=True)
    total=0
    try:
        with sync_playwright() as p:
            browser=p.chromium.launch(headless=True)
            try:
                for width,height in [(320,760),(390,844),(768,900),(1280,800)]:
                    context=browser.new_context(viewport={"width":width,"height":height},device_scale_factor=1)
                    page=context.new_page()
                    errors=[]
                    page.on("pageerror",lambda error: errors.append(str(error)))
                    page.goto(address,wait_until="domcontentloaded")
                    page.locator("#start").click()
                    assert page.locator("#actions .action").count()==6, f"{width}px: first day not 6 choices"
                    assert page.locator("#cash").inner_text().strip()=="7", f"{width}px: attraction not shown"
                    assert page.locator("#total").inner_text().strip()=="50万円", f"{width}px: revenue not shown"
                    page.locator("#storeImage").evaluate("el=>el.decode().catch(()=>null)")
                    assert page.locator("#storeImage").evaluate("el=>el.naturalWidth>0"),f"{width}px: store image/fallback not loaded"
                    assert page.locator("#storeImage").get_attribute("src").startswith("./assets/"),f"{width}px: JPEG fell back to SVG"
                    photos=page.evaluate("""async files=>Promise.all(files.map(file=>new Promise(resolve=>{
                      const image=new Image();
                      image.onload=()=>resolve({file,width:image.naturalWidth,height:image.naturalHeight,ok:true});
                      image.onerror=()=>resolve({file,width:0,height:0,ok:false});
                      image.src='./assets/'+file;
                    })))""",SCENES)
                    for photo in photos:
                        assert photo["ok"],f"{width}px: failed to load {photo['file']}"
                        assert (photo["width"],photo["height"])==(1100,619),f"{width}px: bad dimensions {photo}"
                    overflow=page.evaluate("()=>document.documentElement.scrollWidth-window.innerWidth")
                    assert overflow<=2, f"{width}px: horizontal overflow {overflow}px"
                    if screenshots: page.screenshot(path=str(shots/f"f1-day1-{width}.png"),full_page=True)
                    page.locator("#actions .action").first.click()
                    assert page.locator("#overlay").is_visible()
                    page.reload(wait_until="domcontentloaded")
                    assert page.locator("#overlay").is_visible(),f"{width}px: daily report lost on reload"
                    assert "1/7" in page.locator("#day").inner_text()
                    page.locator("#next").click()
                    assert "2/7" in page.locator("#day").inner_text(),f"{width}px: next day"
                    assert page.locator("#complaintSummary").inner_text()
                    assert not errors, f"{width}px JS exceptions: {errors}"
                    context.close()
                    total+=1
                context=browser.new_context(viewport={"width":390,"height":844},device_scale_factor=1)
                page=context.new_page()
                errors=[]
                page.on("pageerror",lambda error: errors.append(str(error)))
                page.goto(address,wait_until="domcontentloaded")
                for label,(route,expected) in ROUTES.items():
                    page.evaluate("()=>window.__F1_DEBUG__.restart()")
                    for day,action in enumerate(route,1):
                        state=page.evaluate("()=>window.__F1_DEBUG__.getState()")
                        ids=page.evaluate("()=>window.__F1_DEBUG__.availableIds()")
                        assert len(ids)==6,f"{label}: day {day} options {ids}"
                        assert action in ids,f"{label}: day {day} unavailable {action}"
                        if action=="glitch6":
                            assert ids==["glitch6"]*6, f"{label}: Saturday needs 6 identical choices"
                        page.evaluate("(id)=>window.__F1_DEBUG__.play(id)",action)
                        page.evaluate("()=>window.__F1_DEBUG__.advance()")
                    if label=="X1":
                        page.evaluate("()=>window.__F1_DEBUG__.finalDecision('stop')")
                    elif label=="X2":
                        page.evaluate("()=>window.__F1_DEBUG__.finalDecision('customer')")
                    elif label=="X3":
                        page.evaluate("()=>window.__F1_DEBUG__.finalDecision('day8')")
                        assert page.locator("#day8Panel").is_visible()
                        page.evaluate("()=>window.__F1_DEBUG__.finishDay8('close')")
                    elif label=="X4":
                        buttons=page.locator("#finalEvidenceList button")
                        assert buttons.count()==3,"X4 evidence items missing"
                        for i in range(3): buttons.nth(i).click()
                        page.evaluate("()=>window.__F1_DEBUG__.startInference()")
                        page.evaluate("()=>window.__F1_DEBUG__.resolveInference('self','yesterday')")
                    state=page.evaluate("()=>window.__F1_DEBUG__.getState()")
                    assert state["ending"]==expected,f"{label}: ended in {state['ending']} expected {expected}"
                    assert state["finish"],f"{label}: game not finished"
                    assert page.locator("#ending").is_visible(),f"{label}: ending not rendered"
                    if screenshots: page.screenshot(path=str(shots/f"f1-{label}.png"),full_page=True)
                    total+=1
                assert not errors,f"Unexpected browser exceptions: {errors}"
                context.close()
            finally:
                browser.close()
    finally:
        server.shutdown()
        server.server_close()
    print(f"PASS: {total} browser cases (4 viewport/saving + 9 outcome routes)")
    print("PASS: all 15 production JPEG scenes loaded at 1100x619 in every viewport; no SVG fallback used.")

if __name__=="__main__":
    parser=argparse.ArgumentParser()
    parser.add_argument("--screenshots",action="store_true")
    args=parser.parse_args()
    run_test(args.screenshots)
