import assert from "node:assert/strict";
import puppeteer from "puppeteer";

const base = process.argv[2] || "http://127.0.0.1:3000";
const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--enable-unsafe-swiftshader"],
});

try {
    const page = await browser.newPage();
    page.setDefaultTimeout(10_000);
    page.setDefaultNavigationTimeout(20_000);
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    page.on("console", message => {
        if (message.type() === "error" && /same key|unique.*key|hydration/i.test(message.text())) {
            errors.push(message.text());
        }
    });
    await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
    const visit = path => page.goto(new URL(path, base).href, { waitUntil: "domcontentloaded" });

    await page.setViewport({ width: 1024, height: 600 });
    await visit("/blog/zero-phase-2-fixing-the-pipes");
    await page.waitForSelector("article code");
    const whitespace = await page.evaluate(() => {
        const transcript = Array.from(document.querySelectorAll("article code"))
            .find(code => code.textContent.includes("What's going on YouTube"));
        return transcript && getComputedStyle(transcript).whiteSpace;
    });
    assert.match(whitespace ?? "", /^pre/, "Unlabelled fences must preserve whitespace");

    const scroller = await page.$("aside .overflow-y-auto");
    assert.ok(scroller, "Desktop article navigation must exist");
    assert.ok(await scroller.evaluate(element => element.scrollHeight > element.clientHeight));
    const position = await scroller.boundingBox();
    const documentScroll = await page.evaluate(() => window.scrollY);
    await page.mouse.move(position.x + position.width / 2, position.y + 50);
    await page.mouse.wheel({ deltaY: 400 });
    await page.waitForFunction(() => document.querySelector("aside .overflow-y-auto").scrollTop > 0);
    assert.equal(await page.evaluate(() => window.scrollY), documentScroll, "Sidebar wheel must not scroll the page");

    for (const width of [768, 1024]) {
        await page.setViewport({ width, height: 900 });
        await visit("/blog/ferber-kernel-core-to-userspace");
        await page.waitForSelector("article h1");
        const bounds = await page.evaluate(() => ({
            document: document.documentElement.scrollWidth,
            viewport: innerWidth,
            articleRight: document.querySelector("article").getBoundingClientRect().right,
        }));
        assert.ok(bounds.document <= bounds.viewport + 1, `Blog overflows at ${width}px`);
        assert.ok(bounds.articleRight <= bounds.viewport + 1, `Article is clipped at ${width}px`);
    }

    await page.setViewport({ width: 390, height: 800 });
    await visit("/blog/zero-phase-2-fixing-the-pipes");
    const drawerTrigger = 'button[aria-controls="blog-mobile-drawer"]';
    await page.waitForSelector(drawerTrigger, { visible: true });

    async function openDialog(trigger) {
        await page.click(trigger);
        await page.waitForFunction(() => {
            const dialog = document.querySelector("dialog[open]");
            return dialog?.matches(":modal") && dialog.contains(document.activeElement);
        });
    }

    async function checkFocusAndEscape(trigger) {
        await openDialog(trigger);
        const focusable = 'button, a[href], input, select, textarea, [tabindex="0"]';
        await page.$eval("dialog[open]", (dialog, selector) => {
            const controls = Array.from(dialog.querySelectorAll(selector))
                .filter(element => element.getClientRects().length);
            controls.at(-1).focus();
        }, focusable);
        await page.keyboard.press("Tab");
        assert.ok(await page.evaluate(() => document.querySelector("dialog[open]").contains(document.activeElement)),
            "Tab must stay inside the modal");
        await page.keyboard.press("Escape");
        await page.waitForFunction(() => !document.querySelector("dialog[open]"));
        await page.waitForFunction(selector => document.activeElement === document.querySelector(selector), {}, trigger);
    }

    await checkFocusAndEscape(drawerTrigger);
    await openDialog(drawerTrigger);
    await page.click('dialog[open] a[aria-current="page"]');
    await page.waitForFunction(() => !document.querySelector("dialog[open]"));
    await openDialog(drawerTrigger);
    await page.setViewport({ width: 1024, height: 800 });
    await page.waitForFunction(() => !document.querySelector("dialog[open]")
        && !["hidden", "clip"].includes(document.body.style.overflow));

    await page.setViewport({ width: 390, height: 800 });
    await checkFocusAndEscape('button[aria-label="Toggle menu"]');
    console.log("Blog fences, tablet layout, nested scrolling, and mobile dialogs pass.");

    const noScript = await browser.newPage();
    noScript.setDefaultTimeout(10_000);
    noScript.setDefaultNavigationTimeout(20_000);
    await noScript.setJavaScriptEnabled(false);
    for (const path of ["/wishlist", "/wishlist/helping-hands", "/resume"]) {
        await noScript.goto(new URL(path, base).href, { waitUntil: "domcontentloaded" });
        await new Promise(resolve => setTimeout(resolve, 600));
        const main = await noScript.$("main");
        assert.ok(main, `${path} must export its content without JavaScript`);
        assert.ok((await main.evaluate(element => element.textContent)).trim().length > 100);
        assert.ok(await main.evaluate(element => getComputedStyle(element).display !== "none"));
        const visibleContent = await noScript.$$eval("main h1, main h3, main section p", elements =>
            elements.length > 0 && elements.every(element => {
                for (let ancestor = element; ancestor; ancestor = ancestor.parentElement) {
                    const style = getComputedStyle(ancestor);
                    if (Number(style.opacity) === 0 || style.display === "none" || style.visibility === "hidden") return false;
                }
                return element.getClientRects().length > 0;
            }));
        assert.ok(visibleContent, `${path} entry content must be visible before JavaScript`);
    }
    await noScript.close();

    await page.setViewport({ width: 1440, height: 900 });
    await visit("/wishlist#es");
    await page.waitForFunction(() => document.querySelector("article")?.lang === "es");
    await page.type('input[aria-label="Buscar..."]', "Herramientas");
    await page.waitForFunction(() => document.querySelectorAll('a[href^="/wishlist/"]').length > 0);
    const cards = await page.$$eval('main a[href^="/wishlist/"]', links => links.map(link => link.textContent));
    assert.ok(cards.every(text => text.includes("Herramientas")), "Spanish category search must match its displayed category");
    assert.ok(await page.$('label[for="wishlist-sort"]'));
    assert.equal(await page.$eval("#wishlist-sort", element => element.tagName), "SELECT");
    assert.equal(await page.$$eval('button[aria-pressed="true"]', elements => elements.length), 2,
        "Spanish language and default grid mode must both expose selected state");
    const shipping = await page.$('button[aria-controls="wishlist-shipping"]');
    assert.ok(shipping);
    assert.equal(await shipping.evaluate(element => element.getAttribute("aria-expanded")), "false");
    await shipping.click();
    await page.waitForSelector("#wishlist-shipping", { visible: true });
    assert.equal(await shipping.evaluate(element => element.getAttribute("aria-expanded")), "true");
    const toolsFilter = await page.evaluateHandle(() => Array.from(document.querySelectorAll('button[aria-pressed]'))
        .find(button => button.textContent.trim() === "Herramientas"));
    await toolsFilter.asElement().click();
    await page.waitForFunction(() => Array.from(document.querySelectorAll('button[aria-pressed="true"]'))
        .some(button => button.textContent.trim() === "Herramientas"));
    assert.ok(await page.$$eval('main a[href^="/wishlist/"] img', images => images.every(image => image.alt === "")),
        "Card images must not repeat names in accessible link text");

    await visit("/wishlist/helping-hands#es");
    await page.waitForFunction(() => document.querySelector("main")?.lang === "es");
    await page.waitForFunction(() => document.querySelector("h1")?.textContent.includes("Soporte"));
    await visit("/resume");
    await page.waitForSelector("main article");
    assert.match(await page.$eval("main", element => element.textContent), /Ferber/);
    assert.match(await page.$eval("main", element => element.textContent), /x86-64/);
    await visit("/blog");
    await page.waitForFunction(() => document.title === "Blog | NOTVCTO");
    assert.deepEqual(errors, [], "No runtime, hydration, or duplicate-key errors");
    console.log("Wishlist SSR, Spanish search, control semantics, detail language, resume, and blog title pass.");
    console.log("Not checked: image lightbox (no current Markdown images), hardware GPU, external services.");
} finally {
    await browser.close();
}
