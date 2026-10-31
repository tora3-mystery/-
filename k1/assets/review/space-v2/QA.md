# K1 asset remake QA — space-v2

## Scope

36 WebP assets are included: 24 camera/ending frames (3 are exact-byte reuse from approved Step 0), 6 new three-door states, and 6 new board/mail/GAME OVER scenes. The approved three-door anchors (`day03-moving`, `day04-vacated`, `day09-normal-401`) are preserved byte-for-byte and are not counted among the 36. All source assets and QA evidence stay under `k1/assets/`. No game files were edited.

## Technical checks

- Every delivered game asset decodes as WebP. Dimensions: camera/ending and board/hallway 1600×1000; quietmail 1200×900; listing 900×1200; GAME OVER 1280×720.
- `asset-checks.csv` records byte length and SHA-256 for all 36 files. The three approved corridor anchors were checked against their Step A files and preserved byte-identically.
- Files are RGB after conversion. No duplicated file hashes occur among new finals except intentional exact-byte carry-forward for the three Step 0 images, where the old pilot paths are omitted from this final tree.
- Image contacts and 320/390/428px scaled sheets are present. These are image-size simulations, not public browser tests.

## Visual findings

- The intercom camera correctly faces the open-air corridor side from 406; it does not show apartment doors. Daytime three-door images remain a distinct view.
- Visitor frames share the same night corridor layout and broad camera direction. Generated full-frame backgrounds show small lighting/building-detail drift, so use them as alternate stills; do not stack them as layers. Only the localized 406 mark, inspection label, floor moisture and far silhouette are overlays composited onto their specific backgrounds.
- The 0214 sequence progresses from empty, to a faint floor trace, to a close partial face. The third frame is intentionally strong; the rest of the figure remains hidden.
- The 401 aftermath has a distant figure in the far left passage. The 406 aftermath and ending use a near-lens partial presence. The ending code in the reviewed main revision renders a standalone image; retain the supplied frame content while K1 Chat confirms intended framing.
- Corridor object differences are recognizable at 320/390/428px. The 406 mark and DAY10 moisture are intentionally subtle; the 390px composite sheet should be used for human review and game UI should allow image enlargement if those clues become too small beneath controls.
- DAY9 406 carries a generic check symbol on a small blank label. It has no letters or logo.
- The quietmail image is a conditional evidence photo and must only appear when that rare event fires. The old listing contains blank information fields for exact HTML text.
- GAME OVER E08 shows two ordinary men at a slightly open door; K1 Chat should confirm which image identities/roles these figures represent.

## Known limitations and handoff

- Visual consistency is strong at the scene level but not pixel-registered across all generated full-frame images. No state should be overlaid on another full-frame hallway/camera image.
- There are no dedicated image files for text-only warnings, in-room control UI or alert copy in current code; those remain HTML/CSS content. No unsupported extra scenes were generated.
- The new assets live in versioned `space-v2` paths to preserve current assets. K1 Chat must map the event routes to these paths; image integration and event logic were not changed here.
- Public live page, browser behavior and physical-device testing were not performed, as requested.
