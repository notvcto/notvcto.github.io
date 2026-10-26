import assert from "node:assert/strict";
import puppeteer from "puppeteer";

const base = process.argv.slice(2).find(value => !value.startsWith("--")) || "http://127.0.0.1:3000";
const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT || "ca-pub-7234987851785688";
const configuredSlots = ["INTRO", "END", "SIDEBAR", "INDEX"].every(name => /^\d+$/.test(process.env[`NEXT_PUBLIC_ADSENSE_${name}_SLOT`] || ""));
const enabled = process.argv.includes("--enabled") || (process.env.NEXT_PUBLIC_ADSENSE_ENABLED === "true" && /^ca-pub-\d{16}$/.test(client) && configuredSlots);
const article = "/blog/zero-phase-2-fixing-the-pipes";
const nextArticle = "/blog/ferber-kernel-core-to-userspace";
const sdkUrl = /pagead2\.googlesyndication\.com\/pagead\/js\/adsbygoogle\.js/;
const googleAdHost = /(?:googlesyndication|doubleclick|googleadservices|fundingchoicesmessages)\./;
const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox", "--enable-unsafe-swiftshader"] });

function sdkFixture(mode) {
    return `(() => {
        const waiting = window.adsbygoogle || [];
        window.__adRequests = [];
        window.__adConsent = ${JSON.stringify(mode === "refused" ? "refused" : "accepted")};
        const render = () => {
            const node = Array.from(document.querySelectorAll('ins.adsbygoogle')).find(element =>
                !element.dataset.mockRequestId && element.getClientRects().length && element.clientWidth > 0);
            if (!node) throw new Error('Duplicate ad initialization or zero-width ad request');
            node.dataset.mockRequestId = String(window.__adRequests.length + 1);
            node.dataset.adsbygoogleStatus = 'done';
            window.__adRequests.push({ placement: node.closest('[data-ad-compartment]')?.dataset.adCompartment, path: location.pathname, slot: node.dataset.adSlot });
            node.dataset.adStatus = ${JSON.stringify(mode === "unfilled" || mode === "refused" ? "unfilled" : "filled")};
            if (node.dataset.adStatus === 'filled') {
                const frame = document.createElement('iframe');
                frame.title = 'Fixture advertisement'; frame.src = 'https://ad-fixture.invalid/creative';
                frame.style.cssText = 'display:block;width:100%;height:100%;border:0'; node.append(frame);
            }
        };
        window.adsbygoogle = { push: render };
        const privacyWaiting = window.googlefc?.callbackQueue || [];
        const privacyReady = callbacks => Object.values(callbacks).forEach(callback => callback());
        window.googlefc = { callbackQueue: { push: privacyReady }, showRevocationMessage() { window.__privacyReopened = true; } };
        privacyWaiting.forEach(privacyReady);
        waiting.forEach(render);
    })();`;
}

async function fixture(mode = "filled", viewport = { width: 1600, height: 1000 }) {
    const context = await browser.createBrowserContext();
    const page = await context.newPage();
    const errors = [];
    const sdkRequests = [];
    page.setDefaultTimeout(15000);
    await page.setViewport(viewport);
    await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
    page.on("pageerror", error => errors.push(error.message));
    await page.setRequestInterception(true);
    page.on("request", async request => {
        try {
            if (sdkUrl.test(request.url())) {
                sdkRequests.push(request.url());
                if (mode === "failed") return await request.abort("failed");
                if (mode === "slow") await new Promise(resolve => setTimeout(resolve, 800));
                return await request.respond({ status: 200, contentType: "text/javascript", headers: { "Access-Control-Allow-Origin": "*" }, body: sdkFixture(mode) });
            }
            if (new URL(request.url()).hostname === "ad-fixture.invalid") {
                return await request.respond({ status: 200, contentType: "text/html", body: "<!doctype html><title>Fixture advertiser</title><p>Test advertisement</p>" });
            }
            if (googleAdHost.test(new URL(request.url()).hostname)) return await request.abort("blockedbyclient");
            await request.continue();
        } catch (error) {
            errors.push(error.message);
            await request.abort().catch(() => {});
        }
    });
    if (["blocked", "adsbygoogle-blocked", "slot-blocked"].includes(mode)) {
        await page.evaluateOnNewDocument(mode => {
            const observer = new MutationObserver(() => {
                if (!document.head) return;
                const style = document.createElement("style");
                style.textContent = mode === "blocked"
                    ? ".adsbox, .ad-banner, .ads-banner, .ad-notice { display: none !important; }"
                    : mode === "adsbygoogle-blocked"
                        ? "ins.adsbygoogle { display: none !important; }"
                        : "ins.adsbygoogle[data-ad-slot] { display: none !important; }";
                document.head.append(style);
                observer.disconnect();
            });
            observer.observe(document, { childList: true, subtree: true });
        }, mode);
    }
    const visit = path => page.goto(new URL(path, base).href, { waitUntil: "domcontentloaded" });
    return { context, page, visit, errors, sdkRequests };
}

const pause = () => new Promise(resolve => setTimeout(resolve, 300));
async function scrollToSlot(page, placement) {
    await page.$eval(`[data-ad-compartment="${placement}"]`, element => element.scrollIntoView({ behavior: "instant", block: "center" }));
    await page.waitForFunction(placement => document.querySelector(`[data-ad-compartment="${placement}"] ins[data-ad-status]`), {}, placement);
}
async function navigate(page, path) {
    await page.evaluate(path => document.querySelector(`a[href="${path}"]`).click(), path);
    await page.waitForFunction(path => location.pathname === path, {}, path);
    await pause();
}
async function assertNoAds(f) {
    await pause();
    assert.equal(await f.page.$("[data-ad-compartment]"), null);
    assert.equal(f.sdkRequests.length, 0);
}

async function emulateDesktopPointer(page) {
    if (!await page.evaluate(() => matchMedia("(pointer: none)").matches)) return;
    const hasRule = await page.evaluate(() => {
        function find(rules) {
            return Array.from(rules).some(rule => {
                if (rule.conditionText && /pointer\s*:\s*fine/.test(rule.conditionText)
                    && /1280/.test(rule.conditionText) && /900/.test(rule.conditionText)
                    && Array.from(rule.cssRules || []).some(child => child.selectorText === ".ad-sidebar")) return true;
                return rule.cssRules ? find(rule.cssRules) : false;
            });
        }
        return Array.from(document.styleSheets).some(sheet => find(sheet.cssRules));
    });
    assert.equal(hasRule, true, "The production sidebar must require a spacious fine-pointer viewport");
    // shortcut: headless Chrome has no pointer; remove this emulation when the runner exposes desktop input.
    await page.addStyleTag({ content: "@media (min-width:1280px) and (min-height:900px) and (pointer:none) { .ad-sidebar { display:block; } }" });
}

try {
    const f = await fixture();
    try {
        for (const path of ["/", "/resume", "/wishlist", "/privacy"]) {
            await f.visit(path);
            await assertNoAds(f);
        }
        assert.equal(await f.page.$eval('meta[name="google-adsense-account"]', element => element.content), client);
        const adsTxt = await fetch(new URL("/ads.txt", base));
        assert.equal(adsTxt.status, 200);
        assert.match(await adsTxt.text(), new RegExp(`google\\.com, ${client.replace("ca-", "")}, DIRECT, f08c47fec0942fa0`));
        if (!enabled) {
            for (const path of ["/blog", article]) { await f.visit(path); await assertNoAds(f); }
            assert.deepEqual(f.errors, []);
            console.log("AdSense verification and privacy pass; disabled serving makes no ad requests or compartments.");
        } else {
            await f.visit(article);
            await f.page.waitForSelector('[data-ad-compartment="intro"] ins[data-ad-status="filled"]');
            assert.equal(await f.page.$eval('[data-ad-compartment="intro"]', element => getComputedStyle(element).animationName), "none", "Reduced-motion preferences must disable compartment animation");
            await emulateDesktopPointer(f.page);
            await scrollToSlot(f.page, "end");
            await f.page.waitForFunction(() => window.__adRequests?.length === 3);
            assert.equal(await f.page.$$eval("[data-ad-compartment]", elements => elements.length), 3);
            assert.equal(f.sdkRequests.length, 1);
            assert.ok(await f.page.$eval('.noise-overlay', element => Number(getComputedStyle(element).zIndex) < 10));
            await scrollToSlot(f.page, "intro");
            await f.page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "no-preference" }]);
            await pause();
            assert.equal(await f.page.$eval('[data-ad-compartment="intro"]', element => getComputedStyle(element).animationName), "ad-compartment-enter");
            assert.equal(await f.page.$eval('[data-ad-compartment="intro"] ins.adsbygoogle', element => getComputedStyle(element).transitionDuration), "0.48s");
            await f.page.mouse.move(80, 30);
            await f.page.waitForFunction(() => Array.from(document.querySelectorAll("div")).some(element => element.classList.contains("z-[10000]") && Number(getComputedStyle(element).opacity) > 0.5));
            const adBounds = await f.page.$eval('[data-ad-compartment="intro"]', element => element.getBoundingClientRect().toJSON());
            await f.page.mouse.move(adBounds.x + 14, adBounds.y + 14);
            await f.page.waitForFunction(() => Array.from(document.querySelectorAll("div")).some(element => element.classList.contains("z-[10000]") && Number(getComputedStyle(element).opacity) > 0.5));
            const adFrame = await f.page.$('[data-ad-compartment="intro"] iframe');
            const frameBounds = await adFrame.boundingBox();
            await f.page.mouse.move(frameBounds.x + frameBounds.width / 2, frameBounds.y + frameBounds.height / 2);
            assert.ok(await adFrame.evaluate(element => Number(getComputedStyle(element).zIndex) > 10000), "The native ad frame must paint above the custom cursor");
            await f.page.mouse.move(80, 30);
            await f.page.waitForFunction(() => Array.from(document.querySelectorAll("div")).some(element => element.classList.contains("z-[10000]") && Number(getComputedStyle(element).opacity) > 0.5));
            await f.page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
            await f.page.evaluate(() => Array.from(document.querySelectorAll('button')).find(button => button.textContent === 'Privacy and cookie settings').click());
            assert.equal(await f.page.evaluate(() => window.__privacyReopened), true);
            await f.page.evaluate(() => { window.__adDocumentMarker = "same document"; });
            await navigate(f.page, nextArticle);
            await f.page.waitForFunction(path => window.__adRequests?.some(request => request.path === path && request.placement === "intro"), {}, nextArticle);
            assert.equal(await f.page.evaluate(() => window.__adDocumentMarker), "same document");
            assert.equal(f.sdkRequests.length, 1, "SPA navigation must reuse the SDK");
            await scrollToSlot(f.page, "end");
            await pause();
            const requested = await f.page.evaluate(() => window.__adRequests);
            for (const path of [article, nextArticle]) {
                const placements = requested.filter(request => request.path === path).map(request => request.placement).sort();
                assert.deepEqual(placements, ["end", "intro", "sidebar"]);
            }
            await navigate(f.page, "/resume");
            assert.equal(await f.page.$("[data-ad-compartment]"), null);
            const requestsAfterExit = await f.page.evaluate(() => window.__adRequests.length);
            await pause();
            assert.equal(await f.page.evaluate(() => window.__adRequests.length), requestsAfterExit);
            await f.visit("/blog");
            await scrollToSlot(f.page, "index");
            assert.equal(await f.page.$$eval("[data-ad-compartment]", elements => elements.length), 1);
            assert.deepEqual(f.errors, []);
            console.log("Desktop placements, index placement, SDK deduplication, and route cleanup pass.");
        }
    } finally { await f.context.close(); }

    if (enabled) {
        for (const viewport of [{ width: 390, height: 800 }, { width: 768, height: 900 }, { width: 1600, height: 700 }]) {
            const f = await fixture("filled", viewport);
            try {
                await f.visit(article);
                await f.page.waitForSelector('[data-ad-compartment="intro"] ins[data-ad-status="filled"]');
                await scrollToSlot(f.page, "end");
                assert.ok(await f.page.evaluate(() => !document.querySelector('[data-ad-compartment="sidebar"]')?.getClientRects().length));
                assert.equal(await f.page.evaluate(() => window.__adRequests.filter(request => request.placement === "sidebar").length), 0);
                assert.ok(await f.page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
                assert.deepEqual(f.errors, []);
            } finally { await f.context.close(); }
        }
        for (const mode of ["unfilled", "refused", "failed", "blocked", "adsbygoogle-blocked", "slot-blocked"]) {
            const f = await fixture(mode);
            try {
                await f.visit(article);
                await f.page.waitForSelector("article h1", { visible: true });
                if (["blocked", "adsbygoogle-blocked"].includes(mode)) {
                    await f.page.waitForFunction(() => document.body.textContent.includes("blocking ads? fair enough."));
                    await f.page.waitForSelector("[data-ad-blocker-notice]", { visible: true });
                    assert.equal(await f.page.$$eval("[data-ad-blocker-notice]", elements => elements.length), 1);
                    await f.page.click('[data-ad-blocker-notice] button');
                    await navigate(f.page, nextArticle);
                    assert.equal(await f.page.$("[data-ad-blocker-notice]"), null);
                    await f.visit(article);
                    await pause();
                    assert.equal(await f.page.$("[data-ad-blocker-notice]"), null, "Dismissal must survive a new document");
                } else {
                    await pause();
                    assert.equal(await f.page.$("[data-ad-blocker-notice]"), null, `${mode} is not proof of an ad blocker`);
                    assert.equal(await f.page.$('iframe[title="Fixture advertisement"]'), null);
                    if (["unfilled", "failed", "slot-blocked"].includes(mode)) {
                        await f.page.waitForFunction(() => !document.querySelector('[data-ad-compartment="intro"]'));
                    }
                }
                assert.ok(await f.page.$("article p"), "Articles must stay readable regardless of ad state");
                assert.deepEqual(f.errors, []);
            } finally { await f.context.close(); }
        }
        const pending = await fixture("slow");
        try {
            await pending.visit(article);
            await pending.page.waitForSelector('script[src*="adsbygoogle.js"]');
            await navigate(pending.page, "/resume");
            await new Promise(resolve => setTimeout(resolve, 900));
            assert.equal(await pending.page.$("[data-ad-compartment]"), null);
            assert.equal(await pending.page.evaluate(() => window.__adRequests?.length || 0), 0, "Unmounted slots must not request ads when a delayed SDK finishes loading");
            assert.deepEqual(pending.errors, []);
        } finally { await pending.context.close(); }
        console.log("Responsive layouts, unfilled/consent refusal/failure states, and respectful blocker dismissal pass.");
    }
} finally { await browser.close(); }
