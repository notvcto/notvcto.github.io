import assert from "node:assert/strict";
import { isViewportCovered } from "./sphere-coverage.ts";

const section = (top: number, bottom: number) => ({ top, bottom, left: 0, right: 1280 });
assert.equal(isViewportCovered([section(0, 345), section(345, 1734)], 1280, 900), true);
assert.equal(isViewportCovered([section(345, 1734), section(-12, 345)], 1280, 900), true);
assert.equal(isViewportCovered([section(400, 745), section(745, 2134)], 1280, 900), false);
assert.equal(isViewportCovered([section(0, 345), section(346, 1734)], 1280, 900), false);
assert.equal(isViewportCovered([{ ...section(0, 1000), right: 600 }], 1280, 900), false);
assert.equal(isViewportCovered([], 1280, 900), false);
console.log("Sphere coverage: adjacent sections, overlap, partial hero, gaps, and width checks passed.");
