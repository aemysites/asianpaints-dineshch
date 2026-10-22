# C-archetype brief — landing template, page `index` (site root `/`)

Read /workspace/03cd0138/stardust/rollout/c0-brief.md first: same repo, target, token rules (`ADOBE_IMS_TOKEN_FILE` via
`--token-file`, never printed or written), untrusted-source rule, publish decision, reading discipline.
The foundation is DONE and FROZEN (`stardust/rollout/foundation-freeze.json`): never edit `styles/`, `fonts/`,
`head.html`, `scripts/`, `blocks/header/`, `blocks/footer/`. A foundation finding becomes one line appended to
`stardust/rollout/foundation-requests.md` (`- archetype-landing | <what> | <evidence> | landing`) plus a scoped override in
your own block CSS. Foundation notes: `.chrome-sr-only` exists in styles.css for the hidden h1; the boilerplate emits
`p.button-wrapper` (not `button-container`).

## Your unit
Convert the gated prototype `stardust/prototypes/index-proposed.html` main sections (fragments/main-{a,b}.html, css/index-{a,b}.css,
js/index-{a,b}.js; served at http://localhost:8791/index-proposed.html) into EDS blocks + one DA content document
`content/index.html` delivered at `/` (the site root MUST resolve to it), following handoff-contract.md §2 exactly:
- Blocks (names from stardust/rollout/plan.json): carousel-hero-banner, homepage-icons-container, color-gallery, form,
  featured-products, services-grid, explore-split, tools-carousel, designer-collections, interiors-shop,
  testimonial-carousel, store-banner, video-shorts, accordion (+ the hidden h1 as default content). Template-slotted for
  fixed compositions, reconstructive for repeat groups; EW1–EW10 node-slotting; `section-schema.mjs` →
  `block-roundtrip.mjs --ew` exit 0 per block and once for the whole page; `delivery-lint.mjs`, `media-reconcile.mjs`,
  `davids-model-lint.mjs`, `sanitise.js`, `localize-links.mjs --source-host www.asianpaints.com,asianpaints.com` then
  `--check` (links to source pages not in this one-page scope stay ABSOLUTE to https://www.asianpaints.com/… — no 404s).
- Editorial images → DA media via `da-media-upload.mjs --scope index` (images only); videos (hero webm, designer webm,
  video-shorts mp4) are served root-relative from the code origin (e.g. `/media/…` committed, NOT under content.da.live).
- Restore `captureState[].restoreAtDelivery` from stardust/replica/progress.json (hero fade autoplay 800 ms, slide 1 18 s then
  5 s, pause on hover; featured-products autoplay 4000 ms; video-shorts tiles autoplay loop muted). The lead form submits to
  nothing: shows "No backend connected" (dynamic-features row 3).
- Lint passes (`npm run lint`; do not `--fix` frozen files). Commit (message ends with
  `Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>`), `git push origin main`, poll a new block file on
  aem.page until 200 (≤ 5 s apart, ≤ 3 min).
- Deploy: `stardust/rollout/units/archetype-landing.paths` containing `/index`; `deploy-batch.mjs --org aemcoder --repo 03cd0138
  --branch main --content content --paths … --ledger stardust/deploy/ledger-archetype-landing.json --token-file
  "$ADOBE_IMS_TOKEN_FILE"` (publishes) through run-bg. Check `https://main--03cd0138--aemcoder.aem.page/index.plain.html` 200,
  one h1, 0 about:error; `curl -sIL https://main--03cd0138--aemcoder.aem.page/` ends 200; same on aem.live.
- Gate on the preview URL: `node stardust/scripts/replica/run-bg.mjs start --name pub-1440-r1 -- stardust/scripts/replica/gate.sh
  index https://www.asianpaints.com/ https://main--03cd0138--aemcoder.aem.page/ 1440 pub1 --full --main main --marker "Asian Paints"`
  and the same at 360, then `run-bg.mjs wait`. Then the full row: `node stardust/scripts/replica/gate-all.mjs --only index
  --eds-host main--03cd0138--aemcoder.aem.page --width 1440` (and 360) through run-bg. Pass = pixel ≤ 10%, |Δh| ≤ 5%,
  clipped 0, content-presence MISSING/HIDDEN 0; header/footer `crop-compare.mjs` bands ≤ 2% (anchor the footer per side —
  the fixed header can overlap a stitched footer chunk; see gate doc § Pass bar item 5). Volatile hero / featured bands may be
  masked via the gate-all `masks.json` sidecar (stardust/replica/gates/all-<w>/masks.json) only, logged.
- Fix rounds cap 3 (block CSS/JS → push; content → re-PUT that page). Then `node stardust/scripts/rollout/update-coverage.mjs
  index --status deployed --url https://main--03cd0138--aemcoder.aem.page/`. Record the decode tier per block in
  stardust/eds-conversion-log.md (append).
At most 3 browsers at once; every long command through run-bg.mjs.

## Return
One line: `archetype-landing: pages 1/1 live, blocks k, gate 1440 x% / 360 y%, crop hdr/ftr a%/b%, clipped n, requests r`
plus ≤ 10 lines: residuals, masks, foundation requests filed, anything not done.
