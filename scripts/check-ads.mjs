import assert from "node:assert/strict";
import puppeteer from "puppeteer";
import worker from "../cloudflare/ads/worker.mjs";

const base = process.argv.slice(2).find(value => !value.startsWith("--")) || "http://127.0.0.1:3000";
const enabled = process.argv.includes("--enabled") || process.env.NEXT_PUBLIC_ADSTERRA_ENABLED === "true";
const article = "/blog/zero-phase-2-fixing-the-pipes";
const nextArticle = "/blog/ferber-kernel-core-to-userspace";
const consentKey = "blog:adsterra-consent:v1";
const dimensions = {
    "4354f360f5c39181fda663c280098eaf": [468, 60],
    "8c0862c573b41551f0463efc9b7d55f8": [320, 50],
    "fd2ee69661b7afb7554a176de6756d7e": [300, 250],
};
const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox", "--enable-unsafe-swiftshader"] });
const pause = () => new Promise(resolve => setTimeout(resolve, 250));

async function fixture(mode = "filled", width = 1600) {
    const context = await browser.createBrowserContext();
    const page = await context.newPage();
    await page.setViewport({ width, height: 1000 });
    await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
    const requests = [], errors = [];
    page.setDefaultTimeout(20000);
    page.on("pageerror", error => errors.push(error.message));
    await page.evaluateOnNewDocument(blocked => {
        window.__banners = [];
        window.addEventListener("message", event => {
            if (event.data?.type === "fixture-banner") window.__banners.push(event.data.options);
        });
        if (blocked) new MutationObserver((_, observer) => {
            if (!document.head) return;
            const style = document.createElement("style");
            style.textContent = ".adsbox,.ad-banner,.ad-notice{display:none!important}";
            document.head.append(style); observer.disconnect();
        }).observe(document, { childList: true, subtree: true });
    }, mode === "blocked");
    await page.setRequestInterception(true);
    page.on("request", async request => {
        try {
            const url = new URL(request.url());
            if (url.hostname === "ads.notvc.to") {
                const response = await worker.fetch(new Request(request.url()));
                const body = (await response.text()).replace("'https://notvc.to'", JSON.stringify(new URL(base).origin));
                return await request.respond({ status: response.status, contentType: "text/html", body });
            }
            if (url.hostname === "bauval.org") {
                const key = url.pathname.split("/").at(-1);
                requests.push(key);
                if (mode === "failed") return await request.abort("failed");
                const body = `parent.postMessage({type:'fixture-banner',options:window.atOptions},'*');` +
                    (mode === "empty" ? "" : `document.write('<iframe title="Fixture creative" width="${dimensions[key][0]}" height="${dimensions[key][1]}" style="border:0" src="https://ad-fixture.invalid/creative"></iframe>');`);
                return await request.respond({ status: 200, contentType: "application/javascript", body });
            }
            if (url.hostname === "ad-fixture.invalid") return await request.respond({ status: 200, contentType: "text/html", body: '<a target="_blank" href="https://advertiser.invalid/">Fixture advertiser</a>' });
            // No external network access or live inventory in this suite, including nested creatives.
            if (![new URL(base).origin, "null"].includes(url.origin)) return await request.abort("blockedbyclient");
            await request.continue();
        } catch (error) { errors.push(error.message); await request.abort().catch(() => {}); }
    });
    const visit = path => page.goto(new URL(path, base).href, { waitUntil: "domcontentloaded" });
    return { page, context, requests, errors, visit };
}
async function allow(f) { await f.page.locator(".blog-consent button:nth-child(2)").click(); }
async function scroll(f, placement) {
    await f.page.waitForSelector(`[data-ad-compartment="${placement}"]`);
    await f.page.$eval(`[data-ad-compartment="${placement}"]`, el => el.scrollIntoView({ block: "center", behavior: "instant" }));
    await f.page.waitForSelector(`[data-ad-compartment="${placement}"] .ad-frame[data-loaded="true"]`);
}
async function settings(f) { await f.page.locator(".blog-privacy-links button").click(); }

try {
    const f = await fixture();
    try {
        for (const path of ["/", "/resume", "/wishlist", "/privacy"]) {
            await f.visit(path); await pause();
            assert.equal(await f.page.$("[data-ad-compartment]"), null);
            assert.equal(f.requests.length, 0);
        }
        assert.equal(await f.page.$('meta[name="google-adsense-account"]'), null);
        const txt = await (await fetch(new URL("/ads.txt", base))).text();
        assert.doesNotMatch(txt, /google\.com, pub-/);
        await f.visit(article);
        if (!enabled) {
            await pause();
            assert.equal(await f.page.$("[data-ad-compartment], .blog-consent"), null);
            assert.equal(f.requests.length, 0);
            console.log("Disabled serving and removal of Google verification pass.");
        } else {
            await f.page.waitForSelector(".blog-consent");
            assert.equal(f.requests.length, 0, "No ad requests before consent");
            await f.page.locator(".blog-consent button:first-child").click();
            await f.visit(article); await pause();
            assert.equal(await f.page.$(".blog-consent, .ad-frame"), null);
            await settings(f); await allow(f);
            // shortcut: headless Chrome has no pointer; emulate only the existing desktop display rule.
            await f.page.addStyleTag({ content: "@media(min-width:1280px) and (min-height:900px) and (pointer:none){.ad-sidebar{display:block}}" });
            for (const placement of ["intro", "sidebar", "end"]) await scroll(f, placement);
            assert.equal(f.requests.length, 3, "One request per visible placement");
            const frame = await (await f.page.$('[data-ad-compartment="intro"] .ad-frame')).contentFrame();
            assert.equal(await frame.evaluate(() => {
                try { void parent.document.body; return false; } catch { return true; }
            }), true, "Banner code cannot read the portfolio document");
            const banners = await f.page.evaluate(() => window.__banners);
            for (const options of banners) assert.deepEqual([options.width, options.height], dimensions[options.key], "Isolated atOptions must match each unit");
            assert.equal(new Set(banners.map(item => item.key)).size, 2);
            const count = f.requests.length;
            await scroll(f, "intro"); await pause();
            assert.equal(f.requests.length, count, "Scrolling must not refresh banners");
            await f.page.setViewport({ width: 390, height: 800 });
            await scroll(f, "intro");
            await f.page.waitForFunction(() => document.querySelector('[data-ad-compartment="intro"] .ad-frame')?.width === "320");
            assert.equal(await f.page.$('[data-ad-compartment="sidebar"] .ad-frame'), null);
            assert.ok(await f.page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
            await settings(f); await f.page.locator(".blog-consent button:first-child").click();
            assert.equal(await f.page.$(".ad-frame"), null, "Withdrawal removes all frames");
            const stopped = f.requests.length; await pause(); assert.equal(f.requests.length, stopped);
            await settings(f); await allow(f); await scroll(f, "intro");
            await f.page.evaluate(() => { window.__sameDocument = true; });
            await f.page.evaluate(path => document.querySelector(`a[href="${path}"]`).click(), nextArticle);
            await f.page.waitForFunction(path => location.pathname === path, {}, nextArticle);
            await scroll(f, "intro");
            assert.equal(await f.page.evaluate(() => window.__sameDocument), true);
            await f.visit("/resume");
            assert.equal(await f.page.$(".ad-frame"), null);
            await f.visit("/blog"); await scroll(f, "index");
            console.log("Consent, withdrawal, isolation, sizing, lazy requests, SPA navigation and index placement pass.");
        }
        assert.deepEqual(f.errors, []);
    } finally { await f.context.close(); }

    if (enabled) {
        for (const mode of ["blocked", "failed", "empty"]) {
            const f = await fixture(mode);
            try {
                await f.visit(article);
                if (mode === "blocked") {
                    await f.page.waitForSelector("[data-ad-blocker-notice]", { visible: true });
                    await f.page.click('[data-ad-blocker-notice] button');
                    await f.visit(nextArticle); await pause();
                    assert.equal(await f.page.$("[data-ad-blocker-notice]"), null);
                    assert.equal(f.requests.length, 0);
                } else {
                    const requested = f.page.waitForRequest(request => new URL(request.url()).hostname === "bauval.org");
                    await allow(f); await requested;
                    await f.page.waitForSelector('[data-ad-compartment="intro"][data-unavailable="true"]');
                    await f.page.waitForFunction(() => !document.querySelector('[data-ad-compartment="intro"] .ad-frame'));
                    assert.equal(await f.page.$("[data-ad-blocker-notice]"), null, "Failure is not proof of blocking");
                }
                assert.ok(await f.page.$("article h1"));
                assert.deepEqual(f.errors, []);
            } finally { await f.context.close(); }
        }
        const f = await fixture("filled", 320);
        try {
            await f.visit(article); await allow(f); await pause();
            assert.equal(f.requests.length, 0, "Do not request banners too wide for the compartment");
            assert.ok(await f.page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
            await f.page.evaluate(key => localStorage.setItem(key, JSON.stringify({ value: "allow", expires: 1 })), consentKey);
            await f.visit(article); await f.page.waitForSelector(".blog-consent");
            assert.equal(f.requests.length, 0, "Expired consent must not authorize requests");
        } finally { await f.context.close(); }
        console.log("Blocker dismissal, failures, empty content timeout, narrow screens and consent expiry pass.");
    }
} finally { await browser.close(); }
