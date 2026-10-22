# EDS conversion log — asianpaints.com replica

- Publish decision (owner, recorded once): **publish** — every delivered page, the redirects sheet and the chrome documents (nav, footer) go live on the aem.live origin.
- C0 foundation: styles/fonts (Manrope self-hosted), header/footer blocks decoding `/nav` + `/footer` DA documents (template-slotted chrome), martech scaffold (all parts disabled). /nav, /footer previewed + published.

## archetype-landing — `/index` (site root `/`), 2026-10-19

Content: `content/index.html` (DA div-class form); h1 authored as default content in section 1 and visually hidden by
`carousel-hero-banner.css` (`.carousel-hero-banner-container > .default-content-wrapper:first-child`); 142 editorial
images on DA media `media/index/` (the four services-grid AVIFs re-encoded to WebP); videos (hero webm desktop/mobile,
4 designer-collections webm, 10 video-shorts mp4) served root-relative from the code origin under `/media/`;
decorative icons (arrows, quote background, play button, download icon) under `/icons/`. Block CSS = the prototype's
`css/index-{a,b}.css` rules split per block and scoped to the block class, plus an "EDS adaptation" tail.
Block JS is self-contained (no module imports), node-slotting (EW1–EW10). Section-schema `stardust/eds-schema/index.json`
(prototype copy `stardust/prototypes/index-ds.html` carries `data-section` hooks only).

| block | decode tier | notes |
|---|---|---|
| carousel-hero-banner | template-slotted | rows = slides [media][CTA]; video slide = 2 video links + overlay pictures; fade 800 ms, 18 s / 5 s, pause on hover |
| homepage-icons-container-block | template-slotted (+ repeat tiles) | heading row + icon rows; card-as-link (EW6); plan.json `edsBlockName` |
| color-gallery | template-slotted intro + reconstructive cards | mobile CTA = presentational clone (EW4) |
| form | template-slotted (keyed rows) | title / field / checkbox / choice / consent / submit; "No backend connected" on valid submit |
| featured-products | reconstructive | autoplay 4000 ms + 600 ms slide, loop, pause on hover; first step ~8 s after navigation (source timing) |
| services-grid | reconstructive | |
| explore-split | template-slotted | desktop masonry + mobile tabs (tabs = presentational heading clones) |
| tools-carousel | reconstructive | |
| designer-collections | reconstructive | videos paused at first frame, click plays |
| interiors-shop | reconstructive | slide-by-one < 900 px |
| testimonial-carousel | reconstructive | 34 slides |
| store-banner | template-slotted | |
| video-shorts | reconstructive | tiles autoplay loop muted |
| accordion (faq) | reconstructive | div[role=button] labels (EW7), first 5 visible + VIEW ALL |

Checks: block-roundtrip `--ew` whole page 0 structural 🔴 (editable 230/244, 14 exempt form config texts);
delivery-lint clean; media-reconcile 142 hosted; davids-model-lint PASS (D3/D4 advisories, SVGs verified pure-vector);
localize-links `--check` 0 (localized `/nav` logo link → `/`, `/nav` re-published); ai-readability code 100 %; `npm run lint` clean.
Published-origin gate: gate.sh pub2 1440 5.11 % / 360 5.23 %; gate-all 1440 4.16 % / 360 8.44 %, Δh 0, clipped 0,
content MISSING 0 / HIDDEN 1 (featured-products card "all protek" — autoplay phase differs between the two probe
sessions; residual, fix-round cap reached). Hero is a session-variable region in `gates/all-<w>/presence.json`. No masks.
Header crop 0.11 % (1440) / 0.00 % (360); footer 1440 3.12 % (pub2, fixed-header overlap excluded: top band 0.31 %,
lower band 3.17 % = footer banner 2000-px rendition vs source 2886-px AVIF → foundation request), 360 0.49 %.

C-final (2026-10-19): foundation request applied once — footer banner desktop rendition 2000w → 3000w (`blocks/footer/footer.js`), banner crop 1440 3.17 % → 1.01 %; foundation re-frozen. Roster gate (gate-all, published origin): 1440 8.19 % / 360 8.44 %, Δh 0, clipped 0; content: 1 HIDDEN link inside the autoplaying featured-products carousel (origin hides one off-screen slide, delivered page hides one — slide timing), recorded as a documented override in `gates/all-<w>/overrides.json`. Residual footer-bottom crop diff = the source's OneTrust consent bar in the origin capture (consent ships disabled per the martech contract).
D-site (2026-10-19): no path redirects on the source (apex → www host hop only) — redirects sheet empty, not created; sitemap served 1 = assembled 1; / 200.
