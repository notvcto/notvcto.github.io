# Advertising setup

Live advertising defaults to disabled. The publisher account is `ca-pub-7234987851785688`; the ownership meta tag and `/ads.txt` are published independently of serving. There are no production placeholder boxes while serving is disabled.

## Verify the site first

Deploy the site, then add `notvc.to` in AdSense and select ownership verification using the account meta tag. Complete the account setup and request review. The privacy policy is at `https://notvc.to/privacy`.

Keep Auto ads off. The application places display units explicitly; do not enable automatic placement, mobile size expansion, or filling/optimizing empty placements. Advertiser creatives retain their original appearance inside the site's labeled frames.
Keep Google's blocking-recovery overlay off; the site uses its own optional, dismissible inline note.

## Prepare consent and placements

In AdSense Privacy & messaging, publish the applicable Google consent messages. Enable consent, refusal, and managing options; configure the European regulations message and relevant US-state privacy choices. Google's certified CMP and ad runtime determine what advertising is eligible under the reader's choices. The app does not override consent or force personalization. The blog's Privacy and cookie settings control reopens Google's message once its API is available.

Create four responsive display units and record each `data-ad-slot` value:

| Unit | Repository variable |
| --- | --- |
| Blog introduction | `NEXT_PUBLIC_ADSENSE_INTRO_SLOT` |
| Blog article end | `NEXT_PUBLIC_ADSENSE_END_SLOT` |
| Blog desktop sidebar | `NEXT_PUBLIC_ADSENSE_SIDEBAR_SLOT` |
| Blog landing footer | `NEXT_PUBLIC_ADSENSE_INDEX_SLOT` |

These IDs and the publisher ID are public, not secrets. Configure them as GitHub Actions repository variables. `NEXT_PUBLIC_ADSENSE_CLIENT` optionally overrides the publisher ID. Set `NEXT_PUBLIC_ADSENSE_ENABLED=true` only once AdSense reports the site as Ready and consent messages are published. All four numeric slot IDs and a valid publisher ID must be present; incomplete configuration disables serving.

Changes to repository variables require a new build/deployment. Run the Pages workflow manually after changing them. Set `NEXT_PUBLIC_ADSENSE_ENABLED=false` and rebuild to disable advertising.

## Verify without live advertising traffic

The standard browser checks block Google's advertising endpoints. `node scripts/check-ads.mjs` checks the disabled verification export; `node scripts/check-ads.mjs --enabled` exercises a serving-enabled export using an intercepted SDK and mocked advertiser frames. Never click a live ad during testing.

For an enabled local fixture build, set the serving flag and all four slot variables to numeric fixture values before building. Serve that export on loopback and run the enabled check, then rebuild with serving disabled before preparing the verification deployment. Test IDs must not be deployed.

Main compartments reserve 100px for the creative. The 300×250 sidebar unit appears only at 1280×900 or larger with a fine pointer. Unfilled slots below the viewport collapse; visible or already-passed slots retain their reserved space to avoid moving the reader's text. A conservative CSS-blocking probe can show one optional note; network failures, consent refusal, and unfilled inventory do not establish adblocking.

Leaving the blog removes the compartments and pending initialization work. Smooth navigation retains an already-loaded Google runtime until a full document reload. Direct visits to the portfolio, résumé, wishlist, or privacy page do not load the advertising SDK. The CMS and its private previews do not integrate this advertising runtime.
