# Martech hand-off

Everything below is scaffolded **off**. To ship it, set `enabled: true` on `consent.cmp` and on each route in `stardust/martech-contract.json`, then re-run `deploy/scripts/martech-scaffold.mjs` and `dynamics/scripts/dynamics-check.mjs` to confirm the enabled tags load. Enabled tags load on `www.asianpaints.com` only; preview with `?martech=on` (add `&consent=accept` to grant every category).

## Consent

- **CMP:** OneTrust · `data-domain-script` = `433d1cae-89f6-480b-a880-b80ddb341a2c` (read from `/eds/scripts/delayed.js`, which loads `otSDKStub.js` on idle) — copy it into the contract. A production domain script only serves its listed domains; preview hosts may need the `-test` script.
- **Model `owner-decision`:** no consent gating on the source. The banner is notice-only: both Web SDK instances, GA4 (`gcs=G111`) and session replay send before any choice is made. Keep the source behaviour (route `category` null), or set a route `category` to a consent group id to load that tag manager only once the group is granted.
- **Categories:** no CMP configuration read — run `spec-martech.mjs` first, or decide categories with the owner.

## Routes

| id | vendor | src | CMP groups listing its host | enabled |
|---|---|---|---|---|
| adobe-launch | Adobe Launch | `https://assets.adobedtm.com/ef0f7eb243a4/50bf6aad1917/launch-aa461fb6c86d.min.js` | — | false |
| google-tag-manager | Google Tag Manager | `https://www.googletagmanager.com/gtm.js?id=GTM-MP96GBBF` | — | false |

Also seen, not routed (loaded by the tag manager or inline on the source — confirm each still fires): analytics: Adobe Experience Platform Web SDK (the source's `alloy1` instance — see Web SDK below) · analytics: session replay (Microsoft Clarity, loaded with the Facebook, GA4, Google Ads and DCM Floodlight beacons by `/eds/scripts/third-party-pixels.js`).

## Rewrite before go-live

Nothing found (or no tag-manager library read).

## Data layer

The source pages expose `adobeDataLayer`, `dataLayer`, `digitalData`; keep the same global names.

Page-level pushes, read from `/eds/scripts/analytics_1.js` — carry them over once per page, before the tag managers load:

| global | push | shape |
|---|---|---|
| `digitalData` | page context | `page`, `utmValues`, `product`, `skuCodeList`, `device`, `user`, `event` |
| `adobeDataLayer` | `pageLoad` | `apDataLayer()`: `eventInfo`, `login`, `form`, `product`, `page` (`pageName` `in::<path segments>`, `section1`–`4`, `pageURL`, `referringUrl`, `timestamp`), `user`, `device`, `utmValues` |
| `dataLayer` | `page_view` | `page_location`, `page_referrer`, `page_title` |

The source also exposes `window.apDataLayer` and `window.getAdobeBasePayload` for Launch custom code.

Adobe Launch (`launch-aa461fb6c86d.min.js`, property "Asian Paints WebSDK"): extensions Core, Adobe Client Data Layer, Adobe Experience Platform Web SDK; rule events Library Loaded, Data Pushed, Data Layer Computed State, Query String Parameter; actions Send event, Update variable, Custom Code. Its rules start on the `pageLoad` push — without it the library loads and sends nothing. Google Tag Manager rules were not parsed. Record both in the contract's `tagNotes`, keyed by tag manager, each citing where it was read (`from`).
Interaction pushes (`custom_cta_click`, `scroll_depth`, carousel navigation, forms, login, chat) live in the blocks on the source. Ask the owner for the tagging plan (solution design reference): each event, its payload and the interaction that pushes it. With it, add each push in the block that owns the interaction.

## Web SDK (aem-martech)

The source runs two Adobe Experience Platform Web SDK instances, both in org `5FFF4CAB563CB2507F000101@AdobeOrg`:

| instance | loaded by | datastreamId | edge domain |
|---|---|---|---|
| `alloy` | Adobe Launch (Web SDK extension, managed library) | `a1a44315-9bad-4b66-bcff-8fca622eed97` | `apl.data.adobedc.net` |
| `alloy1` | the source's own `/eds/scripts/analytics_1.js`, outside Launch | `b1c04e90-7e5a-4cf7-b97f-341ac97dec1d` | `edge.adobedc.net` |

The `aem-martech` plugin can load `alloy1` on the migrated site instead. Launch keeps its own managed `alloy` through the `adobe-launch` route. It is off; the routes above stay the default.

- **orgId:** `5FFF4CAB563CB2507F000101@AdobeOrg` · **instance:** `alloy1` · **edge domain:** `edge.adobedc.net`
- **datastreamId:** `b1c04e90-7e5a-4cf7-b97f-341ac97dec1d` (staging hosts `beta.asianpaints.com`, `prod2.asianpaints.com` use `eab18d73-1507-436b-9655-52c600b63d9e` on the source)
- **defaultConsent:** source `in`; the plugin defaults to `pending` and sends nothing until `updateUserConsent`. With `aemMartech.category` set, the scaffold starts the SDK `pending` whatever this value and grants `collect` once the CMP grants that group; without a category, this value applies as is.
- **Web SDK config (`aemMartech.config.webSdk`):** `idMigrationEnabled: true`, `thirdPartyCookiesEnabled: false`, `clickCollectionEnabled: true`, `targetMigrationEnabled: false`, `personalizationStorageEnabled: false` — as the source configures `alloy1`.
- **Plugin options (`aemMartech.config.options`):** `dataLayer: false` — Launch's Adobe Client Data Layer extension owns `adobeDataLayer`; the source's `alloy1` does not read it.
- **Analytics variables (`aemMartech.config.beforeSend`):** the source's `alloy1` page view carries `data.__adobe.analytics` — `pageName`, `eVar2` (New/Repeat), `eVar5`/`prop5` (timestamp), `eVar6`/`prop6` (URL), `eVar9` (login status), `eVar12` (ECID), `eVar51` (load time), `eVar54`/`prop54`, `eVar120` (GA client id), `prop1` (section), `prop12` (previous page), `prop13` (scroll depth), UTM `eVar0`/`eVar38`/`eVar39`/`eVar87`, `server`, `currencyCode` `INR`. Add them from an `onBeforeEventSend` module on page views.
- **Target:** the source sends mbox parameters with `renderDecisions: false`; not carried over (`target` null).

To switch: (1) `git subtree add --squash --prefix plugins/martech https://github.com/adobe-rnd/aem-martech.git main`; (2) fill `aemMartech.config` as above with instance `alloy1` and `launchUrls` empty, and keep the `adobe-launch` route enabled — the instance names differ, so Launch's Web SDK extension needs no change; (3) set `aemMartech.enabled`; (4) re-run the scaffold.
