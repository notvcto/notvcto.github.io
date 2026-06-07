---
title: 'Zero Phase 2: the scraper lied'
shortTitle: 'Phase 2: The Scraper Lied'
ogTitle: 'Zero Phase 2: the scraper lied'
ogSubtitle: '3,854 entries scraped. 44% were event announcements.'
date: '2026-05-29T08:00:00'
category: 'Zero'
complexity: 7
readingTime: '5 min'
author: 'notvcto'
description: 'The first pipeline run produced 1,205 triples. Looked fine until we checked the data. 44% of entries had identical challenge, reasoning_chain, and solution fields — the scraper was fetching CTFtime event pages instead of writeups.'
tags: ['ai', 'ml', 'research', 'zero', 'grpo', 'reasoning', 'ctf', 'security', 'llm', 'dataset']
---

The pipeline ran. 3,854 raw entries scraped, 1,205 accepted, wrote to disk. Looked
like a good night's work.

Then we checked the data.

```json
{
  "challenge": "What originally started as a joke at DHM has now evolved into a CTF
with chall authors from all across the DACH region...",
  "reasoning_chain": "What originally started as a joke at DHM has now evolved into a CTF
with chall authors from all across the DACH region...",
  "solution": "What originally started as a joke at DHM has now evolved into a CTF
with chall authors from all across the DACH region..."
}
```

All three fields identical. Not a training triple — a copy-paste of a CTF event
announcement repeated three times. And it wasn't just one entry.

---

## The count

```python
good = 0  # challenge != reasoning_chain
bad = 0   # all three fields identical

# result:
# Good (fields differ): 533
# Bad (all fields identical): 672
```

44% of the dataset was garbage. 672 entries that passed schema validation — long
enough to clear the character minimums — but contained zero training signal.

---

## What went wrong

The CTFtime scraper was supposed to paginate through the writeup listing and fetch
each individual writeup. It was fetching the right listing page. The HTML parsing
was the problem.

The scraper grabbed the first `<a>` tag in the first cell of each row, assumed
that was the writeup link, and fetched it. What's actually in that cell:

```html
<tr role="row">
  <td><a href="/event/3090">plfanzen CFT 2026</a></td>
  <td><a href="/task/32451">Cryptografie</a></td>
  <td></td>
  <td><a href="/team/187248">TCP1P</a></td>
  <td><a href="/writeup/40814">Read</a></td>
</tr>
```

The writeup link is in `cells[4]`. The scraper was fetching `cells[0]` — the
event page. CTFtime event pages have enough text to pass a 100-character minimum.
The normalization layer extracted that text faithfully. The validator accepted it.
672 event announcements made it into the corpus as training data.

The content selector made it worse. The scraper fell back to `soup.find("main")`
when no specific content block was found, which on an event page matches the
entire page body. Long enough to pass. Wrong enough to be useless.

---

## The fix

Two changes. First, the scraper now reads the correct cell:

```python
# before: first link in cells[0] — the event page
link_tag = cells[0].find("a")

# after: explicit writeup link from cells[4]
title_tag = cells[0].find("a")   # event name for the title
writeup_tag = cells[4].find("a") # actual writeup link
if not writeup_tag:
    continue
```

Second, the validator now hard-rejects pass-through garbage:

```python
# reject entries where all three fields are identical
if triple.challenge == triple.reasoning_chain == triple.solution:
    self.stats["rejected_validation"] += 1
    return False
```

That second check is a permanent addition. Even if another scraper produces
identical-field entries, they won't make it to disk.

---

## What this means for the corpus

The 533 entries that had differing fields were real — CTFtime writeups that actually
contained distinct challenge descriptions and solution steps, PicoCTF structured
problems, HTB machine data with writeup content. Those survive.

The re-run is going at higher limits: 200 CTFtime pages, 2,000 PicoCTF challenges,
500 HTB machines, 300 0xdf posts, 200 IppSec transcripts. Running on a headless
server overnight in tmux. Expected yield with the fixed scraper is significantly
higher quality, if not necessarily higher volume — CTFtime entries that don't have
a writeup link are now skipped entirely rather than fetching an event page and
passing garbage downstream.

Enrichment starts when it finishes. The seed corpus is still small — 1,500 clean
triples is a starting point, not a final number. The dataset grows after Phase 4
as zero-forge generates synthetic problems, and CTFtime accumulates new writeups
daily that future scraping runs will catch.

For now the goal is: enough clean triples to train zero-forge and get the self-play
loop started. We're close.

---

*Zero is an open-source research project. Follow along at [notvc.to](https://notvc.to)
or join the [Discord](https://discord.gg/Ht5ehR8Wpu).*
