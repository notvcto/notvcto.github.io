import assert from "node:assert/strict";
import worker from "./worker.mjs";
import { adsConfig } from "../../lib/ads.ts";

for (const unit of Object.values(adsConfig.units)) {
    const url = `https://ads.notvc.to/ad-frame/${unit.key}`;
    const response = await worker.fetch(new Request(url));
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("Content-Type"), "text/html; charset=utf-8");
    assert.equal(response.headers.get("Content-Security-Policy"), "frame-ancestors https://notvc.to");
    assert.equal(response.headers.get("Origin-Agent-Cluster"), "?1");
    const body = await response.text();
    assert.ok(body.includes(`height:${unit.height},width:${unit.width}`));
    assert.ok(body.includes(`https://bauval.org/22/${unit.key}`));
    assert.equal(await (await worker.fetch(new Request(url, { method: "HEAD" }))).text(), "");
    assert.equal((await worker.fetch(new Request(url, { method: "POST" }))).status, 405);
}
for (const path of ["/", "/?url=https://example.com", "/ad-frame/" + "a".repeat(32), "/ad-frame/__proto__"]) {
    assert.equal((await worker.fetch(new Request(`https://ads.notvc.to${path}`))).status, 404);
}
console.log("Worker units, sizing, restrictions and response headers pass.");
