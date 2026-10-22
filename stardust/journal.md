# Journal — asianpaints.com replica (single page)

## Extract — bounded single-page capture of the home page (2026-10-19)

- `crawl.mjs --url https://asianpaints.com/ --max 1 --dynamics`: origin redirects to `https://www.asianpaints.com` (adopted). Headless worked, no bot wall, consent method recorded in `_crawl-log.json`.
- 1/1 captured, live provenance (playwright, 200). 19 headings, 149 real images, 19 same-site data endpoints. Source site is itself EDS-served (`/eds/icons/favicon.ico`).
- Vision check: `suspect` — page renders; reel tiles in "Inspiring ideas" and a footer video band are black/empty in headless capture (lazy video). Capture-state policy applies; re-check at the gate.
- Bounded entry: no PRODUCT/DESIGN synthesis here; Phase 2 takes the bounded-single branch. state.json stamped flow=replica, handsOff, type=landing.

## Preserve direction — bounded-single spec, empty register, dynamics triage + martech contract (2026-10-19)

- Bounded branch: synthesized `PRODUCT.md`, `DESIGN.md`, `DESIGN.json` at root from `pages/index.json` + the lift (`stardust/replica/tokens.json`: source `:root` tokens, fonts, census). cap-probe: fluid container, no shell cap (probeWidth 3038).
- Fonts: Manrope TTF 300–800 (OFL) + HeaderFontIcons woff2 harvested to `stardust/current/assets/fonts/`; source CSS (22 sheets) in `stardust/current/assets/css/`.
- Note: source applies `body { zoom }` 0.7–0.9 between 992 and 1439px; gates run at 1440 (zoom 1) and 360.
- Register empty — pure replica. `stardust/direction.md` records bounded-single.
- Dynamics: 32 draft rows → 14 curated rows, every row dispositioned. Martech (owner asked to keep): spec-martech found no Launch in server HTML (EDS loads it late); the contract still carries Adobe Launch + GTM routes, OneTrust CMP, Web SDK (aemMartech) — all disabled.

## Recreate — index archetype authored and gated (2026-10-19)

- Authored as clean HTML/CSS in four parts (header/footer chrome, sections 0–6, sections 7–14) by parallel subagents from the captured content + lifted source CSS; canon.css holds fonts/tokens/base. ~240 media files rehosted under `stardust/prototypes/media/`.
- iter1 (`--full`): 1440 14.45% Δh 70, 360 31.61% Δh 570, 174/183 structural 🔴. Causes: lazy images collapsing in capture, missing scrolled-header state, hidden header overlays/aria-labels absent, cookie banner in the live 360 capture (re-captured).
- iter3 (`--full`, confirmation): 1440 5.52% Δh 0, 360 5.76% Δh 0; 0/1 🔴 (rotating search placeholder); clipped 0; chrome crops header 0% / footer ≤ 0.38%. Masked residual 0.44% / 0.38% — hero and featured-products autoplay are the volatile bands.
- cap-probe @3038: FAIL on video-shorts track (full-bleed vs 2430 content width) → `.vs-track{width:max-content}` → PASS.
- Motion parity: observed behaviours implemented (carousel speeds, featured autoplay 4 s, hero fade, header hovers); restoreAtDelivery list in `stardust/replica/progress.json`.
- Approved hands-off; prototype table rows PASS at both widths.

## Source-fidelity-gate — index passes at 1440 and 360 (2026-10-19)

Prototype table (`gate-all --stage prototype`): 1440 5.52% Δh 0 PASS, 360 5.76% Δh 0 PASS; cap-probe PASS @3038. Residuals: hero + featured-products autoplay (volatile-media), rotating search placeholder, glyph antialiasing ~0.4%.

## Render — index archetype rendered to stardust/migrated (2026-10-19)

`migrate.mjs render index --canon-css stardust/prototypes/css/canon.css`: 1 rendered, 231 assets, 15 sections; 176 links point at source pages outside this one-page scope (repointed to the source at E2).

## A-inventory — 1 page, 1 template (2026-10-19)

inventory.mjs over stardust/migrated: index (landing) is the only page; DA target aemcoder/03cd0138@main, live host main--03cd0138--aemcoder.aem.live.

## B-block — 14 module blocks + header/footer chrome (2026-10-19)

blocks.mjs/plan.mjs: 14 distinct module blocks, each converted once on index (representative); chrome via header/footer blocks in the foundation.

## B2-dynamic — triage re-confirmed (2026-10-19)

`stardust/dynamic-features.md` (14 rows, all dispositioned) stands: detect + plan ran today against the same live page with `--target-origin` (3 host-bound paths). No new evidence since; martech contract unchanged (everything disabled).

## C-deliver — foundation, archetype, gate-all and C-final done; 1/1 page delivered (2026-10-19)

Units foundation, archetype-landing, cluster-landing (no siblings), gate-all, final all `done` in stardust/rollout/progress.json. C-final applied the single queued foundation request (footer banner 3000w rendition; banner crop 3.17 % → 1.01 %) and re-froze the foundation. Published-origin roster gate: 1440 8.19 % / 360 8.44 %, Δh 0, clipped 0, one documented override (featured-products autoplay slide timing, symmetric hidden slide). Open for later phases: coverage `verified` (E-full-site), header contract (chrome-explore), D/E/F/H/I.

## D-site — sitemap served 1 = assembled 1; root 200 (2026-10-19)

`assemble.mjs --verify-origin https://main--03cd0138--aemcoder.aem.live` exit 0 (1 url, 0 extra, 0 missing). Root `/` on aem.page answers 200 (home delivered as the `index` document). Redirects: the source carries only the host-level apex → www hop, no path redirects, so the redirects sheet has no rows and none was created (no `/` row by contract). `/nav` and `/footer` serve `robots: noindex` and are published.

## D2-dynamic — parity replay 14/14 on aem.live (an earlier replay 13/14: loop-wrap instrument limit) (2026-10-19)

`stardust/dynamics/parity.json` written (10 features, 14 checks + martech). PASS: hero carousel (4 slides, video playing), five content carousels (9/3/4/34/5 slides), lead form UI (4 fields, 5 radios), FAQ (19 items), shorts tiles (10), no page errors, martech gate (4 parts gated, no tag host requested). The shorts `video-plays` red: 3 s looping clips wrap between the two samples (paused false; a separate probe shows t 0.14→1.65 s over 1.5 s) — recorded as `environmentLimit`. Designer-collection videos are click-to-play on the source (motion observe autoplay false), so no playback check. Owner decisions kept by name: lead-form endpoint, cart/login backends, host-bound APIs, SaleAssist, third-party scripts, martech enablement. No query index needed (single page, no listings/search).

## E-full-site — 1/1 verified; render check pass; header contract recorded, 9 reds need the owner (2026-10-19)

`verify.mjs --base aem.live`: 1 checked, 1 verified. Render check: hero carousel advances unpoked (slide 0 → 1 after its 18 s video slide), featured products advances, hero + shorts videos play; designer-collection videos click-to-play as on the source. Header contract: `chrome-explore` on the source (with `--warmup`, since the timed splash dialog at ~8.4 s sets `splash-popup-shown` and otherwise eats the pointer) and on aem.live; `chrome-compare --profile replica` → `stardust/chrome/header-parity.json`. Fixed: search Enter → source results page; desktop click keeps a hover-opened menu open. An attempted dropdown 300 ms fade was reverted (source is 200 ms; the 300 ms was a carousel button). Remaining 9 reds = 8 source-record artifacts (timed chat bubble, focus ring, whole-header/viewport crops) + Unbxd typeahead (host-bound) — listed with suggested decisions in `stardust/chrome/header-findings-for-owner.md`; only a site-owner-signed `header-decisions.json` clears them.

## E2-link-audit — 159 hrefs GET: 157 × 200, 2 external timeouts (2026-10-19)

hrefs from `/`, `/nav`, `/footer` (161 unique, mailto/tel excluded): 157 × 200 (incl. `/` and 17 `/media/*` on aem.live), 2 × no answer to a script client (facebook.com/asianpaints, asianpaints.com.bd — external, verbatim from the source). Out-of-cap internal targets repoint to the source (decision in direction.md). No 404.

## F-optimize — health 98/100, 0 P1; source JSON-LD carried natively (2026-10-19)

First pass 93/100: P2 no JSON-LD, P3 title 81 chars. The source page carries 6 JSON-LD items (Organization, ItemList, Brand, FAQPage, Brand, Organization) — carried verbatim as a `JSON-LD` metadata row, which the pipeline renders server-side as `<script type="application/ld+json">` (a first attempt failed only because the row sat outside the metadata block; a client-side fetch workaround was removed again, and its file deleted from the code bus). Re-run: 98/100, P2 fixed. P3 title accepted: verbatim from the source (replica, no rewording).

## G-aem — no autofix candidates (2026-10-19)

`autofix-aem.mjs --dry-run`: 0 candidates (no open fixable findings after F-optimize). Nothing applied, no re-deploy needed.

## H-report — report written; learnings recorded (2026-10-19)

`stardust/rollout/report.md`: 1/1 page delivered + verified, 14 blocks, gate 1440 8.19 % / 360 8.44 %, health 100, parity 14/14; owner decisions listed (header typeahead + artifacts, form endpoint, backends, SaleAssist, martech enablement). Four learnings appended to `stardust/learnings.md`.

## I-dashboard — dashboard written (2026-10-19)

`stardust/rollout/dashboard/index.html` + `data.json`: 1 page identified, prototyped, deployed, optimised.

## Handoff — run complete: 1/1 page live at the site root (2026-10-19)

Runner done-check `{"complete":true,"gaps":[]}`. Delivered: `/` on main--03cd0138--aemcoder (preview + live), nav/footer published, gate-all 1440 8.19 % / 360 8.44 %, health 100, parity 14/14, martech carried disabled. Open with the owner (not run-blocking per the runner): local `done-check.mjs` header_parity 9 — sign or reject the decisions in `stardust/chrome/header-findings-for-owner.md` (8 recorder artifacts + Unbxd typeahead); the owner decisions listed in `stardust/rollout/report.md`.
