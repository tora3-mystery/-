# K1 camera scenario asset QA

Base commit: b8cd1f258850b15db192981c2b6877f310086cd6 (main; α0.10.0).
Production camera stills: 13; all are 1280×720 RGB WebP. The 11 pre-existing game images from main were left untouched.
Fixed frame: all scene composites derive from one generated empty camera plate; person assets were extracted to transparent overlays and composited on that exact plate. Empty recheck uses a localized mat polygon only. Background geometry therefore remains anchored to a single source image before WebP compression.
Camera layout: lens beside 406 entrance at approximately 1.45m, outward down a short corridor; no camera housing or 406 door surface; neighboring doors only partial/oblique.
Camera review thumbnails: every production still placed at 320, 390 and 428 CSS-pixel widths in the three preview sheets. This is asset-scale review only; public browser/game display was not tested.
Alpha/cutout: final production frames are RGB, no unintended transparency. Person mattes used for construction only and are not shipped separately.
Known caveats: transparent cutouts required edge cleanup; low-alpha fringe and broad floor shadows were reduced before compositing. Hasegawa and unnamed visitors have provisional looks. Arima state photos show same fictional person and coat; generated pose differs only subtly. No names, event times, logos, dialog, or readable numbers are baked in.
Out of scope: no HTML/CSS/JS/design/QA/status/root/other-work files changed; no public browser, deployment or human first-impression review; no game integration.

## Production image SHA-256 / bytes
- `camera/empty/0214-second-look.webp` — 189332 bytes — SHA-256 `7b9b25277244363e354e8e5c488d24a7a1bae43d8532be60100ab56b003dbd1c`
- `camera/empty/normal.webp` — 160646 bytes — SHA-256 `64ca57d7a72af0b4c7099bbca68c8ed51f87ba1916c99d2a35ed2307abca6aeb`
- `camera/people/after-hours-management.webp` — 168822 bytes — SHA-256 `31ab282f37c7232acb7d3d8e5a5f7b38df733a87f12c9fb7fef1148244dbeb57`
- `camera/people/arima-fatigued.webp` — 164794 bytes — SHA-256 `899ec7d66dec071e52002c365ce0a160b1e1b64141d22c3c6e33eb460ba42932`
- `camera/people/arima-rested.webp` — 163796 bytes — SHA-256 `921c8c63eec6c8d063a1cfc48cdc6bccfd69cf070cd605f7cd147e2a004607e1`
- `camera/people/courier-planned.webp` — 169122 bytes — SHA-256 `b250ed3c76004021ccf2e7ed3219137bb8e97613a81104557cc5244ef8ff7081`
- `camera/people/courier-unplanned.webp` — 166414 bytes — SHA-256 `49887fc4bcd042d157f0e54ed6667f5e654b8f0e234f7a69ea095c7ad0e99a26`
- `camera/people/hasegawa-day3.webp` — 166184 bytes — SHA-256 `aad60001aa3f819268efc2548b67ec695608b71adebcea6f6a7a7fd695c4ba33`
- `camera/people/impostor-technician.webp` — 170686 bytes — SHA-256 `9f80c23358c18e79aad2e593d1566113a60037383e7f03b903a104e798ec40bd`
- `camera/people/key-envelope-visitor.webp` — 167326 bytes — SHA-256 `151f590a319bca3dd2b9d5cd034818533f9e7b38403f842e19e38799dd38e436`
- `camera/people/ono-normal.webp` — 170790 bytes — SHA-256 `01bef5c8292084e2dbd8e5bda6feff60f506aec1065574fa185682fd03eecd3d`
- `camera/people/sugiura-day6.webp` — 178254 bytes — SHA-256 `2a2ed3c26c0e09b463c9b2e1920b6c062586a332d0cdc9d1bc9454738ef5d058`
- `camera/people/unfamiliar-map-visitor.webp` — 170518 bytes — SHA-256 `031217d96fa1f26d95b39b1d7ac4dc1f1b53fef377bf757e207b275674c184d5`
