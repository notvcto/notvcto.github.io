import assert from "node:assert/strict";
import { PerspectiveCamera, Vector3 } from "three";
import puppeteer from "puppeteer";
import { blockLiveAds } from "./block-live-ads.mjs";

// A slice must project each world point to the same document pixel as the full camera.
for (const height of [900, 2518, 22103]) {
    const full = new PerspectiveCamera(45, 1440 / height, 0.1, 1000);
    full.position.z = 5;
    full.updateMatrixWorld();
    for (const offset of [0, (height - 900) / 2, height - 900]) {
        const slice = full.clone();
        slice.setViewOffset(1440, height, 0, offset, 1440, 900);
        for (const point of [new Vector3(), new Vector3(1, 1, 0), new Vector3(-1, -1, 1)]) {
            const a = point.clone().project(full);
            const b = point.clone().project(slice);
            assert.ok(Math.abs((a.x - b.x) * 720) < 1e-6);
            assert.ok(Math.abs((1 - a.y) * height / 2 - offset - (1 - b.y) * 450) < 1e-6);
        }
    }
}
console.log("Full-document and sliced projections match at top, middle, and bottom.");

const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--enable-unsafe-swiftshader"],
});
try {
    const page = await browser.newPage();
    await blockLiveAds(page);
    // Capture the real component's camera projection without adding production diagnostics.
    await page.evaluateOnNewDocument(() => {
        const locations = new WeakMap();
        const prototype = WebGL2RenderingContext.prototype;
        const getLocation = prototype.getUniformLocation;
        prototype.getUniformLocation = function (program, name) {
            const location = getLocation.call(this, program, name);
            if (location) locations.set(location, name);
            return location;
        };
        const upload = prototype.uniformMatrix4fv;
        prototype.uniformMatrix4fv = function (location, transpose, value, ...rest) {
            if (locations.get(location) === "projectionMatrix") {
                window.__sphereProjection = Array.from(value);
            }
            return upload.call(this, location, transpose, value, ...rest);
        };
    });
    const base = process.argv[2] ?? "http://127.0.0.1:3000";
    for (const dpr of [1, 2]) {
        await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: dpr });
        for (const slug of ["logic-bomb", "ferber-kernel-core-to-userspace"]) {
            await page.goto(`${base}/blog/${slug}`, { waitUntil: "domcontentloaded" });
            await page.waitForFunction(() => window.__sphereProjection);
            for (const position of [0, 0.5, 1]) {
                await page.evaluate(position => {
                    window.scrollTo(0, position * (document.body.getBoundingClientRect().height - innerHeight));
                }, position);
                await page.evaluate(() => new Promise(resolve => {
                    requestAnimationFrame(() => requestAnimationFrame(resolve));
                }));
                const state = await page.evaluate(() => {
                    const canvas = document.querySelector("canvas");
                    const gl = canvas.getContext("webgl2");
                    const rect = canvas.getBoundingClientRect();
                    return {
                        width: rect.width, height: rect.height,
                        documentHeight: document.body.getBoundingClientRect().height,
                        scrollY, buffer: [gl.drawingBufferWidth, gl.drawingBufferHeight],
                        projection: window.__sphereProjection,
                    };
                });
                assert.equal(state.height, 900);
                assert.deepEqual(state.buffer, [1440 * dpr, 900 * dpr]);
                const expected = new PerspectiveCamera(45, 1, 0.1, 1000);
                expected.setViewOffset(state.width, Math.max(state.height, state.documentHeight),
                    0, state.scrollY, state.width, state.height);
                expected.projectionMatrix.elements.forEach((value, i) => {
                    assert.ok(Math.abs(value - state.projection[i]) < 1e-4,
                        `${slug}, DPR ${dpr}, position ${position}: projection element ${i}`);
                });
            }
            const timing = await page.evaluate(() => new Promise(resolve => {
                const intervals = [];
                const middle = (document.body.getBoundingClientRect().height - innerHeight) / 2;
                let start, previous;
                function frame(time) {
                    start ??= time;
                    if (time - start > 1000 && previous !== undefined) intervals.push(time - previous);
                    previous = time;
                    window.scrollTo(0, middle + Math.sin((time - start) / 1000) * 200);
                    if (time - start < 4000) return requestAnimationFrame(frame);
                    const sorted = [...intervals].sort((a, b) => a - b);
                    resolve({ fps: 1000 * intervals.length / intervals.reduce((a, b) => a + b, 0),
                        p95Ms: sorted[Math.floor(sorted.length * 0.95)] });
                }
                requestAnimationFrame(frame);
            }));
            console.log(JSON.stringify({ slug, dpr, ...timing }));
        }
    }
    await page.goto(`${base}/resume`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => {
        const height = Math.max(innerHeight, document.body.getBoundingClientRect().height);
        return Math.abs(window.__sphereProjection?.[5] - height / innerHeight / Math.tan(Math.PI / 8)) < 1e-3;
    });
    await page.evaluate(() => {
        const extra = document.createElement("div");
        extra.style.height = "1000px";
        document.body.appendChild(extra);
    });
    await page.waitForFunction(() => {
        const height = document.body.getBoundingClientRect().height;
        return Math.abs(window.__sphereProjection?.[5] - height / innerHeight / Math.tan(Math.PI / 8)) < 1e-3;
    });
    // Client navigation must also clear the slice when returning to the homepage.
    await page.click('a[href="/"]');
    await page.waitForFunction(() => location.pathname === "/");
    await page.waitForFunction(() => {
        const m = window.__sphereProjection;
        return m && Math.abs(m[5] / m[0] - innerWidth / innerHeight) < 1e-4 && Math.abs(m[9]) < 1e-4;
    });
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
    await page.goto(`${base}/blog/ferber-kernel-core-to-userspace`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => document.querySelector("canvas")?.height === 844);
    // At the top of a tall page the sphere can be culled, so sample its visible middle.
    await page.evaluate(() => window.scrollTo(0, (document.body.getBoundingClientRect().height - innerHeight) / 2));
    await page.waitForFunction(() => {
        const height = document.body.getBoundingClientRect().height;
        return Math.abs(window.__sphereProjection?.[5] - height / innerHeight / Math.tan(Math.PI / 8)) < 1e-3;
    });
    await page.evaluate(() => window.scrollTo(0, (document.body.getBoundingClientRect().height - innerHeight) / 2));
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    await page.screenshot({ path: "/tmp/sphere-slicing-mobile.png" });
    await page.setViewport({ width: 844, height: 390, deviceScaleFactor: 1 });
    await page.waitForFunction(() => {
        const canvas = document.querySelector("canvas");
        const height = document.body.getBoundingClientRect().height;
        return canvas?.width === 844 && canvas?.height === 390 &&
            Math.abs(window.__sphereProjection?.[5] - height / 390 / Math.tan(Math.PI / 8)) < 1e-3;
    });
    console.log("Canvas sizes, scroll projections, dynamic height, resume, homepage reset, and mobile resize passed.");
} finally {
    await browser.close();
}
