---
title: 'Zero Phase 1: the floor is flat'
shortTitle: 'Phase 1 Results'
ogTitle: 'Zero Phase 1: the floor is flat'
ogSubtitle: 'Baseline results across 1.5B, 3B, and 7B'
date: '2026-05-27T22:00:00'
category: 'Zero'
complexity: 7.5
readingTime: '6 min'
author: 'notvcto'
description: 'Phase 1 baseline results are in. All three models scored around 25% on reasoning problems with no training. Scaling did nothing. Here is what that means for the research.'
tags: ['ai', 'ml', 'research', 'zero', 'grpo', 'reasoning', 'ctf', 'security', 'llm']
---

Phase 1 is done. I ran Qwen2.5 at 1.5B, 3B, and 7B through 16 text-only problems
across web exploitation, reverse engineering, cryptography, and forensics. No training,
no fine-tuning. Just the base models, cold.

Here are the solve rates:

| Model | Solve Rate |
| --- | --- |
| Qwen2.5-1.5B | 25.0% |
| Qwen2.5-3B | 25.0% |
| Qwen2.5-7B | 28.1% |

The 7B bump is a single half-credit on an XSS problem. Effectively flat across all
three sizes.

---

## What flat means

The whole premise of Zero is finding the minimum viable model size for genuine
reasoning — trained on security problems, measured across general tasks too. Phase 1
was supposed to establish a floor to measure from. What it actually found is that
the floor doesn't move with scale, at least not at baseline.

Going from 1.5B to 7B didn't unlock new problem categories. Didn't improve web
exploitation (0/4 across every model). Didn't crack crypto. The problems each size
solved were nearly identical, and when they differed it was arbitrary, not systematic.

That's the result I needed. It tells me the capability gap isn't in the base weights
between 1.5B and 7B. It's in training signal. Which means the GRPO loop has real
work to do, and the MVR question — where does reasoning emerge *after* training,
and does it transfer to math and code — is still genuinely open.

---

## What the models actually said

The raw completions are more interesting than the scores.

On the SQL injection problem, every model correctly identified the vulnerability.
But they didn't reason to the simplest answer. 1.5B guessed `"admin"`. 3B reached
for a time-based blind injection. 7B constructed a UNION attack. Every response was
more sophisticated than `' OR '1'='1`, and every response was wrong. They know the
attack surface. They don't reason to the minimum viable solution.

On base64, every model hallucinated a decode. 1.5B produced "Hello World!". 3B
invented "secretmessagehere". 7B fabricated something that looked plausible but
wasn't. Not a single model computed the answer. They pattern-matched to what a
base64 decode *response looks like* and filled in the result from somewhere else.

Both failures point to the same underlying problem: surface knowledge without
reasoning chains. The SQLi models know what SQL injection is. The base64 models
know what a decode response format looks like. Neither is actually *doing* the
thing. That's what training is for.

---

## The directness finding

Every model scored near 1.0 on directness. Zero hedging. Zero abstentions. Across
48 responses, not one said "I don't have enough information."

That sounds like a win until you read the completions. What it actually means is
that all three models are confidently wrong by default. The base weights don't hedge.
They also don't reason. They produce authoritative-sounding answers that happen to
be incorrect.

This is the miscalibration failure mode flagged in the spec. The GRPO reward function
accounts for it: confident wrong answers are penalized harder than uncertain wrong
answers. Phase 1 confirms that penalty is going to get used heavily in early training.

The work isn't teaching these models to be direct. They already are. It's teaching
them that confidence requires evidence.

---

## What's next

Phase 2 is dataset construction. Real writeups from CTFtime, PicoCTF, and HackTheBox,
normalized into Zero's voice register and formatted as `(challenge, reasoning_chain, solution)`
triples. The base64 hallucination result specifically means the crypto corpus needs
worked examples where the model has to show its computation — not just state the answer.

The [phase 1 notebook](https://github.com/notvcto/zero/blob/main/phase1/zero_phase1_baseline.ipynb)
and [full results CSV](https://github.com/notvcto/zero/blob/main/phase1/zero_phase1_results.csv)
are in the repo.

If you want to follow along or help evaluate outputs when training starts, the
[Discord](https://discord.gg/Ht5ehR8Wpu) is the place.

Testing editing - does this work?
