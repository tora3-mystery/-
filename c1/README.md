# C1 適切にご対応ください。 v0.4.1

- Public URL: https://tora3-mystery.github.io/short-ui-games/c1/
- Scope: All C1 assets are under `c1/` only. Root `index.html` is maintained by ARG master.
- Updated (JST): 2026-10-25 18:00
- Static HTML/CSS/JavaScript, no server/API dependencies, no external images, no AI decision API.

## Mechanics

- 5 workdays × 3 scenarios × 6 responses = 15 events / 90 actions.
- Player gauges: compliance (20 is instant loss); progress >=22 and growth >=6 for ordinary completion.
- Harassment names and internal fictional recognition reasons are shown after each response, with a 0-point suspicion category.
- Employee randomized profile includes age, assignment history, career goals, skill, preference for checking, delivery medium, feedback style. Gender does **not** affect outcomes.
- Wednesday chat event has explicit-start real elapsed time mode and deterministic accessible time-selection mode.
- Persistence: localStorage save/resume, harassment collection, 16 endings; no external transfer.
- Result text share and client-side PNG card export.

## Files

`index.html` entry; `style.css`; `app.mjs` UI; `engine.mjs` pure rule engine; `events.json` scenario data.

## Verification

Automated engine/UI QA evidence is produced locally before publication. GitHub commit confirmation and public Pages HTTP check are separately reported.

## Important disclaimer

Fictional satire on organizational classification and management tensions. Not a legal definition of harassment or workplace training material.
## v0.4.1 audit fixes

- Merge base and timing recognition without duplicate category; keep the two explanations separate.
- Register timing-only harassment in archive (including 遅レスハラ); count unique classifications consistently.
- Preserve pre-profile confirmation state on resume, including legacy v0.4.0 saves.
- Modal focus is trapped, Escape/backdrop closes the modal and returns focus to its launcher.
- Events metadata is consistent with the game version.
