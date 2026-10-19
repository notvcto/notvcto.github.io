# Website code audit — October 19, 2026

What this repo does: It statically exports a Next.js portfolio, Markdown blog, bilingual resume, and bilingual wishlist to GitHub Pages. The browser adds animated WebGL backgrounds, smooth scrolling, search, localization, and approximate currency conversion. The assumed load is ordinary public traffic on desktop, tablet, and mobile, including slow devices and keyboard users; there is no application backend to load-test.

Three specialists reviewed rendering/performance, behavior/accessibility, and build/configuration. The coordinating review checked their evidence and traced cross-cutting flows. This includes the current uncommitted copy, Works, sphere-slicing implementation, and verification script. There is no finding cap. There are **44 findings** below, including explicitly marked defects in currently unused feature paths. Related symptoms are grouped where one fix addresses them.

The audit phase changed no application source. All 44 findings have since been implemented in the working tree; each finding below retains the original evidence and is marked implemented. Browser timings remain software-renderer diagnostics, not hardware GPU guarantees.

## Must fix

### 1. Long articles are clipped on tablet screens — Implemented
[app/blog/layout.tsx:20](/home/vcto/notvcto.github.io/app/blog/layout.tsx:20)

**What this is:** The blog lays out its sidebar and article as flex children. **Problem:** The article keeps its minimum content width. Chrome measured its right edge at approximately 973 px on a 768 px viewport, with document overflow hidden horizontally. **Fix:** Allow the article flex child to shrink with `min-w-0`, and retain local horizontal scrolling inside code/table containers. **If skipped:** Tablet readers lose the right-hand part of article content.

### 2. Unlabelled fenced code loses indentation and line breaks — Implemented
[app/blog/[slug]/post-client.tsx:153](/home/vcto/notvcto.github.io/app/blog/[slug]/post-client.tsx:153)

**What this is:** The Markdown renderer chooses inline versus block styling from a language class. **Problem:** An unlabelled fenced block has no language class, so it gets inline styling; the surrounding `pre` is also replaced with a `div`. Current transcript examples in `zero-phase-2-fixing-the-pipes.md` have computed `white-space: normal`. **Fix:** Identify block code through the `pre` renderer and preserve preformatted whitespace independently of language labels. **If skipped:** Existing technical examples display incorrectly.

### 3. Article-list wheel input scrolls the page instead of the list — Implemented
[components/blog-sidebar.tsx:143](/home/vcto/notvcto.github.io/components/blog-sidebar.tsx:143), [components/blog-mobile-nav.tsx:130](/home/vcto/notvcto.github.io/components/blog-mobile-nav.tsx:130)

**What this is:** The sidebar and drawer each contain a scrollable article list under global Lenis wheel smoothing. **Problem:** Neither list opts out of Lenis interception. In Chrome, a sidebar wheel action changed page scroll from 0 to 184 while sidebar scroll stayed at 0. **Fix:** Add `data-lenis-prevent` to the nested scrollers, or use the installed library's corresponding nested-scroll option. **If skipped:** Long article lists are difficult to browse with a mouse wheel or trackpad.

### 4. Lint crashes before it checks any code — Implemented
[package.json:40](/home/vcto/notvcto.github.io/package.json:40)

**What this is:** The project installs ESLint 10.6.0 with the installed React plugin 7.37.5. **Problem:** The plugin calls an API removed in ESLint 10. Direct execution reproduces `contextOrFilename.getFilename is not a function`. **Fix:** Pin a compatible ESLint 9 release, update the lockfile, and then address the real lint findings. **If skipped:** The project's lint command remains unusable.

## Should fix

### 5. The production start command cannot serve the configured output — Implemented
[package.json:10](/home/vcto/notvcto.github.io/package.json:10), [next.config.mjs:3](/home/vcto/notvcto.github.io/next.config.mjs:3)

**What this is:** `start` invokes `next start`, while the site uses `output: "export"`. **Problem:** Installed Next.js explicitly rejects this combination. GitHub Pages deployment itself does not use that command. **Fix:** Remove the unsupported script and document static preview, or replace it with an appropriate static-output preview command. **If skipped:** Someone following the normal build/start workflow cannot preview production output.

### 6. Resizing an open mobile drawer leaves the page scroll-locked — Implemented
[components/blog-mobile-nav.tsx:42](/home/vcto/notvcto.github.io/components/blog-mobile-nav.tsx:42)

**What this is:** Opening the drawer sets body overflow to hidden. **Problem:** Crossing the desktop breakpoint hides the drawer without closing it. Chrome confirmed `overflow: hidden` remains while the dialog has `display: none`. **Fix:** Close it when the desktop media query becomes active and restore the previous overflow state. **If skipped:** A resize or orientation change can leave an invisible modal's scroll lock active.

### 7. Mobile overlays lack a complete keyboard lifecycle — Implemented
[components/blog-mobile-nav.tsx:70](/home/vcto/notvcto.github.io/components/blog-mobile-nav.tsx:70), [components/navbar.tsx:127](/home/vcto/notvcto.github.io/components/navbar.tsx:127)

**What this is:** Both components present full-screen navigation overlays. **Problem:** Focus is not moved inside or contained, Escape is not handled, and focus is not explicitly restored; the main-menu trigger also lacks expanded state. Chrome confirmed Escape leaves the blog dialog open. **Fix:** Add initial focus, Tab containment, Escape dismissal, focus restoration, and the appropriate trigger state to these components. **If skipped:** Keyboard users can navigate behind the overlay and cannot dismiss it through the usual keyboard action.

### 8. Selecting the current article leaves its drawer open — Implemented
[components/blog-mobile-nav.tsx:38](/home/vcto/notvcto.github.io/components/blog-mobile-nav.tsx:38)

**What this is:** Drawer dismissal depends on a pathname change. **Problem:** Selecting the highlighted current article does not change that path. **Fix:** Close the drawer when any article link is activated. **If skipped:** The content remains covered after a valid article selection.

### 9. Static content is withheld until JavaScript runs — Implemented
[app/wishlist/wishlist-client.tsx:275](/home/vcto/notvcto.github.io/app/wishlist/wishlist-client.tsx:275), [app/wishlist/[id]/item-client.tsx:114](/home/vcto/notvcto.github.io/app/wishlist/[id]/item-client.tsx:114), [app/template.tsx:31](/home/vcto/notvcto.github.io/app/template.tsx:31)

**What this is:** Wishlist bodies return null before their mount effects, and the shared route wrapper starts transparent. **Problem:** The wishlist has no server-rendered main content even though all item data is available, while route content requires animation hydration to become visible. The no-JavaScript wishlist check found no `main`. **Fix:** Render deterministic default content immediately; make animation an enhancement rather than the prerequisite for displaying content. **If skipped:** Failed or delayed JavaScript produces blank content, and simple indexers cannot read the wishlist body.

### 10. Reduced-motion preferences are ignored — Implemented
[components/smooth-scroll.tsx:8](/home/vcto/notvcto.github.io/components/smooth-scroll.tsx:8), [components/sentient-sphere.tsx:141](/home/vcto/notvcto.github.io/components/sentient-sphere.tsx:141), [app/globals.css:194](/home/vcto/notvcto.github.io/app/globals.css:194)

**What this is:** The site has perpetual animation and animated scrolling. **Problem:** There is no reduced-motion handling; browser emulation confirmed the marquees continue running. **Fix:** Honor the preference in Lenis, the sphere, perpetual Motion effects, and CSS animations. **If skipped:** Visitors requesting reduced motion still receive the full motion experience.

### 11. The homepage sphere does not receive its intended mouse input — Implemented
[components/sentient-sphere.tsx:48](/home/vcto/notvcto.github.io/components/sentient-sphere.tsx:48), [components/smooth-scroll.tsx:8](/home/vcto/notvcto.github.io/components/smooth-scroll.tsx:8)

**What this is:** Sphere tilt reads Fiber's canvas pointer. **Problem:** The content layer covers the background canvas and its event wrapper. Browser hit testing and pointer-event counting confirmed that ordinary hero mouse movements do not reach that wrapper. **Fix:** Use a shared event source with client coordinates, or a cleaned-up window pointer listener. **If skipped:** The advertised interactive tilt stays inactive during normal use.

### 12. Spanish category names do not work in wishlist search — Implemented
[app/wishlist/wishlist-client.tsx:235](/home/vcto/notvcto.github.io/app/wishlist/wishlist-client.tsx:235)

**What this is:** Search includes category keys as well as localized titles and notes. **Problem:** The displayed category `Herramientas` is searched as the raw key `Tools`. **Fix:** Search the localized category label, optionally retaining the original key too. **If skipped:** A reader can search a displayed category name and fail to find its products.

### 13. Wishlist controls do not expose their names and states consistently — Implemented
[app/wishlist/wishlist-client.tsx:359](/home/vcto/notvcto.github.io/app/wishlist/wishlist-client.tsx:359)

**What this is:** Search, sorting, category filters, view mode, and shipping disclosure are interactive controls. **Problem:** The sort label is an unrelated paragraph; search relies on a placeholder; filter/view selection and shipping expansion are mostly conveyed visually. **Fix:** Associate labels with inputs and add `aria-pressed`, `aria-expanded`, and `aria-controls` where applicable. **If skipped:** Assistive technology cannot reliably identify controls or announce their current states.

### 14. Hidden carousel images repeat product names to screen readers — Implemented
[app/wishlist/wishlist-client.tsx:74](/home/vcto/notvcto.github.io/app/wishlist/wishlist-client.tsx:74)

**What this is:** Every image in a product carousel stays mounted, with opacity controlling visibility. **Problem:** Each carries the same English alt text, including invisible images and Spanish views. **Fix:** Give decorative card images empty alt text because the adjacent heading already identifies the linked product; retain meaningful alt text on detail views. **If skipped:** Product links are announced repetitively and with mixed-language text.

### 15. Spanish item details retain English language semantics — Implemented
[app/wishlist/[id]/item-client.tsx:119](/home/vcto/notvcto.github.io/app/wishlist/[id]/item-client.tsx:119)

**What this is:** The item page can switch its content to Spanish. **Problem:** Its container does not set `lang`, so it inherits the root's English declaration. **Fix:** Add `lang={lang}` to the item content container, matching the list and resume. **If skipped:** Screen readers use English pronunciation rules for Spanish content.

### 16. Post timestamps represent different instants in different browsers — Implemented
[content/blog/ferber-kernel-core-to-userspace.md:6](/home/vcto/notvcto.github.io/content/blog/ferber-kernel-core-to-userspace.md:6), [app/blog/blog-index-client.tsx:40](/home/vcto/notvcto.github.io/app/blog/blog-index-client.tsx:40)

**What this is:** Authored timestamps omit a timezone offset and are passed to `new Date()`. **Problem:** The current newest timestamp resolves to 12:00 UTC in Santo Domingo, 15:00 UTC in Los Angeles, and 23:00 UTC on the previous day in Tokyo. The relative-age label therefore varies incorrectly; future values can also be described as “ago.” **Fix:** Store explicit offsets or UTC timestamps, validate them, and handle future dates deliberately. **If skipped:** Publication metadata and last-updated ages disagree across visitors.

### 17. The currency table contains retired currency assignments — Implemented
[lib/currency.ts:28](/home/vcto/notvcto.github.io/lib/currency.ts:28), [lib/currency.ts:55](/home/vcto/notvcto.github.io/lib/currency.ts:55)

**What this is:** A hard-coded region table chooses a local currency. **Problem:** The resolver currently returns BGN for Sofia and ANG for Curaçao. Bulgaria adopted EUR on January 1, 2026, and Curaçao/Sint Maarten changed to XCG in 2025. **Fix:** Update these mappings and add the corresponding resolver assertions. **If skipped:** Affected visitors receive obsolete currency selections or fall back when a retired rate is unavailable. Sources: [ECB](https://www.ecb.europa.eu/euro/changeover/bulgaria/html/index.en.html), [CBCS](https://www.centralbank.cw/functions/banknotes-coins/caribbean-guilder/frequently-asked-questions).

### 18. Two resume entries have the same React key — Implemented
[app/resume/resume-client.tsx:139](/home/vcto/notvcto.github.io/app/resume/resume-client.tsx:139)

**What this is:** Experience entries use organization plus period as their key. **Problem:** Two entries are `notvcto` plus `2024 — Present`; Chrome reports the duplicate. **Fix:** Use a stable unique identifier, or include the distinct role in this static data's key. **If skipped:** React cannot reliably distinguish those entries during reconciliation, and the warning persists.

### 19. Frontmatter validation accepts values that downstream code cannot handle — Implemented
[lib/blog.server.ts:20](/home/vcto/notvcto.github.io/lib/blog.server.ts:20)

**What this is:** The loader validates presence but not the complete runtime shape of metadata. **Problem:** Reproductions with mocked file reads show an unquoted YAML date becomes a Date object and later breaks `.split()`; numeric titles and tag elements break search. Current posts are valid. **Fix:** Validate the required strings, optional string fields, string tag elements, finite complexity, and valid dates at loading time, with filename/field errors. **If skipped:** An ordinary authoring mistake crashes a later rendering/search step instead of failing clearly at the boundary.

### 20. Frontmatter can replace the authoritative slug or article body — Implemented
[lib/blog.server.ts:51](/home/vcto/notvcto.github.io/lib/blog.server.ts:51), [scripts/generate-og.mjs:109](/home/vcto/notvcto.github.io/scripts/generate-og.mjs:109)

**What this is:** Parsed metadata is spread after filename-derived and parser-derived values. **Problem:** A frontmatter `slug: renamed` overrides the validated filename slug; `content: replaced` overrides the body. Mocked reads reproduced both. **Fix:** Spread metadata first and assign authoritative slug/body last in all loaders, including OG generation. **If skipped:** A metadata edit can create broken static routes, links, or substituted article text. This is an authoring-integrity issue, not a claim of remote exploitation.

### 21. Deployment bypasses the existing checks — Implemented
[.github/workflows/nextjs.yml:99](/home/vcto/notvcto.github.io/.github/workflows/nextjs.yml:99)

**What this is:** CI installs dependencies and builds before deploying. **Problem:** It runs neither lint nor the existing currency assertions; the slicing assertions are also unwired. Next build does not run this ESLint command. **Fix:** Repair lint, run lint and the pure currency check before upload, and wire the browser assertions into an explicit verification step with a local server. **If skipped:** Regressions covered by existing checks can still deploy successfully.

### 22. The blog landing page publishes homepage metadata — Implemented
[app/blog/page.tsx:1](/home/vcto/notvcto.github.io/app/blog/page.tsx:1), [app/layout.tsx:22](/home/vcto/notvcto.github.io/app/layout.tsx:22)

**What this is:** The blog page inherits metadata because it has no route-specific export. **Problem:** Browser inspection confirmed the portfolio title and the old “Interface Designer crafting intelligent digital experiences” description. **Fix:** Add blog-specific title, description, and social metadata, and update stale shared identity copy. **If skipped:** Search/share previews contradict the improved visible blog copy.

### 23. Every article loads the all-language syntax highlighter — Implemented
[app/blog/[slug]/post-client.tsx:10](/home/vcto/notvcto.github.io/app/blog/[slug]/post-client.tsx:10)

**What this is:** The client imports the full Prism variant. **Problem:** Installed source imports `refractor/all`, which registers the entire language registry even though the posts use only a handful of fence labels. **Fix:** Use the installed light variant and register the grammars the content uses, with plain-text fallback. **If skipped:** Article visitors keep downloading and initializing unnecessary highlighting code. No exact production byte saving was measured.

### 24. The blog index serializes an article body it never displays — Implemented
[app/blog/page.tsx:5](/home/vcto/notvcto.github.io/app/blog/page.tsx:5)

**What this is:** The index loads all full posts and passes the newest full post to its client component. **Problem:** The client uses its title and slug, not its content. The current newest body alone is 35,938 UTF-8 bytes before serialization/compression. **Fix:** Use the existing metadata loader and a metadata-only prop type. **If skipped:** The landing page transfers unused article text and performs unnecessary full-post loading.

### 25. Cached/API exchange rates are not checked before multiplication — Implemented
[lib/currency.ts:325](/home/vcto/notvcto.github.io/lib/currency.ts:325), [lib/currency.ts:367](/home/vcto/notvcto.github.io/lib/currency.ts:367)

**What this is:** Browser storage and an external JSON response provide conversion rates. **Problem:** Any truthy rate is accepted; a cached value such as `rates.CAD = "bad"` produces a displayed NaN price, while a negative number produces a negative estimate. **Fix:** Require the selected rate to be a finite positive number and reject malformed cache/response data, falling back to authored USD. **If skipped:** Corrupt or changed external data can produce nonsensical estimates. This does not involve charging money.

### 26. In-memory exchange rates never expire — Implemented
[lib/currency.ts:322](/home/vcto/notvcto.github.io/lib/currency.ts:322), [lib/currency.ts:372](/home/vcto/notvcto.github.io/lib/currency.ts:372)

**What this is:** Disk cache entries have expiry metadata, but the shared memory cache holds only rates. **Problem:** Once loaded, `cached ?? readCache()` bypasses expiry on all later mounts in that tab. **Fix:** Keep the expiry alongside memory-cached rates and check it before reusing them; a page-lifetime polling system is unnecessary. **If skipped:** A long-lived tab can continue reusing expired rates when navigating between list and details.

### 27. Image rendering generates invalid paragraph/block nesting — dormant path — Implemented
[app/blog/[slug]/post-client.tsx:193](/home/vcto/notvcto.github.io/app/blog/[slug]/post-client.tsx:193)

**What this is:** The image renderer returns a `figure`, while the paragraph renderer remains a `p`. **Problem:** A normal standalone Markdown image produces `<p><figure>…</figure></p>`; a focused ReactMarkdown server-render reproduction confirmed that structure. Browsers repair it differently from React's expected tree. Current posts have no Markdown images. **Fix:** Let image-only paragraphs render the figure without a paragraph wrapper; keep ordinary prose paragraphs intact. **If skipped:** Adding an image post can introduce hydration/nesting errors.

### 28. The lightbox cannot be operated fully by keyboard — dormant path — Implemented
[app/blog/[slug]/post-client.tsx:221](/home/vcto/notvcto.github.io/app/blog/[slug]/post-client.tsx:221), [app/blog/[slug]/post-client.tsx:245](/home/vcto/notvcto.github.io/app/blog/[slug]/post-client.tsx:245)

**What this is:** A clickable image opens the overlay. **Problem:** The image is not a keyboard control; the overlay lacks dialog semantics, focus management, and a visible accessible close button. Escape handling exists, but does not solve opening/focus. Current posts do not exercise this feature. **Fix:** Use a real opening control and implement the dialog lifecycle in the existing viewer. **If skipped:** The first image-bearing post ships an inaccessible viewer.

### 29. “View on map” does not link to a map — dormant path — Implemented
[app/wishlist/[id]/item-client.tsx:234](/home/vcto/notvcto.github.io/app/wishlist/[id]/item-client.tsx:234), [lib/items.ts:70](/home/vcto/notvcto.github.io/lib/items.ts:70)

**What this is:** Purchase sources optionally accept coordinates and display a map call to action. **Problem:** The map text sits inside the store's link and still opens `source.url`; the existing map URL helper is unused. No current source defines coordinates. **Fix:** Make the map action a separate sibling link using the existing helper, or remove the dormant coordinate/map feature. **If skipped:** Adding a local source with coordinates presents a misleading map action.

## Nice to have

### 30. Marquee loops jump 16 pixels — Implemented
[components/tech-marquee.tsx:46](/home/vcto/notvcto.github.io/components/tech-marquee.tsx:46), [app/globals.css:181](/home/vcto/notvcto.github.io/app/globals.css:181)

**What this is:** Repeated tracks translate by half their total width. **Problem:** The 32 px flex gap has no final trailing counterpart, leaving the matching repeat 16 px beyond the reset point. DOM measurements confirmed the mismatch. **Fix:** Account for half the gap or give repeated groups consistent trailing spacing. **If skipped:** Each 50-second loop has a small visible discontinuity.

### 31. The footer clock rerenders while far offscreen — Implemented
[components/footer.tsx:12](/home/vcto/notvcto.github.io/components/footer.tsx:12)

**What this is:** A millisecond clock schedules React state updates on every animation frame. **Problem:** It runs from homepage mount, including while the reader is at the hero and cannot see the footer. **Fix:** Run the ticker only while the footer is visible, preserving its visible behavior. **If skipped:** Homepage browsing retains avoidable React work. The size of its FPS impact was not separately measured.

### 32. Touch Works previews are fetched eagerly below the fold — Implemented
[components/works.tsx:143](/home/vcto/notvcto.github.io/components/works.tsx:143)

**What this is:** Touch devices mount five external project-preview images after hydration. **Problem:** The native images omit lazy loading, even though Works is below the initial viewport. **Fix:** Add `loading="lazy"` to those previews while keeping their reserved aspect ratio. **If skipped:** Mobile devices fetch offscreen preview images earlier than necessary. Download byte savings were not measured.

### 33. Marketplace detection never changes the rendered icon — Implemented
[app/wishlist/[id]/item-client.tsx:234](/home/vcto/notvcto.github.io/app/wishlist/[id]/item-client.tsx:234), [lib/marketplace-icons.ts:1](/home/vcto/notvcto.github.io/lib/marketplace-icons.ts:1)

**What this is:** A lookup matches store names/domains to icon keys. **Problem:** Every result still renders `ShoppingBasket`; only an extra wrapper/title differs. This is the helper's sole consumer. **Fix:** Render the existing generic basket directly and remove the unused lookup. **If skipped:** A pointless matching table and conditional remain maintenance work.

### 34. The half-star rating implementation is duplicated — Implemented
[app/wishlist/wishlist-client.tsx:33](/home/vcto/notvcto.github.io/app/wishlist/wishlist-client.tsx:33), [app/wishlist/[id]/item-client.tsx:19](/home/vcto/notvcto.github.io/app/wishlist/[id]/item-client.tsx:19)

**What this is:** List and detail views each implement the same rating logic. **Problem:** A change to half-star behavior requires two edits; the implementations differ chiefly in size. **Fix:** Share this existing feature with a size class instead of creating a general rating system. **If skipped:** The same behavior continues to require duplicate maintenance.

### 35. An unused class-name scaffold carries two direct dependencies — Implemented
[lib/utils.ts:1](/home/vcto/notvcto.github.io/lib/utils.ts:1), [components.json:15](/home/vcto/notvcto.github.io/components.json:15)

**What this is:** `cn` wraps `clsx` and `tailwind-merge`. **Problem:** Whole-tree search found no application caller; only the unused generator config references its alias. **Fix:** Remove the unused helper, generator scaffold/alias, and two direct dependencies if this scaffold is not being retained intentionally. **If skipped:** Unused helper code, dependencies, and generator configuration continue to be maintained without serving current application behavior. This is not a claimed bundle saving: unreferenced code is already excluded.

### 36. An animation package supplies no used utilities — Implemented
[app/globals.css:2](/home/vcto/notvcto.github.io/app/globals.css:2)

**What this is:** `tw-animate-css` is imported globally. **Problem:** Reference searches found none of its animation utilities in use; the used pulse/ping utilities are Tailwind's and marquees are local CSS. **Fix:** Remove the import and direct dependency. **If skipped:** An unnecessary dependency stays in the build and update surface.

### 37. Shader input and lighting setup do work with no effect — Implemented
[components/sentient-sphere.tsx:53](/home/vcto/notvcto.github.io/components/sentient-sphere.tsx:53), [components/sentient-sphere.tsx:144](/home/vcto/notvcto.github.io/components/sentient-sphere.tsx:144), [components/sentient-sphere.tsx:204](/home/vcto/notvcto.github.io/components/sentient-sphere.tsx:204)

**What this is:** The component assigns `uMouse` every interactive frame and adds an ambient light. **Problem:** Neither shader reads `uMouse`, and the custom shader does not consume lighting. **Fix:** Delete the unused uniform/update and light. **If skipped:** At least five unnecessary lines remain, including a per-frame array allocation.

### 38. Preference initialization stores an unused local result twice — Implemented
[app/wishlist/wishlist-client.tsx:107](/home/vcto/notvcto.github.io/app/wishlist/wishlist-client.tsx:107), [app/wishlist/[id]/item-client.tsx:56](/home/vcto/notvcto.github.io/app/wishlist/[id]/item-client.tsx:56)

**What this is:** Each initialization effect assigns `finalLang` while also setting the actual language state. **Problem:** Neither local result is ever read. **Fix:** Delete the unused local declarations and assignments. **If skipped:** The preference flow remains harder to read for no behavior.

### 39. The resume's project entry is stale relative to Works and the blog — Implemented
[lib/resume.ts:138](/home/vcto/notvcto.github.io/lib/resume.ts:138)

**What this is:** The resume describes the kernel project in both languages. **Problem:** It still names Wolfram and describes only the RISC-V target, while the current site features Ferber and its x86-64 work. **Fix:** Update this one bilingual entry to the current project name and demonstrated targets. **If skipped:** Visitors see conflicting project identities and an outdated scope across pages.

### 40. The article-search shortcut targets a hidden input on mobile — Implemented
[components/blog-sidebar.tsx:93](/home/vcto/notvcto.github.io/components/blog-sidebar.tsx:93)

**What this is:** The desktop sidebar installs a global Ctrl/Cmd+K handler. **Problem:** The sidebar remains mounted below its CSS breakpoint, so the handler prevents the shortcut's default action and tries to focus a hidden input. **Fix:** Only handle the shortcut when the desktop search is visible, or route it to mobile search deliberately. **If skipped:** Mobile/tablet users with keyboards get a swallowed shortcut.

### 41. Full-post and metadata loading duplicate parsing rules — Implemented
[lib/blog.server.ts:41](/home/vcto/notvcto.github.io/lib/blog.server.ts:41), [lib/blog.server.ts:68](/home/vcto/notvcto.github.io/lib/blog.server.ts:68)

**What this is:** Two loaders independently enumerate, parse, validate, construct, and sort the same posts. **Problem:** Changes to metadata handling, including findings 19–20, must be repeated in near-identical pipelines. **Fix:** Reuse one internal parsing/construction path and strip content where metadata is required; keep the existing public functions. **If skipped:** Authoring-boundary fixes remain easy to apply inconsistently.

### 42. Desktop and mobile search duplicate their filtering rule — Implemented
[components/blog-sidebar.tsx:104](/home/vcto/notvcto.github.io/components/blog-sidebar.tsx:104), [components/blog-mobile-nav.tsx:25](/home/vcto/notvcto.github.io/components/blog-mobile-nav.tsx:25)

**What this is:** Both views search title, short title, category, and tags with the same predicate. **Problem:** A normalization or search-rule fix requires two edits. **Fix:** Put the shared predicate in the existing blog utility module and keep both interfaces. **If skipped:** The two article-search behaviors can drift when maintained separately.

### 43. OG image caching omits the font assets it renders — Implemented
[scripts/generate-og.mjs:27](/home/vcto/notvcto.github.io/scripts/generate-og.mjs:27)

**What this is:** The image cache fingerprints the script and Three.js version. **Problem:** It also renders local font files, but changes to those files do not invalidate the manifest. Restored cached images can survive a font-package update. **Fix:** Include the two font file contents in the existing fingerprint. **If skipped:** Font updates can leave social images using stale typography until another cache input changes.

### 44. Some article metadata is too faint to read reliably — Implemented
[app/blog/[slug]/post-client.tsx:58](/home/vcto/notvcto.github.io/app/blog/[slug]/post-client.tsx:58)

**What this is:** Small labels such as “Complexity” and “Read Time” use muted text at 40% opacity. **Problem:** Over the base dark background, their achromatic theme values yield approximately 2.1:1 contrast, below the [WCAG 4.5:1 minimum for normal-size text](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html); the animated background makes the exact result vary. **Fix:** Increase label opacity/contrast while retaining the existing hierarchy. **If skipped:** Readers with reduced vision have difficulty reading functional metadata. This is a contrast issue, not a request to redesign the page.

## Verification and coverage

The three reviews covered the application route/client files, components, shared libraries, authored item/resume data, blog frontmatter and local asset references, scripts, configuration, dependency references, and GitHub Pages workflow. Main flows traced included Markdown loading/rendering, navigation/search, overlays, currency conversion/cache, bilingual rendering, printing, sprite-free WebGL background rendering, and static deployment.

Executed checks included TypeScript with no emit, `git diff --check`, all 12 currency assertions, direct ESLint reproduction, focused parser edge-case reproductions using mocked reads, and Chromium checks of code whitespace, nested wheel scrolling, drawer Escape/resize behavior, tablet overflow, no-JavaScript wishlist output, actual metadata, pointer delivery, marquee geometry, and reduced-motion emulation. The image paragraph issue was reproduced in isolated server-rendered ReactMarkdown output. Currency changeovers were checked against primary central-bank sources.

The new slicing functionality retains verified projection/buffer-size coverage. Its FPS logger is diagnostic: it does not assert a performance threshold and should not be presented as an automated guarantee of smoothness. Intentional sphere density, full-height composition, and the existing landing-page structure were not counted as defects.

**Verdict:** Fix clipped articles, broken code formatting, nested scrolling, and the unusable lint tool first. Then fix overlay behavior and put the existing checks in deployment CI.

**Lean:** At least 54 lines and 3 direct dependencies can be removed from the confirmed unused helper/marketplace/shader/animation setup, before accounting for additional deduplication. Unused dependency removal is a maintenance saving; production bundle savings were not quantified.

**Not checked during the original audit:** A fresh production build or OG regeneration, remote deployment/HTTP behavior, hardware GPU timings, actual screen-reader sessions, exhaustive browser/device combinations, external merchant endpoints, live exchange-rate response availability, or vulnerability databases. No load test of a backend was needed because this application exports static files. This audit cannot establish the absence of all defects.


## Implementation verification — October 19, 2026

All 44 findings are implemented locally. The stretched sphere composition, detail-64 geometry, existing DPR range, and blog landing-page structure are preserved. Reduced-motion visitors now receive a static sphere that still updates its slice on scroll and resize.

- [x] Whole-tree ESLint runs successfully with the compatible pinned version and reports no findings.
- [x] TypeScript passes without emitting files.
- [x] Currency assertions cover 15 locale cases, invalid rate data, and cache expiration boundaries.
- [x] Blog assertions cover authored posts, invalid metadata and dates, reserved slug/body fields, missing posts, and shared search.
- [x] Full `pnpm build` generated 14 social images and all 66 static pages successfully.
- [x] `pnpm start` serves the actual export, including extensionless routes.
- [x] `pnpm check:browser` passes against that production export: fenced-code whitespace, tablet layout, nested wheel scrolling, native modal Tab/Escape/focus restoration, current-article dismissal, responsive scroll-lock cleanup, no-JavaScript content visibility, Spanish search/controls/detail language, resume keys, and blog metadata.
- [x] Sphere verification passes for short/long posts at DPR 1 and 2, top/middle/bottom projection math, actual viewport buffers, document-height changes, homepage reset, and mobile orientation changes.
- [x] Focused browser checks pass for live reduced-motion changes, sphere pointer response over content, static reduced-motion rendering with scroll/resize updates, native cursor fallback, stopped marquees, and pausing the offscreen footer clock.
- [x] Isolated server-rendered image examples verify valid paragraph-compatible markup, a keyboard opening button, preserved bare-fence whitespace, and remote-image blocking.
- [x] Dependency lockfile is synchronized; unused helper/icon/scaffold code and three old direct dependencies are removed. Static preview uses the pinned `serve` development dependency.
- [x] Git diff whitespace checks pass.

The browser suites are wired into CI against exported output. Timing logs are diagnostic, with no universal FPS assertion. Native dialogs share the verified keyboard lifecycle; a full image-lightbox browser interaction was not exercised because authored posts contain no images. Local-source tests validate the two retired currency replacements without depending on the external rate service.

Remaining verification limits: hardware GPU timing, actual assistive-technology sessions, all browser/device combinations, live merchant/rate endpoints, remote GitHub Actions execution, and deployment itself. No commit or deployment was performed by this implementation pass.
