# Separate-origin banner wrappers

The Worker serves only `/ad-frame/<32-hex-key>` from the portfolio's static export, at `https://ads.notvc.to`. The portfolio must publish those generated wrappers first. It returns HTML with explicit framing restrictions and an origin-keyed agent cluster to prevent document.domain relaxation.

The frame permits scripts and same-origin access within the ad origin, allowing Adsterra to populate its about:blank creative frame. Cross-origin rules prevent it reading the portfolio. The parent validates both the message origin and the frame window. This separates document access, not all third-party tracking: both hosts are still same-site, and advertising partners can receive requests and use their own storage after consent.

## Deploy

From the repository root, authenticate to the Cloudflare account that owns `notvc.to`:

```
pnpm dlx wrangler login
pnpm dlx wrangler deploy --config cloudflare/ads/wrangler.jsonc
```

Wrangler's custom-domain configuration creates the DNS record and certificate. Do not point the subdomain at GitHub Pages; its canonical-domain redirects would lose the origin separation. If an existing `ads` DNS record conflicts, inspect it before replacing it.

Alternatively, create a Worker through the Cloudflare dashboard, paste `worker.mjs` into its editor, deploy it, then add `ads.notvc.to` under the Worker's Settings → Domains & Routes → Add → Custom Domain. No secrets are required by the Worker.

## Activation order

1. Publish the static `/ad-frame/<key>` routes on the portfolio.
2. Deploy the Worker and custom domain.
3. Check one wrapper returns HTTP 200 and Content-Type text/html from ads.notvc.to, without redirecting to notvc.to.
4. Publish the portfolio change that loads the cross-origin wrappers.
5. Verify a real banner after consent, and confirm withdrawal removes its frame.

Confirm Adsterra accepts these units when their loader is served from the subdomain. Never click live ads to test. Roll back by disabling NEXT_PUBLIC_ADSTERRA_ENABLED and rebuilding the portfolio.
