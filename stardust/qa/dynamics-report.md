# Dynamics parity check — https://main--03cd0138--aemcoder.aem.live — 2026-10-19T19:39:42.840Z

Replayed 14 checks over 11 features · pass 14 · fail 0. Flows, not presence.

| feature | class | status | check | result | detail | third-party requests |
|---|---|---|---|---|---|---|
| hero banner carousel (fade, autoplay) | M | done | dom-count | PASS | 4 × .carousel-hero-banner .hero-slide (min 4) |  |
| hero banner carousel (fade, autoplay) | M | done | video-plays | PASS | iframe/video: false · video playing (Δt 0.81s) |  |
| colour gallery / featured products / designer collections / testimonial / tools carousels | L | done | dom-count | PASS | 9 × .color-gallery .color-gallery-slide (min 9) |  |
| colour gallery / featured products / designer collections / testimonial / tools carousels | L | done | dom-count | PASS | 3 × .featured-products .featured-products-slide (min 3) |  |
| colour gallery / featured products / designer collections / testimonial / tools carousels | L | done | dom-count | PASS | 4 × .designer-collections .designer-collections-card (min 4) |  |
| colour gallery / featured products / designer collections / testimonial / tools carousels | L | done | dom-count | PASS | 34 × .testimonial-carousel .testimonial-slide (min 34) |  |
| colour gallery / featured products / designer collections / testimonial / tools carousels | L | done | dom-count | PASS | 5 × .tools-carousel .tools-carousel-slide (min 5) |  |
| Painting Service lead form | F | scaffolded-awaiting-owner | dom-count | PASS | 4 × .form .form-field (min 4) |  |
| Painting Service lead form | F | scaffolded-awaiting-owner | dom-count | PASS | 5 × .form .form-radio-input (min 5) |  |
| FAQ accordion | M | done | dom-count | PASS | 19 × .accordion .accordion-item (min 19) |  |
| Inspiring ideas video shorts | V | interim | dom-count | PASS | 10 × .video-shorts .vs-tile (min 10) |  |
| Inspiring ideas video shorts | V | interim | video-plays | PASS | iframe/video: false · video playing (Δt 0.81s) |  |
| no uncaught exceptions | M | done | no-page-errors | PASS | none on 1 page(s) |  |
| martech: consent + tag routing | T | scaffolded-off | martech | PASS | no tag host requested (4 gated · 0 cross-site host(s) blocked) |  |

## Features without checks

- header modals, cart, login (M) — scaffolded-awaiting-owner · owner: cart and login backends on the new host
- detect-location, site-config, miniCart, commerce (A) — scaffolded-awaiting-owner · owner: host-bound Asian Paints APIs (location, site config, mini cart) on the new host
- cdn.socket.io, cdn.gumlytics.com (T) — scaffolded-awaiting-owner · owner: whether to carry these third-party scripts
- locale variants (I18N) — decided-out · owner: single-page scope: no locale trees
