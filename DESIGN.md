---
_provenance:
  writtenBy: stardust:replica
  mode: bounded-single
  writtenAt: 2026-10-19T16:48:00Z
  synthesizedFrom:
    - stardust/current/pages/index.json
    - stardust/replica/tokens.json
colors:
  background: "#fff"
  text: "#222"
  heading: "#232426"
  primary: "#431a80"
  accent: "#fcaf17"
  accent-hover: "#e59d15"
  cream-bg: "#fefcf7"
  surface-cream: "#faf6ef"
  black: "#000"
typography:
  body: "Manrope, manrope-fallback, sans-serif"
  heading: "Manrope, manrope-fallback, sans-serif"
rounded:
  mode: 10px
  pill: 50%
---

# Design — Asian Paints home (descriptive, bounded-single)

Descriptive capture of https://www.asianpaints.com/ — the replica target. Every value traces to
the source's own CSS (`/eds/styles/styles.css` :root) or the computed-style census
(`stardust/current/_computed-styles.json`). Full lifted table: `stardust/replica/tokens.json`.

## Colour
White page with black feature bands (Colour Tools, interiors shop, Inspiring ideas, bottom bar) and
cream (#faf6ef / #fefcf7) surfaces; brand purple #431a80 for links, saffron #fcaf17 for primary CTAs,
red accents (#ed1c24 / #df0f29 / #f14950) on section titles; brand gradient
270deg orange → red → purple.

## Typography
Manrope only (300–800, self-hosted TTF), metric-matched Arial fallback face. Mobile-first ramp
(body 22/19/17, headings 55→22) stepping down at min-width 900px (body 18/16/14, headings 45→18).
Headings weight 500, line-height 1.2. Census heading sizes at 1440: 64, 60, 54, 40, 32, 24 px.

## Layout
Fluid container (cap-probe: no shell cap). Header 126px mobile / 140px ≥992px. Body `zoom` steps
0.7 → 1 between 992 and 1439px (1 at ≥1440). Global border-box.

## Shape
Signature radius 10px; circular controls (50%).
