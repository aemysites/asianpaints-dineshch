# Dynamic features — www.asianpaints.com (home page only)

Curated from `stardust/dynamics/dynamic-features.generated-plan.md` (32 draft rows, 1 page). Static recreation
continues regardless of these rows (triage rule 7).

## Listings contract
none — the carousels on the home page (colour gallery, video shorts) are editorially curated bands authored
as rows in the page document; no query index is read.

## Features
| # | id | feature | class | reach | disposition | reproducibility | status | pattern | decision / owner | evidence |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | hero-carousel | hero banner carousel (swiper fade, autoplay) | M | 1/1 | rebuild-native | self | pending | carousel | none | `.carousel-hero-banner` swiper-fade |
| 2 | content-carousels | colour gallery / featured products / designer collections / testimonial / tools carousels | L | 1/1 | rebuild-native | self | pending | carousel (authored rows) | none — editorially curated | draft rows 12 |
| 3 | lead-form | "Painting Service" lead form (name, mobile, email, pincode, service radios) | F | 1/1 | client-only | needs-business-decision | pending | forms.md local capture | submission endpoint on the new host (owner); UI rebuilt, submit shows "no backend connected" | draft rows 9, 10; `.form.white-form` |
| 4 | faq-accordion | FAQ accordion | M | 1/1 | rebuild-native | self | pending | accordion | none | `.accordion.faq` |
| 5 | header-modals | header: book-site-visit modal, cart, login, menus (aria-haspopup) | M | 1/1 | rebuild-native | self | pending | chrome-interaction | cart/login backends are owner decisions; UI per header contract | draft rows 14–17 |
| 6 | video-shorts | "Inspiring ideas" video shorts widget (SaleAssist vtiles) | V | 1/1 | embed-passthrough | needs-business-decision | pending | embed-passthrough | SaleAssist account on the new host; interim: static tiles as captured | draft rows 1, 13, 24, 27, 31 |
| 7 | detect-location | GET /apcolourcatalogue/detect-location | A | 1/1 | static-snapshot | needs-business-decision | pending | off-origin-data | undecided — revisit at rollout (host-bound, 404 on target) | draft row 2 |
| 8 | site-config | GET /eds/configs/site-config.json, /apcolourcatalogue/commerce/miniCart.json | D | 1/1 | static-snapshot | self | pending | sheet-sync | undecided — revisit at rollout (host-bound) | draft rows 7, 8 |
| 9 | settings-objects | digitalData / dataLayer / adobeDataLayer | A | 1/1 | static-snapshot | self | scaffolded-awaiting-owner | read-settings | carried in the martech contract | draft rows 3–5 |
| 10 | martech | Adobe Launch, GTM, GA/Ads, Adobe Analytics/ECID, Web SDK, session replay, Facebook/Bing pixels, OneTrust | T | 1/1 | embed-passthrough | needs-business-decision | scaffolded-awaiting-owner | consent-gated-tags | owner enables per route in `stardust/martech-handoff.md`; all parts disabled | draft rows 18–23, 28–30 |
| 11 | other-3p | cdn.socket.io, cdn.gumlytics.com | T | 1/1 | static-snapshot | needs-business-decision | pending | inspect | undecided — revisit at rollout | draft rows 25, 26 |
| 12 | main-at-load | main empty at load (EDS decoration) | CR | 1/1 | static-snapshot | self | delivered-by-capture | — | none — rendered capture is complete (16.8k chars main text) | draft row 6 |
| 13 | locale | locale variants en | I18N | 1/1 | static-snapshot | needs-business-decision | pending | locale-tree | undecided — single-page scope | draft row 11 |
| 14 | commerce | commerce signals (cart) | X | 1/1 | static-snapshot | needs-backend | pending | — | undecided — revisit at rollout (commerce backend on new host) | draft row 32 |

## Decision batch
One message to the owner:
- **Tags & consent**: enable routes in `stardust/martech-handoff.md` (Launch, GTM, OneTrust CMP, Web SDK); all ship disabled.
- **Lead form**: which endpoint receives "Painting Service" submissions on the new host.
- **Video shorts (SaleAssist)**: keep the vendor widget on the new host?
- **Cart / login / store-locator data** (detect-location, miniCart, site-config): served from the existing commerce origin or rebuilt.

## Register (decided-out)
| feature | reason | production statement |
|---|---|---|
| — | none | — |
