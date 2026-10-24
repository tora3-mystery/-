# F1 v0.8 — staged release handoff

Status: implemented in staging branch. DO NOT publish before image assets are committed and browser QA passes. Root listing and shared resources are owned by the master project chat, not this project.

## Scope (already implemented in f1/index.html)
- Photorealistic state image: normal, queue, aisle, stock, noise, anomaly 1/2/3
- Image selection prioritizes the worst complaint for normal mode, anomaly state otherwise
- Context labels/visual history markers track immediate measures and completion of delayed investments
- Neutral icons and equal styling for all six daily choices, including concealed anomaly actions
- The 0-register reveal happens after choosing a seemingly legitimate business improvement
- Four extra zero-cost repeatable measures protect the six-choice menu during low-funds states
- Loop-guard protects against menu-selection hangs
- LocalStorage v0.8 key with migration from v0.7; endings and cash flow preserved
- All 7 endings observed in a 75-run simulated strategy sweep

## Required asset paths
Unzip the 8 images from f1_v08_supermarket_images.zip into the root of this repository, preserving:
- f1/assets/store-normal.jpg
- f1/assets/store-queue.jpg
- f1/assets/store-aisle.jpg
- f1/assets/store-stock.jpg
- f1/assets/store-noise.jpg
- f1/assets/store-odd1.jpg
- f1/assets/store-odd2.jpg
- f1/assets/store-odd3.jpg

The archive also includes a manifest. All files are JPEG; do not change file extensions.

## Acceptance / publication checklist
1. Commit eight JPEG files to this staging branch with the paths above.
2. Verify all 8 images render without 404 errors; in particular, opening game at width 320px and 390px, also tablet and desktop widths.
3. Exercise the normal path and all three anomaly levels, confirming correct image changes, captions, and strategy badges.
4. Validate icon alignment, six clickable choices every day, unusual options not highlighted as special, delayed measures only marked completed after construction.
5. Run the existing tests/simulate-f1.mjs and additional multi-policy/randomized runs, including low/negative cash and save migration.
6. Verify all seven endings, and manual keyboard/touch workflow on iPhone/Safari where available.
7. On release, replace the staging-only placeholder within **f1/index.html only** with the actual F1 v0.8 JST release timestamp; do not edit the root index.html.
8. Before merging, refresh main and confirm changes made by the M2 or index-owning project; merge/rebase without overwriting those unrelated changes. If a shared-file conflict is found, stop and ask the user.
9. Only after passing QA, merge the F1-scoped changes into main. Verify GitHub Pages deployment and the F1 live URL. Include game name, version, JST release timestamp, changes, commit SHA, public game URL and test results in the completion report so the master project chat can update the root listing.
10. DO NOT modify repository root index.html, cross-game shared files/settings, d3/, m2/ or any unrelated repositories without explicit user authorization.

## Known constraints
- Photographs are state-based, so visual markers supplement rather than physically rewrite every fixture in each image.
- Browser-based UI QA is still pending. Automated JS simulation is not a substitute for screenshot/review.
- Existing NORMAL ending titles/thresholds remain unchanged from v0.7; do not alter the ending design without user approval.
