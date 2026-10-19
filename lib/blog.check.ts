import assert from "node:assert/strict";
import { getAllPosts, getAllPostsMeta, getPostBySlug, parsePost } from "./blog.server.ts";
import { filterPosts } from "./blog.ts";

const source = `---
title: Test
date: '2026-10-19T08:00:00-04:00'
category: Systems
complexity: 5
readingTime: 2 min
author: Vic
description: A test post
tags: [rust]
slug: overwritten
content: overwritten
---
Actual body
`;
const post = parsePost("test-post", source);
assert.equal(post.slug, "test-post");
assert.equal(post.content.trim(), "Actual body");
for (const [from, to, field] of [
    ["title: Test", "title: 123", "title"],
    ["tags: [rust]", "tags: [42]", "tags"],
    ["complexity: 5", "complexity: .nan", "complexity"],
    ["'2026-10-19T08:00:00-04:00'", "2026-10-19T08:00:00", "date"],
    ["'2026-10-19T08:00:00-04:00'", "'not a date'", "date"],
    ["'2026-10-19T08:00:00-04:00'", "'2026-02-30T08:00:00-04:00'", "date"],
]) {
    assert.throws(() => parsePost("test-post", source.replace(from, to)), new RegExp(`test-post.*${field}`));
}
assert.throws(() => parsePost("../invalid", source), /slug/);
assert.equal(getPostBySlug("../invalid"), null);
assert.equal(getPostBySlug("no-such-article"), null);
assert.ok(getAllPosts().length > 0);
assert.ok(getAllPostsMeta().every(post => !("content" in post)));
assert.deepEqual(filterPosts([post], " RUST "), [post]);
assert.deepEqual(filterPosts([post], "systems"), [post]);
assert.deepEqual(filterPosts([post], "missing"), []);
console.log("ok — blog validation, reserved fields, authored posts, and shared search");
