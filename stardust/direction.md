---
_provenance:
  writtenBy: stardust:replica
  writtenAt: 2026-10-19T16:48:00Z
  againstInput: https://asianpaints.com/
  readArtifacts:
    - stardust/current/pages/index.json
    - stardust/replica/tokens.json
---

# Direction — preserve mode (same-design migration)

Mode: PRESERVE. The target spec is the captured current state of https://www.asianpaints.com/
(https://asianpaints.com/ redirects there), synthesized (no direct invocation, no creative decisions).

Synthesized (bounded-single): current/pages/index.json + Phase-3 CSS lift → PRODUCT.md · DESIGN.md · DESIGN.json (at 2026-10-19T16:48:00Z)

Permitted deltas: ONLY the entries of stardust/replica/inconsistency-register.md
(empty — pure replica).

Fidelity: ia verbatim · design verbatim · content verbatim.

## Link-audit decision (E2-link-audit, 2026-10-19)

Scope is one page (bounded single). Every internal target of the home page, nav and footer other than `/` is outside the declared cap → SCOPE EXTENSION → kept pointing at the source site (`https://www.asianpaints.com/…`, absolute, verbatim from the capture); `localize-links --check` passes (0 localizable). Delivered internal links: `/` and the root-relative `/media/*` videos, all 200. No captured page is repointed (the only captured page is delivered).
