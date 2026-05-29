---
title: 'Zero Phase 2: raw material'
shortTitle: 'Phase 2: Dataset Pipeline'
ogTitle: 'Zero Phase 2: raw material'
ogSubtitle: 'Building the pipeline that feeds the training loop'
date: '2026-05-29T02:25:00'
category: 'Zero'
complexity: 8
readingTime: '9 min'
author: 'notvcto'
description: 'Before Zero can learn to reason, it needs something to learn from. Phase 2 is about building the infrastructure that turns raw CTF writeups into structured training triples — four scrapers, a normalization layer, uncertainty injection, and a path to HuggingFace.'
tags: ['ai', 'ml', 'research', 'zero', 'grpo', 'reasoning', 'ctf', 'security', 'llm', 'dataset']
---

Phase 1 ended with a number: 25%. Flat across all three model sizes. The floor
doesn't move with scale at baseline — which means the capability gap is in training
signal, not base weights. Phase 2 is about building that signal.

Not the training loop. Not the adversarial generator. Just the raw material: a
corpus of security problems and their solutions, formatted so a model can actually
learn from them.

---

## The triple format

Every training sample in Zero's seed corpus is a triple:

```json
// The full schema includes id, source, category, difficulty,
flag, abstention flag, and metadata, but the three fields 
below are what the model trains on.

{
  "challenge": "Clean, self-contained problem statement.",
  "reasoning_chain": "Step-by-step reasoning toward the solution.",
  "solution": "Final answer or flag."
}
```


The middle field is the whole bet. Most fine-tuning datasets pair (problem, answer).
Zero needs the reasoning chain because GRPO trains on the process of getting to an
answer, not just the answer itself. If the model only sees inputs and outputs, it
learns pattern matching. If it sees the reasoning, it has something to reinforce.

The chain isn't just steps. It's Zero's voice applied to a problem: grounded,
direct, every claim tied to a concrete observation. For web challenges that means
actual payloads. For crypto it means actual computations — numbers, not descriptions
of numbers. That last constraint comes directly from Phase 1.

---

## What Phase 1 forced

Three findings from baseline mapping shaped the pipeline.

SQLi showed domain knowledge without reasoning. Every model correctly identified
the vulnerability category. None reasoned to the minimum viable solution. They
know the attack surface. They don't reason through it.

Base64 hallucinated across all sizes. Every model described a decoding process and
produced a plausible-looking result that was simply invented. Not computed — pattern-matched
to what a decode response looks like, then filled in from somewhere else. The fix
is direct: every crypto entry's reasoning chain must include full worked computations.
Actual inputs, actual outputs, actual code.

Zero abstentions. Not one, across 48 test cases. Every model always produced an
answer — confident, wrong, never uncertain. You can't reward correct abstention
during training if the training data never shows it. Hence uncertainty injection.

---

## Four sources

The pipeline scrapes from four places.

**CTFtime writeups** — the largest public corpus of CTF solutions. Writeups are
messy: inconsistent formatting, varying depth, sometimes just a screenshot and a
flag. The scraper paginates the writeup listing, fetches each page, extracts the
content block, pulls a flag with a regex where possible. Rate-limited to 2s/request.

**PicoCTF problem archive** — Carnegie Mellon's public CTF platform. Clean API,
no auth required, structured data: name, description, category, points, hints.
Points map to difficulty. Hints are included in the raw text because they're part
of the intended reasoning path.

**HTB official API** — retired machine writeups via the v4 API. Retired machines
are public knowledge; HTB publishes official writeups for them. The scraper fetches
the machine list, then pulls the full profile for tags (which determine category)
and the official writeup for each machine.

**HTB community writeups** — 0xdf's blog and IppSec's YouTube transcripts. 0xdf
is the gold standard for HTB writeups: methodical, complete, every step shown.
IppSec transcripts via `yt-dlp` are noisier but add volume and cover machines
0xdf doesn't. Both are scraped without auth.

All four sources emit `RawEntry` objects with the same shape: source, title, url,
raw_text, category, difficulty, flag if found, metadata. Everything downstream
operates on that interface.

---

## Normalization

Raw writeups aren't triples. They're HTML pages and blog posts and YouTube
transcripts. The normalization layer extracts structure heuristically before
enrichment.

For each entry it finds three things: the challenge description (problem statement
before any solution content), the reasoning steps (everything between intro and
solution, split by section headers like "enumeration", "foothold", "exploitation"),
and a solution hint (tail of the writeup plus any flags found by regex).

This extraction is imperfect. Some writeups don't have headers. Some put the
solution in the intro. The normalization layer produces something roughly right —
good enough for the enrichment step to fill gaps, not good enough to use as
training data directly.

---

## Enrichment

The enrichment step is where normalized raw data becomes a proper triple in Zero's
voice. There's no API call here — the pipeline runs with `--scrape-only`, dumps
normalized pass-through triples, and Claude Code handles enrichment in batches.

The enrichment prompt gives Claude the raw challenge, the extracted steps, the
solution hint, and the flag, then asks for a clean triple. For crypto, the prompt
explicitly requires full numerical computation in the reasoning chain. For any
entry where the source material is too thin, the correct output is
`INSUFFICIENT_DATA` — that entry gets dropped rather than padded.

This is intentional. Enrichment requires judgment that an automated pipeline
shouldn't fake.

---

## Uncertainty injection

Before enrichment, 10% of entries get their solution stripped.

The decision is deterministic — based on a hash of `source:title:url` — so the
same entry always gets the same treatment across runs. Stripped entries go through
a different enrichment prompt: instead of "here's the solution, write the reasoning,"
it's "here's the challenge with no solution, write what you can observe and what's
missing."

The resulting triples teach Zero to say "I can enumerate the attack surface, but
I'd need the source code to confirm the injection point" rather than inventing one.
These are the abstention triples the baseline completely lacked.

---

## Validation and output

Every triple passes schema validation before it hits disk: challenge at least 20
characters, reasoning chain at least 50 (unless abstention), solution at least 5.
Deduplication runs on both exact ID (SHA-256 of source+title+url) and content hash
(MD5 of lowercased challenge text) to catch the same problem appearing across
multiple sources.

The pipeline writes to `phase2/data/seed.jsonl` incrementally, flushing after
every write. If it dies mid-run, you don't lose everything. Once enrichment is
complete, the dataset pushes to HuggingFace as `notvcto/zero-dataset` with a
95/5 train/test split — the test split held out for eval Layer 1.

---

## What's running right now

The scraper is running overnight in a tmux session: 20 pages of CTFtime, 500
PicoCTF challenges, 200 HTB retired machines, 100 0xdf posts, 50 IppSec transcripts.
Expected yield before deduplication: 1,000–1,500 raw entries.

Tomorrow the enrichment pass starts. After that, Phase 3: training zero-forge on
the seed corpus so it can begin generating problems. That's when the adversarial
loop begins.

The pipeline code is in `phase2/` in the [repo](https://github.com/notvcto/zero).
The dataset will be public at `notvcto/zero-dataset` once enrichment is done.

---

*Zero is an open-source research project. Follow along at [notvc.to](https://notvc.to)
or join the [Discord](https://discord.gg/Ht5ehR8Wpu).*
