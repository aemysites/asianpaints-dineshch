# Header behaviour — findings that need the site owner's decision

`chrome-compare.mjs` (profile replica) clears an error only by a fix or a site-owner decision in
`stardust/chrome/header-decisions.json` (`{ decisions: [{ finding, decision, reason, by, at }] }`, signed by a person).
Fixed during the run: search Enter now goes to `https://www.asianpaints.com/searchresult.html?q=…` (as the source);
a desktop click on a hover-opened menu keeps it open (as the source). Delivered mega menus match the source panels
item for item (Colours: crops compared; Products, Services, Calculators, Professionals, More… open on hover + keyboard).

| finding | what it is | suggested decision |
|---|---|---|
| `search [type]` | The source typeahead (13 suggestions) is served by Unbxd autosuggest under the Asian Paints account (`search.unbxd.io/…/autosuggest`). Host-bound third-party service. | Owner: enable Unbxd on the new host (then rebuild the typeahead), or accept "no typeahead; Enter goes to the source results page". |
| `Careers [hover]`, `Investors [hover]` | The "revealed link" is the source's chat bubble appearing on a timer (crop: underline only + chat icon). Instrument artifact. | accept (not a header behaviour) |
| `More... [key]`, `Colours [key]` | Keyboard Enter on the source only shows a focus ring; the explorer recorded the whole header strip (22 links) as the panel. Instrument artifact. | accept |
| `Products [click]`, `Calculators [hover]` panel-content / panel-visual | Source crops are the full header + viewport (1440×481, 1360×850), not the dropdown; the dropdown content itself matches. Instrument artifact. | accept |
| `motion Calculators [hover]` | Source record mixes in `button.color-gallery-nav` (opacity 300 ms, page carousel); the source dropdown itself is 200 ms transform/visibility/opacity, same as the build. Instrument artifact. | accept |
