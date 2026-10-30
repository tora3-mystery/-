# K1 horror-difference asset QA — first batch

Base reference: `k1-camera-scenario-main-20261030` at `f80b2eea52137020f32610a74f881debe8f99813` (α0.10.0). All 11 outputs are 1280×720 RGB WebP, composed on the previously delivered fixed-camera plate or the matching visitor still. The generated scene-edit close-up is restricted to a feathered face region; corridor geometry outside that region remains the original plate.

## Event use
- E03 third look: near-lens face appears only on the third-look asset. No gore or explicit identity.
- E08 aftermath: target 401 leaves a distant figure; target 406 leaves a face close to the lower-right camera edge.
- E02G/E02I second look: inverted ceiling reflection appears behind the otherwise unchanged night staff visitor.
- E02D second look: the visitor is gone; a hand remains beside a narrow dark door-edge opening.
- E05G second look: a distant figure remains at the corridor end.
- E07 second look: the visitor has vanished and a tall figure occupies the corridor.
- E10 second look: Hasegawa remains ordinary; a partial face is present behind her near the far-right doorway.
- E06 second look: Sugiura is gone; an upside-down ceiling reflection remains.
- Ending 401: a distant, low-contrast figure implies the haunting remains with 401.
- Ending 406: the near-lens face is dominant and more frightening.

The exact file/event/display-state mapping is in `display-conditions.csv`.

## Technical / visual checks
- All 11 images decode as 1280×720 WebP and have unique SHA-256 values.
- Final files are RGB without unintended alpha. The 11 new ledger rows include dimensions, scenario condition, bytes, and SHA-256.
- Contact sheet, before/after comparison, and 320/390/428 pixel-width preview sheets were generated.
- Main corridor frame and camera placement are fixed; supernatural forms are localized overlays or localized feathered edits. No readable writing, logos, blood, or explicit ghost identity.
- At 320px, the close faces and ceiling figure remain visible. The Hasegawa-side face, hand/door-edge, and distant 401/05G figures are secondary discoveries; verify they remain legible at the intended game display size.

## Review limits / caveats
- The key-visitor second-look hand and door gap are small at 320px; check that the intended UI display size does not reduce them further.
- The 401 ending uses a distant silhouette because this camera cannot see the 401 door from its fixed position; it does not assert a new camera angle.
- These are AI-generated candidate stills composed from fictional assets. Human first-impression, in-game state switching, public browser, and real-device tests remain pending.
- No game source, DESIGN, QA, status, root index, or other work files were modified.
