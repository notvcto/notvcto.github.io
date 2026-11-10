import assert from "node:assert/strict";
import worker from "./worker.mjs";

const fetchOriginal = globalThis.fetch;
let requested;
try {
    globalThis.fetch = async url => { requested = url; return new Response("<html>fixture</html>"); };
    const path = "/ad-frame/4354f360f5c39181fda663c280098eaf";
    const response = await worker.fetch(new Request(`https://ads.notvc.to${path}`));
    assert.equal(requested, `https://notvc.to${path}`);
    assert.equal(response.headers.get("Content-Type"), "text/html; charset=utf-8");
    assert.equal(response.headers.get("Content-Security-Policy"), "frame-ancestors https://notvc.to");
    assert.equal(response.headers.get("Origin-Agent-Cluster"), "?1");
    assert.equal(await response.text(), "<html>fixture</html>");
    requested = undefined;
    assert.equal((await worker.fetch(new Request("https://ads.notvc.to/?url=https://example.com"))).status, 404);
    assert.equal(requested, undefined);
    assert.equal((await worker.fetch(new Request(`https://ads.notvc.to${path}`, { method: "POST" }))).status, 405);
    globalThis.fetch = async () => { throw new Error("Unavailable"); };
    assert.equal((await worker.fetch(new Request(`https://ads.notvc.to${path}`))).status, 502);
    console.log("Worker origin, route restrictions, headers, and upstream failure checks pass.");
} finally { globalThis.fetch = fetchOriginal; }
