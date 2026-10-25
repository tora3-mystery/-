# F1 v0.8 — independent five-perspective design audit
Date: 2026-10-24 JST; scope: F1 only. This is a structured AI role-based review, NOT five independent human playtesters.

## Test basis
- Staging f1/index.html JS instrumented via DOM stubs; 630 policy tests (7 policies x 90) and additional isolated save, accounting, low-cash and hidden-ending checks.
- Every play had six daily choices on each of seven days. No test-time JS errors/hangs observed. All seven endings observed across 630 plays.
- The simulation is deterministic for a fixed move sequence; repeated identical policies produce identical outcomes. Do not interpret repeated deterministic successes as independent player success probabilities.
- Economy test: random all actions (90): 3 normal_success, 24 normal_customer, 1 normal_strain and 62 anomaly endings; ordinary random (90): 7 normal_success, 81 normal_customer, 2 normal_strain; profit-focused (90): 90 normal_strain with 148 final cash; expensive focused: 90 normal_customer at 46 final cash; complaint focused: 90 normal_customer at 99; low-cost/noise focused: 90 normal_success at 137; anomaly focused: odd paths at median cash 62.
- Save v0.7 -> v0.8 migrates day, cash, complaints, history and persists v0.8 key in isolated test. Cash change = sales - procurement - payroll - maintenance - investment for every tested day. Hidden completion and anomaly metrics reset verified. Negative cash scenario still exposes six affordable choices.
- Browser screenshot, 320/390 px real touch, image requests and performance are NOT yet checked. All 8 images are still absent in staging branch. Do not merge as a finished release.

## Five specialist reviews
1. Game design (P1): Excellent separation of healthy store management vs optional anomaly; but a few repeated low-cost policies dominate. Introduce meaningful tradeoffs rather than simple choice-picking. No need for randomness for its own sake.
2. Actuarial / economic balance (P1): Cash model balances arithmetically but over-rewards repeated free steps relative to investment; profit-first can end as generic loss with ample cash. Revisit repeat fatigue or limited uses, plus narrative endpoint mapping. Do not casually retune until regression simulations.
3. Narrative and mystery (P1): Three anomaly choices automatically provide all three clues, and final button literally says '証拠3/3・隠し分岐', revealing the secret. Replace with non-spoiler investigation choice and a short inference step. The eighth business day is currently an ending state, not an interactive full day.
4. UX / accessibility (P1): Icons improve scanning; mysterious actions now lack a distinctive border. But normal scenes only reflect current max complaint, and effect badges are not physical visual improvements. Add contextual improvement/construction scenes, image preloading/error handling and mobile screenshots.
5. QA / integration (P0 staging): No image assets in GitHub yet; branch images 404 until uploaded. Preserve root index.html and m2/d3. Run browser QA for 320/390/tablet/desktop, all seven endings, image URLs and save migration; deploy only after passing.

## Proposed scene inventory (not yet generated/committed)
Current eight:
- store-normal, store-queue, store-aisle, store-stock, store-noise, store-odd1, store-odd2, store-odd3.
Recommended new thirteen:
- 4 physical improvement states: store-register-improved, store-aisle-cleared, store-stock-replenished, store-noise-quiet.
- 2 construction states: store-register-installing, store-aisle-renovating.
- 7 distinct ending visuals: end-n1, end-n2, end-n3, end-x1, end-x2, end-x3, end-x4.
Total 21, lazy-loading only scenes actually shown; optimize JPEG/WebP, maintain same store and camera frame.

Priority state selection for revised scene rendering:
1. Ending scene when finish.
2. Odd1-3 whenever anomaly is active; physical improvement markers may overlay without replacing the weirdness.
3. Unresolved highest severe complaint photo (>=4).
4. Construction photo if relevant job is ongoing.
5. Completed prominent improvement photo if relevant policy was selected.
6. Remaining complaint photo (>=3), otherwise neutral.
Always accompany photos with legible state labels, ensure no surprise spoiler in alt text or filenames exposed in UI.

## Priorities before publication
P0: Deploy the eight existing images into f1/assets, verify exact paths; do not merge branch without image QA.
P1: Rework hidden clue reveal, restore the three intended normal ending identities, rebalance cheap repetitive strategy, include context-specific measure-change photos.
P2: Interactive 8th day (currently a one-step ending), all unique ending stills, accessibility polish.

## Workflow boundaries
This dedicated chat/Work may edit f1/ only. Root index.html is owned exclusively by the project master chat. Never edit d3/, m2/, shared tests or repo settings without explicit approval. The master chat handles listing update on independent release report (name, version, JST, modifications, commit, public URL, test results).
