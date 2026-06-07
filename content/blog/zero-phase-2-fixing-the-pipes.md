---
title: 'Zero Phase 2: fixing the pipes'
shortTitle: 'Phase 2: Fixing the Pipes'
ogTitle: 'Zero Phase 2: fixing the pipes'
ogSubtitle: 'Four broken scrapers, one crash, and a pipeline that now survives both.'
date: '2026-05-30T17:45:00'
category: 'Zero'
complexity: 6.5
readingTime: '5 min'
author: 'notvcto'
description: 'The GitHub scraper was accepting JavaScript library READMEs as CTF writeups. 0xdf returned zero posts. IppSec ignored its limit entirely. The pipeline overwrote data on every run. A full day of fixing things that should have worked.'
tags: ['ai', 'ml', 'research', 'zero', 'grpo', 'reasoning', 'ctf', 'security', 'llm', 'dataset']
---

Not every day has a dramatic finding. Today was plumbing.

After switching from CTFtime to GitHub, four things were quietly broken. None of
them were obvious until we ran the pipeline and looked at what came out.

---

## The GitHub filter was too loose

The keyword filter accepts files without a flag pattern if they have enough security
terminology. "Simple Ajax Uploader" made it into the corpus because it contained
the word "inject" somewhere in a PHP example. It's a JavaScript file upload library.

The fix: files accepted via the keyword path now also need at least one of `ctf`,
`hackthebox`, `htb`, `picoctf`, `flag`, or `capture the flag`. Security terminology
alone isn't enough. CTF context is required.

Yield went from 2 entries per 5 repos (half garbage) to 17x more, all actual writeups.

---

## 0xdf was returning zero posts

The 0xdf scraper reported "found 0 0xdf HTB posts" on every run. Three bugs, stacked.

The tags page parser used `soup.find("h2", string="hackthebox")`, which fails
because the `<h2>` has a child `<small>` tag, making `string=` never match. Should
be `find("h2", id="hackthebox")`.

The RSS feed fallback was parsing `<item>` and `link.get_text()`. But 0xdf
publishes Atom format, which uses `<entry>` and `<link href="">`. Wrong parser,
zero results.

Both bugs together meant every code path returned nothing silently. Fixed both.
0xdf now returns 570 posts.

---

## IppSec ignored its limit

Passing `--max-ippsec 3` ran all 533 videos. The limit check was:

```python
if max_ippsec:
    videos = videos[:max_ippsec]
```

`0` is falsy in Python. `--max-ippsec 0` was supposed to skip IppSec entirely
but instead ran everything. Fixed to `if max_ippsec is not None:`. Now `0` skips,
any positive integer limits, and the default runs all 533.

---

## The VTT cleaning was broken

IppSec transcripts were coming through with raw VTT artifacts:

```
Kind: captions Language: en What's<00:00:00.480><c> going</c><00:00:00.560><c> on
```

The timestamp stripping regex wasn't handling the `<c>` word-level timing tags
that YouTube embeds in auto-generated captions. After the fix, the same transcript
reads as clean natural language:

```
What's going on YouTube? This is IPSC and today we'll be doing interpreter
from hack the box which is a pretty straightforward box that starts off with
a CVE exploiting mirth connect.
```

---

## The pipeline overwrote data on crash

Every run opened `seed.jsonl` in write mode. A crash mid-run meant losing
everything written so far. This happened once. The Linux box I was running the pipeline on shut itself down
partway through a run and took 1,684 entries with it.

The fix is append mode with resume support. On startup the pipeline now reads
any existing entries and pre-loads their IDs and content hashes into the validator.
Existing entries are skipped, not re-written. A crashed run picks up where it left
off without losing anything already on disk.

---

## Shuffle so resume runs explore new content

Without shuffling, every run fetches the same top-starred repos in the same order.
A resume run would burn the entire GitHub rate limit re-fetching repos already in
the corpus before reaching anything new.

Both the repo list and file list within each repo are now shuffled with a daily
seed, deterministic within a day and different across days. 0xdf posts and IppSec
videos get the same treatment.

---

## Where things stand

Pipeline is running on the same Linux machine with 1,684 existing entries pre-loaded.
Sources: GitHub (2,000 repos, 100 files each), 0xdf (570 posts), IppSec
(533 videos). Crash-safe. When it finishes, enrichment starts.

The pipeline code is in `phase2/` in the [repo](https://github.com/notvcto/zero).

---

*Zero is an open-source research project. Follow along at [notvc.to](https://notvc.to)
or join the [Discord](https://discord.gg/Ht5ehR8Wpu).*
