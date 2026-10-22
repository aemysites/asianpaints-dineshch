# Martech hand-off

Everything below is scaffolded **off**. To ship it, set `enabled: true` on `consent.cmp` and on each route in `stardust/martech-contract.json`, then re-run `deploy/scripts/martech-scaffold.mjs` and `dynamics/scripts/dynamics-check.mjs` to confirm the enabled tags load. Enabled tags load on `www.asianpaints.com` only; preview with `?martech=on` (add `&consent=accept` to grant every category).

## Consent

- **CMP:** OneTrust · `data-domain-script` = **not found — copy it from the CMP admin into the contract**
- **Model `owner-decision`:** no evidence of consent gating inside the tag manager. Keep the source behaviour (route `category` null), or set a route `category` to a consent group id to load that tag manager only once the group is granted.
- **Categories:** no CMP configuration read — run `spec-martech.mjs` first, or decide categories with the owner.

## Routes

| id | vendor | src | CMP groups listing its host | enabled |
|---|---|---|---|---|
| adobe-launch | Adobe Launch | `https://assets.adobedtm.com/ef0f7eb243a4/50bf6aad1917/launch-aa461fb6c86d.min.js` | — | false |
| google-tag-manager | Google Tag Manager | `https://www.googletagmanager.com/gtm.js?id=GTM-MP96GBBF` | — | false |

Also seen, not routed (loaded by the tag manager or inline on the source — confirm each still fires): analytics: Adobe Experience Platform Web SDK · analytics: session replay.

## Rewrite before go-live

Nothing found (or no tag-manager library read).

## Data layer

The source pages expose `adobeDataLayer`, `dataLayer`, `digitalData`; keep the same global names.
Rules in Adobe Launch, Google Tag Manager were not parsed. Read each library listed in `martech/tags.json` and record its rules and data elements in the contract's `tagNotes`, keyed by tag manager, each citing where it was read (`from`); until then their triggers and events come from the tagging plan.
Ask the owner for the tagging plan (solution design reference): each event, its payload and the interaction that pushes it. With it, add each push in the block that owns the interaction.

## Web SDK (aem-martech)

The source runs the Adobe Experience Platform Web SDK outside Launch. The `aem-martech` plugin can load it on the migrated site instead. It is off; the routes above stay the default.

- **orgId:** **not found — fill it in the contract** · **instance:** `alloy` · **edge domain:** **not found — fill it in the contract**
- **datastreamId:** **not found — fill it in the contract**
- **defaultConsent:** source unknown; the plugin defaults to `pending` and sends nothing until `updateUserConsent`. With `aemMartech.category` set, the scaffold starts the SDK `pending` whatever this value and grants `collect` once the CMP grants that group; without a category, this value applies as is. Launch rules that call `setConsent` on the source are not read — set the category to keep a consent gate.

To switch: (1) `git subtree add --squash --prefix plugins/martech https://github.com/adobe-rnd/aem-martech.git main`; (2) in Launch, set the Web SDK extension to the self-hosted build with the same instance name and publish — otherwise the SDK loads twice; (3) set `aemMartech.enabled` and leave the `adobe-launch` route disabled (the plugin loads `launchUrls`); (4) re-run the scaffold.
