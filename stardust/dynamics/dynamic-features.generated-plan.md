<!-- stardust provenance: skill=stardust:dynamics · phase=plan draft · 2026-10-19T16:48:33.300Z · input stardust/current/_dynamics.json (1 pages, 32 findings) · target probe https://main--03cd0138--aemcoder.aem.page -->
# Dynamic features — draft inventory (curate into `stardust/dynamic-features.md`)

One row per detected finding. Merge duplicates, drop noise, keep every axis honest. Columns: disposition = what we do · reproducibility = what it needs · status = where it stands (reference/triage.md).

| # | id | class | feature | pages | disposition | reproducibility | status | pattern | decision needed | notes |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | a-unknown-third-party-host-vtiles-saleassist-ai | A | unknown third-party host vtiles.saleassist.ai | 1/1 | static-snapshot | needs-human-capture | pending | inspect | inspect the XHR, add a vendor row |  |
| 2 | a-first-party-api-get-apcolourcatalogue-detect-location | A | first-party API GET /apcolourcatalogue/detect-location | 1/1 (reach 1/1) | data-fed | needs-business-decision | pending | off-origin-data | which tier for the target host; consumer on the migrated pages? | **dead on target (404)** |
| 3 | a-cms-app-settings-object-digitaldata | A | CMS / app settings object digitalData | 1/1 | static-snapshot | self | pending | read-settings | — (keys name endpoints, ids, vendors) |  |
| 4 | a-cms-app-settings-object-datalayer | A | CMS / app settings object dataLayer | 1/1 | static-snapshot | self | pending | read-settings | — (keys name endpoints, ids, vendors) |  |
| 5 | a-cms-app-settings-object-adobedatalayer | A | CMS / app settings object adobeDataLayer | 1/1 | static-snapshot | self | pending | read-settings | — (keys name endpoints, ids, vendors) |  |
| 6 | cr-main-empty-at-load-filled-after-client-rendered-page | CR | main empty at load, filled after (client-rendered page) | 1/1 | static-snapshot | needs-human-capture | pending | client-rendered-page | human-browser capture; never migrate blank |  |
| 7 | d-first-party-data-file-get-eds-configs-site-config-json | D | first-party data file GET /eds/configs/site-config.json | 1/1 (reach 1/1) | data-fed | self | pending | sheet-sync | none (sync from the source origin) | **dead on target (404)** |
| 8 | d-first-party-data-file-get-apcolourcatalogue-commerce-minic | D | first-party data file GET /apcolourcatalogue/commerce/miniCart.json | 1/1 (reach 1/1) | data-fed | self | pending | sheet-sync | none (sync from the source origin) | **dead on target (404)** |
| 9 | f-form-less-control-group-in-input-form-input-4-controls | F | form-less control group in input.form-input (4 controls) | 1/1 | client-only | self | pending | client-compute | none |  |
| 10 | f-form-less-control-group-in-input-form-radio-input-field-5- | F | form-less control group in input.form-radio-input__field (5 controls) | 1/1 | client-only | self | pending | client-compute | none |  |
| 11 | i18n-locale-variants-en-en | I18N | locale variants en,en | 1/1 | rebuild-native | needs-business-decision | pending | locale-tree | scope of the locale trees |  |
| 12 | l-listing-candidate-swiper-wrapper-color-gallery-carousel-tr | L | listing candidate swiper-wrapper color-gallery-carousel-track (9 cards) | 1/1 | index-backed | needs-business-decision | pending | listing-index-backed | index-driven or editorially curated? |  |
| 13 | l-listing-candidate-swiper-wrapper-sa-shorts-parent-video-co | L | listing candidate swiper-wrapper sa-shorts-parent-video-container (10 cards) | 1/1 | index-backed | needs-business-decision | pending | listing-index-backed | index-driven or editorially curated? |  |
| 14 | m-modal-trigger-trigger-book-free-site-visit-modal-chrome-on | M | modal trigger trigger-book-free-site-visit-modal (chrome only) → target outside DOM at capture | 1/1 (reach 1/1) | rebuild-native | self | pending | chrome-interaction | none (the header contract is the spec) |  |
| 15 | m-modal-trigger-cart-modal-shop-chrome-only-target-outside-d | M | modal trigger cart-modal-shop (chrome only) → target outside DOM at capture | 1/1 (reach 1/1) | rebuild-native | self | pending | chrome-interaction | none (the header contract is the spec) |  |
| 16 | m-modal-trigger-login-modal-action-chrome-only-target-outsid | M | modal trigger login-modal-action (chrome only) → target outside DOM at capture | 1/1 (reach 2/1) | rebuild-native | self | pending | chrome-interaction | none (the header contract is the spec) |  |
| 17 | m-modal-trigger-aria-haspopup-chrome-only-button-content | M | modal trigger aria-haspopup (chrome only) → button:content | 1/1 | rebuild-native | self | pending | chrome-interaction | none (the header contract is the spec) |  |
| 18 | t-tag-manager-adobe-launch | T | tag manager: Adobe Launch | 1/1 | embed-passthrough | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 19 | t-unknown-third-party-host-www-facebook-com | T | unknown third-party host www.facebook.com | 1/1 | embed-passthrough | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 20 | t-marketing-ad-retargeting-pixel | T | marketing: ad / retargeting pixel | 1/1 | embed-passthrough | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 21 | t-analytics-google-analytics-ads | T | analytics: Google Analytics / Ads | 1/1 | embed-passthrough | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 22 | t-tag-manager-google-tag-manager | T | tag manager: Google Tag Manager | 1/1 | embed-passthrough | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 23 | t-analytics-adobe-analytics-experience-cloud-id | T | analytics: Adobe Analytics / Experience Cloud ID | 1/1 | embed-passthrough | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 24 | t-unknown-third-party-host-static-saleassist-ai | T | unknown third-party host static.saleassist.ai | 1/1 | embed-passthrough | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 25 | t-unknown-third-party-host-cdn-socket-io | T | unknown third-party host cdn.socket.io | 1/1 | embed-passthrough | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 26 | t-unknown-third-party-host-cdn-gumlytics-com | T | unknown third-party host cdn.gumlytics.com | 1/1 | embed-passthrough | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 27 | t-unknown-third-party-host-client-static-saleassist-ai | T | unknown third-party host client-static.saleassist.ai | 1/1 | embed-passthrough | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 28 | t-consent-onetrust | T | consent: OneTrust | 1/1 | embed-passthrough | needs-business-decision | pending | consent-gated-tags | CMP domain script reuse on the new host |  |
| 29 | t-analytics-session-replay | T | analytics: session replay | 1/1 | embed-passthrough | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 30 | t-unknown-third-party-host-c-bing-com | T | unknown third-party host c.bing.com | 1/1 | embed-passthrough | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 31 | v-iframe-without-src-runtime-injected-embed | V | iframe without src (runtime-injected embed) | 1/1 | embed-passthrough | needs-human-capture | pending | embed-passthrough | resolve the runtime src from a rendered capture |  |
| 32 | x-commerce-signals-cart-true-prices-0 | X | commerce signals (cart: true, prices: 0) | 1/1 | decided-out | needs-backend | pending | decided-out | auth / commerce on the new host? |  |

## Triage

- **Ships autonomously (reproducibility `self`):** 11 row(s) — read-settings, sheet-sync, client-compute, chrome-interaction.
- **One owner decision batch:** 20 row(s) — inspect the XHR, add a vendor row · which tier for the target host; consumer on the migrated pages? · human-browser capture; never migrate blank · scope of the locale trees · index-driven or editorially curated? · which tags run on the new host; property ids.
- **Already delivered by the capture pipeline:** 0 row(s) — no work.
- **Host-bound on the target:** 3 of 3 probed API paths — the off-origin data work.
- **Martech:** OneTrust · 0/2 route(s) enabled by the owner — `stardust/martech-handoff.md`.

## Phases

- **tags** — 13
- **detect** — 4
- **interactive** — 4
- **data** — 2
- **client tools** — 2
- **listings** — 2
- **off-origin data** — 1
- **capture** — 1
- **locale wave** — 1
- **embeds** — 1
- **register** — 1
