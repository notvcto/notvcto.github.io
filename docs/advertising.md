# Advertising setup

The blog uses optional Adsterra display banners. Serving defaults to disabled. Set the GitHub Actions repository variable `NEXT_PUBLIC_ADSTERRA_ENABLED=true` and rebuild only after reviewing real creatives, tag compatibility, and the account's consent requirements. Set it to `false` and rebuild to stop serving.

Public unit keys and dimensions live in `lib/ads.ts`; the supplied tags load from `https://bauval.org/22/<key>`. No account credentials belong in source. The existing intro, article-end, index-footer, and desktop-sidebar placements remain. Native Banner, Popunder, Social Bar, and Smartlink tags are not integrated. Keep adult inventory disabled in Adsterra.

## Placement and lifecycle

Each display tag runs inside a separate sandboxed frame at `ads.notvc.to`, served by the Worker in `cloudflare/ads`. Its same-origin permission allows the vendor to populate its own blank creative frame; the different origin prevents access to the portfolio document. The Worker generates the wrapper HTML directly, with no upstream fetch. The parent verifies both the sending frame and message origin. Banner configuration and script execution remain separate for each placement. See `cloudflare/ads/README.md` for deployment order. Do not serve these same-origin-enabled frames from the portfolio origin.

Content placements select 468×60 or 320×50 from the usable content width, accounting for padding. The sidebar uses 300×250 and retains its existing desktop-only visibility rule. Undersized or hidden placements make no ad requests. Near-viewport frames load once per mount/selected size, stay mounted while scrolling, and are removed on route exit, withdrawal, or incompatible resize. There is no timed refresh.

Loading an inner frame or image reveals the banner; this is not proof of paid fill. Scripts that fail or produce no detectable content within 15 seconds collapse their compartment. A frame-level fallback handles a stalled document. Network errors alone never trigger the adblock notice.

## Consent and disclosures

A first-party panel asks visitors to allow or decline Adsterra advertising before any ad requests. Both choices are available without restricting content. The versioned preference lasts up to 180 days in local storage, with an in-memory fallback. Blog privacy settings reopen it. Withdrawal removes all ad frames; it cannot delete data or cookies already held by third parties. Previous Google consent does not authorize Adsterra.

This panel gates script loading; it is not a certified CMP and does not manufacture IAB consent strings. Confirm the current account/vendor requirements, including whether a supported CMP is required, before live serving. Update the disclosure or consent integration if the account requires additional purposes, vendors, or signals.

The privacy page describes Adsterra and links to its privacy policy. The old Google ownership tag, authorization entry, runtime and Funding Choices controls have been removed.

Set `ADSTERRA_ADS_TXT` to the exact multiline seller records supplied by the account, then rebuild. Until records are supplied, `/ads.txt` contains only a comment. Do not derive seller IDs from banner keys.

## Checks and activation

`node scripts/check-ads.mjs` checks a disabled export. For local enabled fixtures, build with `NEXT_PUBLIC_ADSTERRA_ENABLED=true`, serve the export on loopback, then run `node scripts/check-ads.mjs http://127.0.0.1:4173 --enabled`. The fixture intercepts Adsterra tags and blocks all external requests; no live ad impressions or clicks are used.

The general browser checks explicitly block the configured banner host as well as legacy Google endpoints. If the tag host changes, update both the config/loader and request blockers.

Before live activation, confirm Adsterra permits reuse of the supplied units across the configured placements, obtain any required ads.txt lines, confirm consent requirements, and review banner appearance and advertiser navigation in a controlled preview. Never click live ads to test revenue. Rebuild with serving disabled after fixture testing. Neither the CMS nor private previews load these tags.
