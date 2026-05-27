---
title: 'I got tired of AI that lies to be polite — so I''m building one that doesn''t'
shortTitle: 'Introducing Zero'
date: '2026-05-26T12:00:00'
category: 'Zero'
complexity: 8.5
readingTime: '9 min'
author: 'notvcto'
description: 'Zero is a minimum viable security reasoning model trained on CTF problems via adversarial self-play. It tells you what''s wrong and why. No hedging. No sugar coating.'
tags: ['ai', 'ml', 'research', 'zero', 'grpo', 'reasoning', 'ctf', 'security', 'llm']
---

I asked an AI to review some code once. The code had a SQL injection so obvious
it could've been a textbook example. The response started with "this looks pretty
solid overall."

That was the last time I used that model for anything serious.

The problem isn't that AI gets things wrong. Everything gets things wrong. The
problem is that most language models were trained to make you feel good about the
interaction. Positive reinforcement during training taught them that validation
gets rewarded. Hedging gets rewarded. "You might want to consider" gets rewarded.
Telling someone their code is outright broken, in plain language, with a reason?
That apparently needed to be softened.

I got tired of it. So I'm building Zero.

---

## What Zero is

Zero is a small, open-source language model trained specifically to reason through
security problems (CTF challenges, code audits, vulnerability analysis) and give
you a straight answer. Not "this could potentially be an issue." Just: "this is a
SQL injection, here's why it's exploitable, here's the fix."

The directness isn't a prompt engineering trick. It's baked into how the model is
trained. The reward function penalizes hedging tokens. Calibrated uncertainty is
rewarded, but only when the reasoning actually supports it. Confident wrong answers
get the heaviest penalty of all.

The target voice is the senior researcher who already knows the answer and doesn't
have any reason to sugarcoat it.

---

## Why it's actually interesting

Zero isn't just a fine-tune with a "be blunt" system prompt. There are three things
happening simultaneously that I haven't seen combined before.

**Minimum viable reasoning.** The real question I want to answer is: how small can
a model be and still develop genuine security reasoning? Not memorization, not
pattern matching on training data. Actual reasoning. I'm running the same training
approach across 1.5B, 3B, and 7B parameter models and measuring where the capability
cliff is. That delta is a research contribution regardless of which model you end up
using.

**Adversarial self-play curriculum.** Two small models. `zero-forge` generates
CTF-style problems. `zero-solve` reasons through them. The generator is penalized
for problems that are always solved (too easy) or never solved (impossible), so
it has to stay at the edge of the solver's capability. The curriculum emerges from
that tension without anyone curating it by hand. This is how you get a useful
training dataset without needing a team to build one.

**Reward-shaped directness.** The GRPO reward function has two components:
correctness (did you get the flag?) and directness (did you say so plainly?).
They're intentionally separate. A correct answer buried in hedging language is
still penalized. An honest "I can't determine this without the IV" is rewarded,
because stating your limits directly is still Zero's register. The failure mode
I was most careful about: confident wrongness. The model learning that confidence
is rewarded regardless of accuracy. The fix is in the reward scoring: a wrong
answer stated with certainty gets a heavier penalty than an uncertain wrong answer.

---

## The domain

CTF challenges in four categories: web exploitation, reverse engineering, cryptography,
and forensics/OSINT. These have rich public writeup corpora, verifiable answers, and
clean reasoning chains. They're also genuinely hard enough that a model can't just
pattern-match to the solution. It has to think.

The evaluation goes three layers deep. CTF solve rate on held-out problems. General
reasoning benchmarks (GSM8K, ARC-Challenge, HumanEval) to measure whether security
reasoning transfers to math and code. That's the most interesting research question.
And human evaluation by real CTF players rating correctness, directness, and usefulness.

If security reasoning generalizes, that's a finding worth documenting. If it doesn't,
that's also a finding worth documenting.

---

## Where it's going

The full specification is in the GitHub repo. Everything is designed in the open:
the reward function, the self-play architecture, the failure mode mitigations, the
dataset strategy. If something in the approach is wrong, I want to know before
Phase 4, not after.

The model family is `zero-1.5b`, `zero-3b`, `zero-7b`. When it ships it'll be on
HuggingFace under `notvcto/zero-3b` and in the Ollama library as `zero`. Apache 2.0.

Phase 1 starts now: baseline evaluation across all three model sizes with no training,
to document where reasoning currently lives before we touch anything. Then dataset
construction. Then the self-play loop.

If you compete in CTFs and want to help evaluate early outputs, my Discord server
is where that'll happen. Credit in the model card for everyone who contributes.

This took about two hours to go from "I'm sick of AI that hedges" to a full research
spec. That's either a good sign or a warning sign. Probably both.
