import assert from "node:assert/strict";
import puppeteer from "puppeteer";

const base = process.argv[2] ?? "http://127.0.0.1:3000";
const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--enable-unsafe-swiftshader"],
});

try {
    const page = await browser.newPage();
    page.setDefaultTimeout(30_000);
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
    await page.evaluateOnNewDocument(() => {
        window.__pageEntrance = { started: false, finished: false };
        window.__sphereEntrance = { started: false, finished: false, correctFrame: false };
        document.addEventListener("animationstart", event => {
            if (event.animationName === "page-enter") window.__pageEntrance.started = true;
            if (event.animationName === "sphere-enter") {
                window.__sphereEntrance.started = true;
                window.__sphereEntrance.correctFrame = event.target.closest("[data-global-sphere]")?.dataset.sphereReady
                    === document.querySelector("[data-page-sphere]")?.dataset.pageSphere;
            }
        });
        document.addEventListener("animationend", event => {
            if (event.animationName === "page-enter") window.__pageEntrance.finished = true;
            if (event.animationName === "sphere-enter") window.__sphereEntrance.finished = true;
        });
        window.__sphereDraws = 0;
        const prototype = WebGL2RenderingContext.prototype;
        const names = new WeakMap();
        let projection = null;
        const getLocation = prototype.getUniformLocation;
        prototype.getUniformLocation = function (program, name) {
            const location = getLocation.call(this, program, name);
            if (location) names.set(location, name);
            return location;
        };
        const upload = prototype.uniformMatrix4fv;
        prototype.uniformMatrix4fv = function (location, transpose, value, ...rest) {
            if (names.get(location) === "projectionMatrix") projection = Array.from(value);
            return upload.call(this, location, transpose, value, ...rest);
        };
        const clear = prototype.clear;
        prototype.clear = function (...args) {
            window.__sphereFrameProjection = null;
            return clear.apply(this, args);
        };
        const original = prototype.drawElements;
        prototype.drawElements = function (...args) {
            window.__sphereDraws++;
            window.__sphereFrameProjection = projection;
            return original.apply(this, args);
        };
    });
    const visible = () => {
        const sphere = document.querySelector("[data-global-sphere]");
        return sphere && getComputedStyle(sphere).visibility === "visible"
            && Number(getComputedStyle(sphere).opacity) > 0;
    };
    const ready = mode => page.waitForFunction(mode => {
        const sphere = document.querySelector("[data-global-sphere]");
        return sphere?.dataset.sphereReady === mode
            && document.querySelector("[data-page-sphere]")?.dataset.pageSphere === mode;
    }, {}, mode);

    async function navigate(href, mode) {
        // Sample every browser frame, including the transition before readiness is signalled.
        await page.evaluate(() => {
            const state = { violations: [], visibleFrames: 0, frames: 0 };
            window.__sphereNavigation = state;
            const sample = () => {
                if (window.__sphereNavigation !== state) return;
                state.frames++;
                const sphere = document.querySelector("[data-global-sphere]");
                const current = document.querySelector("[data-page-sphere]")?.dataset.pageSphere;
                if (sphere) {
                    const style = getComputedStyle(sphere);
                    if (style.visibility === "visible" && Number(style.opacity) > 0) {
                        state.visibleFrames++;
                        const ready = sphere.dataset.sphereReady;
                        const opacity = Number(style.opacity);
                        if (ready !== current || Math.abs(opacity - (current === "document" ? 0.2 : 1)) > 0.001) {
                            state.violations.push({ current, ready, opacity, path: location.pathname });
                        }
                        const matrix = window.__sphereFrameProjection;
                        const viewportY = 1 / Math.tan(Math.PI / 8);
                        if (matrix && (current === "viewport"
                            ? Math.abs(matrix[5] - viewportY) > 0.001 || Math.abs(matrix[9]) > 0.001
                            : matrix[5] <= viewportY + 0.001)) {
                            state.violations.push({ current, projection: matrix, path: location.pathname });
                        }
                    }
                }
                requestAnimationFrame(sample);
            };
            requestAnimationFrame(sample);
        });
        await page.click(`header a[href="${href}"]`);
        const destination = new URL(href, base);
        await page.waitForFunction(path => location.pathname === path, {}, destination.pathname);
        await ready(mode);
        await page.evaluate(() => new Promise(resolve => {
            const start = performance.now();
            const frame = () => performance.now() - start >= 800
                ? resolve() : requestAnimationFrame(frame);
            requestAnimationFrame(frame);
        }));
        const samples = await page.evaluate(() => {
            const result = window.__sphereNavigation;
            window.__sphereNavigation = null;
            return result;
        });
        assert.ok(samples.frames > 0, `No transition frames sampled for ${href}`);
        assert.deepEqual(samples.violations, [], `Visible stale sphere during navigation to ${href}`);
        console.log(`Navigation to ${href}: ${samples.frames} frames checked.`);
    }

    for (const path of ["/blog", "/resume", "/wishlist", "/"]) {
        await page.goto(new URL(path, base).href, { waitUntil: "domcontentloaded" });
        await page.waitForFunction(() => window.__pageEntrance.started && window.__pageEntrance.finished);
        await page.waitForFunction(() => window.__sphereEntrance.started && window.__sphereEntrance.finished);
        assert.equal(await page.evaluate(() => window.__sphereEntrance.correctFrame), true,
            "Sphere entrance must begin after the destination frame is ready");
        assert.equal(await page.$eval(".page-enter", element => getComputedStyle(element).opacity), "1");
        assert.equal(await page.$eval(".sphere-enter", element => getComputedStyle(element).opacity), "1");
    }
    console.log("Direct page loads fade in and finish fully visible.");
    await ready("viewport");
    await page.waitForFunction(visible);
    await navigate("/blog", "document");
    await page.waitForFunction(visible);
    await navigate("/resume", "document");
    await page.waitForFunction(visible);
    await navigate("/", "viewport");
    await page.waitForFunction(visible);
    await navigate("/resume", "document");
    await navigate("/#about", "viewport");
    await page.waitForFunction(() => {
        const about = document.getElementById("about");
        const top = about?.getBoundingClientRect().top;
        return top !== undefined && top >= -16 && top <= 2;
    });
    const coverage = await page.evaluate(() => {
        const about = document.getElementById("about").getBoundingClientRect();
        const works = document.getElementById("works").getBoundingClientRect();
        return {
            aboutAlone: about.top <= 0 && about.bottom >= innerHeight,
            worksAlone: works.top <= 0 && works.bottom >= innerHeight,
            combined: about.top <= 1 && works.top <= about.bottom + 1 && works.bottom >= innerHeight,
        };
    });
    assert.equal(coverage.aboutAlone, false, "Fixture must span the About/Works boundary");
    assert.equal(coverage.worksAlone, false, "Fixture must span the About/Works boundary");
    assert.equal(coverage.combined, true, "About and Works must together cover the viewport");
    await page.waitForFunction(() => getComputedStyle(document.querySelector("[data-global-sphere]")).visibility === "hidden");

    await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1 });
    await page.waitForFunction(() => {
        const canvas = document.querySelector("[data-global-sphere] canvas");
        return canvas?.width === innerWidth && canvas?.height === innerHeight;
    });
    const before = await page.evaluate(() => window.__sphereDraws);
    await page.evaluate(() => {
        const top = document.getElementById("about").getBoundingClientRect().top + scrollY;
        window.scrollTo(0, top - innerHeight / 2);
    });
    await page.waitForFunction(visible);
    await page.waitForFunction(before => window.__sphereDraws > before + 2, {}, before);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForFunction(visible);
    await navigate("/#about", "viewport");
    await page.waitForFunction(() => getComputedStyle(document.querySelector("[data-global-sphere]")).visibility === "hidden");
    await navigate("/blog", "document");
    await page.waitForFunction(visible);

    await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
    await navigate("/resume", "document");
    await page.waitForFunction(visible);
    await navigate("/", "viewport");
    await page.waitForFunction(visible);
    await navigate("/blog", "document");
    await page.waitForFunction(visible);
    assert.equal(await page.$eval(".page-enter", element => getComputedStyle(element).animationName), "none");
    assert.equal(await page.$eval(".sphere-enter", element => getComputedStyle(element).animationName), "none");
    const noScript = await browser.newPage();
    await noScript.setJavaScriptEnabled(false);
    await noScript.goto(new URL("/resume", base).href, { waitUntil: "domcontentloaded" });
    // Page-side animation-frame polling is disabled along with JavaScript.
    await new Promise(resolve => setTimeout(resolve, 750));
    assert.equal(await noScript.$eval(".page-enter", element => getComputedStyle(element).opacity), "1");
    await noScript.close();
    console.log("Sphere route frames, combined coverage, hidden resize/reveal, and reduced motion passed.");
} finally {
    await browser.close();
}
