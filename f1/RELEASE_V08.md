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

## Required asset paths — source of truth
Follow **f1/ANOMALY_REVIEW_V08.md** for the newest story and ending rules, **f1/PROPOSAL_V08_COMPLAINT_CHAIN.md** for ordinary complaints, and **f1/SPEC_V08_NONIMAGE.md** only for the provisional asset naming baseline. There are currently **21 provisional JPEG image names** referenced in f1/index.html: 8 existing base images and 13 new construction/improvement/ending scenes. None are committed to GitHub yet. Use the exact paths in the spec and preserve the common camera framing. Do not generate more images or change state mapping without resolving it in the F1 design chat first.

## Current design priority
The weekday/Day 6/Day 7/Day 8 scenario is described by **f1/WEEKDAY_HORROR_V08.md** (supersedes older anomaly timing). Image inventory remains provisional and no assets should be generated before the complete story design review. Confirm an anomaly-free N1 route before release.

## Acceptance / publication checklist
1. Commit all 21 approved scene JPEG files to f1/assets/ on this staging branch, using the filename contract in f1/SPEC_V08_NONIMAGE.md.
2. Verify all 21 scene assets render without 404 errors; in particular, opening game at width 320px and 390px, also tablet and desktop widths.
3. Exercise the normal path and all three anomaly levels, confirming correct image changes, captions, and strategy badges.
4. Validate icon alignment, six clickable choices every day, unusual options not highlighted as special, delayed measures only marked completed after construction.
5. Run F1-specific regression tests plus the existing shared test READ-ONLY (do not edit tests/). Test three normal and four anomaly endings, the two-answer inference, accounting, low/negative cash, v0.7 migration, and saved final states.
6. Verify all seven endings, and manual keyboard/touch workflow on iPhone/Safari where available.
7. On release, replace the staging-only placeholder within **f1/index.html only** with the actual F1 v0.8 JST release timestamp; do not edit the root index.html.
8. Before merging, refresh main and confirm changes made by the M2 or index-owning project; merge/rebase without overwriting those unrelated changes. If a shared-file conflict is found, stop and ask the user.
9. Only after passing QA, merge the F1-scoped changes into main. Verify GitHub Pages deployment and the F1 live URL. Include game name, version, JST release timestamp, changes, commit SHA, public game URL and test results in the completion report so the master project chat can update the root listing.
10. DO NOT modify repository root index.html, cross-game shared files/settings, d3/, m2/ or any unrelated repositories without explicit user authorization.

## Known constraints
- The currently proposed 21 photos represent defined states and endings; not every possible combination of improvements is rendered. The game uses state labels to represent additional changes.
- Browser-based UI QA is still pending. Automated JS simulation is not a substitute for screenshot/review.
- Current normal ending criteria and X1–X4 naming are defined in f1/SPEC_V08_NONIMAGE.md. These replace the mismatched v0.7 labels. Do not alter them without user approval.
