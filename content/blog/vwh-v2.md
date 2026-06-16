---
title: 'VWH v2: a valid signature is not a witness'
shortTitle: 'VWH v2'
ogTitle: 'VWH v2: a valid signature is not a witness'
ogSubtitle: 'Dual signatures, a bug that failed every sealed artifact, and why I published my own private keys'
date: '2026-06-15T20:00:00'
category: 'Engineering'
complexity: 7.8
readingTime: '11 min'
author: 'notvcto'
description: 'VWH v2 ships with dual Ed25519 signatures, BLAKE3 note hashes, a registry backed by GPG-signed commits, and a challenge where I publish my own private keys to prove that a valid signature is not the same thing as a trustworthy attribution.'
tags: ['security', 'cryptography', 'rust', 'vwh', 'cli', 'signing', 'ed25519', 'blake3', 'attribution']
---

A cryptographic signature proves that someone with the private key signed something.
That is all it proves. It says nothing about who that person is, whether they meant
it, or whether the key represents who they claim to be.

This distinction sounds obvious until you see how easily it gets collapsed. Tools
that verify signatures and print "VALID" teach you to read "VALID" as "trustworthy."
It isn't. Mathematical validity and attribution trust are two separate claims, and
most signing tools blur them together by design.

VWH is built around keeping them separate. Version 2 makes that design more explicit.

---

## What V1 was

V1 was 128 bytes. One Ed25519 key. You signed an artifact and the signature either
verified or it didn't. The registry told you whether the key was recognized, active,
or revoked. If the key was active and the signature verified, the output said
"VERIFIED."

The problem is that "VERIFIED" still just means the math worked. It tells you
nothing about whether the key actually belongs to who claims it. A key is a key.

V1 also had no attached context. The artifact carried an intent field (a single
enum value: LAB, OWNED-INFRA, AUTH-REDTEAM, BLUE-REMEDIATION, RESEARCH) and a
timestamp. That was it. No way to attach a note, an explanation, or any human-readable
context to what was being signed.

Both problems needed fixing.

---

## What V2 adds

The format grows to 256 bytes. The structure is:

```
MAGIC (4) | VERSION (2) | RESERVED (1) | ARTIFACT_ID (16) |
TIMESTAMP (8) | INTENT (1) | AUTHOR_PUBKEY (32) | NOTE_HASH (32) |
AUTHOR_SIGNATURE (64) | SEAL_PUBKEY (32) | SEAL_SIGNATURE (64)
```

Three meaningful additions: a note hash, a separate sealing key, and a second
signature.

**The note hash** is a BLAKE3 hash of a detached `.vwh.note` sidecar file. You
write whatever you want in the note: context, reasoning, a reference, a timestamp
with more detail. The hash is bound into the author signature, so the note becomes
cryptographically attached to the artifact without being embedded in it. If someone
modifies the note, `vwh inspect` tells you. If the sidecar is missing, `vwh inspect`
tells you that too.

**The seal key** is a second Ed25519 keypair, separate from the signing key. You
use your signing key to author an artifact. Once it's ready for publication, a
second key holder seals it. The seal signature covers the entire artifact including
the author signature, which means you can't swap out the author signature after
sealing without invalidating the seal.

**The artifact lifecycle** is now explicit:

```
Draft → Signed → Sealed
```

Signed means the author committed to it. Sealed means it's immutable. You can
unseal a V2 artifact if you made a mistake, fix it, and re-seal. Once it's in
the public ledger as sealed, that's a different conversation.

The design intent is ceremony separation. The signing key is about authorship. The
sealing key is about publication authority. Those don't have to be the same person
or the same moment in time.

---

## The bug that failed every sealed artifact

I built the V2 format. I wrote 20 tests. Every test passed. I shipped.

Then I ran the full workflow: create, sign, seal, inspect. The result:

```
[ERR] Seal signature INVALID: Signature verification failed
[ERR] Artifact seal may be corrupted
```

100% failure rate. Every sealed artifact, invalid.

The root cause took about ten minutes to find once I knew to look. The seal signing
bytes include the seal pubkey:

```
seal_signing_bytes() covers bytes 0..192, which includes SEAL_PUBKEY at bytes 160..192
```

In the original `seal()` function, the code computed `seal_signing_bytes()` before
calling `with_seal()` to write the real seal pubkey into the artifact. So the
signing bytes were computed with 32 zero bytes where the pubkey should have been.
The signature covered the wrong data. Verification read the real pubkey from the
artifact and computed different bytes. Mismatch, every time.

The fix is two lines:

```rust
// write seal_pubkey (with zero placeholder sig) before computing signing bytes
let artifact = artifact.with_seal(seal_pubkey, [0u8; 64]);
let seal_bytes = artifact.seal_signing_bytes();
let seal_signature = crypto::sign(&signing_key, &seal_bytes);
let sealed_artifact = artifact.with_seal(seal_pubkey, seal_signature);
```

The existing test suite had 20 tests covering the V2 format. None of them called
`crypto::verify()` on the output of a freshly-sealed artifact. They checked byte
layout, state transitions, field values. They confirmed the signature was stored.
They never confirmed it was valid.

I added that assertion. All 20 tests now pass. The lesson is obvious in retrospect:
if you're testing a signing system, verify the signature.

---

## Publishing my own private keys

V2 includes an `is_demo` field in the registry. Keys flagged `"is_demo": true`
get a specific warning in `vwh inspect` output regardless of their status:

```
[WARN] DEMO KEY — do not trust for attribution
   This key is intentionally public (Frame Me challenge).
   Valid signature ≠ Victor's presence.
```

The demo keys are real Ed25519 keypairs with real signatures. Both are published:
the signing key and the sealing key. The passphrase is public. With them, you can
produce a V2 artifact that passes every cryptographic check `vwh inspect` runs.

```
[OK] Author signature valid
[OK] Artifact integrity verified
[OK] Seal signature valid
[OK] DUAL-SIGNED (immutable)
```

And then the DEMO KEY warning appears. Because the registry knows those keys by
fingerprint and knows they're intentionally public. A valid signature from a key
I've posted to GitHub proves nothing about who was holding it.

This is the point. You can verify a signature without trusting the attribution.
They're different operations. VWH makes you look at both.

The challenge lives in `examples/demo-key/` in the [public repo](https://github.com/notvcto/vwh).
A reference sealed artifact is included so you can see what fully valid looks like
before you try to beat it. You're not going to beat it. The point isn't to beat it.
The point is to understand why you can't.

---

## The registry commit check

The VWH registry (`notvc.to/vwh-registry`) is backed by a git repo. Every time I
update it, I push a GPG-signed commit. Starting with v2.0.2, `vwh inspect` verifies
that.

Before using registry data for key status or ledger lookups, the inspector hits the
GitHub API and checks whether the HEAD commit on `notvcto/vwh-registry` is verified.
If it is, you see:

```
[OK] Registry commit signed (85ceef39)
```

If it isn't, the inspector walks back through the last 20 commits, finds the most
recent signed one, and re-fetches `keys.json` and `ledger.json` at that SHA. An
unsigned registry HEAD could mean a tampered push, a misconfigured CI key, or a
mistake. Either way, you don't silently trust it.

The check is skipped for offline mode and custom `--registry` URLs. It only applies
to the default registry because that's the only one where the expected signing key
is known.

---

## TrID

One small thing worth noting. [TrID](https://mark0.net/soft-trid-e.html) is the
standard file identification database used in forensics, incident response, and
archive tools. I emailed Marco Pontello, who maintains it. He responded. He added
the VWH definition.

```
100.00%    VWH    VWH Accountability Artifact    application/vnd.vwh
```

V1 and V2 share the same `VWH\0` magic bytes at offset 0. TrID identifies both.
The version byte at offset 4 differentiates them internally. From a file identification
standpoint, the format is formally recognized.

---

## What's there now

```bash
cargo install vwh
vwh inspect artifact.vwh
vwh note artifact.vwh
```

The public inspector handles V1 and V2, online and offline. The registry commit
check runs by default. The note subcommand reads the sidecar with hash verification.
The DEMO KEY warning fires on any key flagged `is_demo` regardless of its status.

Source is at [github.com/notvcto/vwh](https://github.com/notvcto/vwh). The private
authoring tool is not published and won't be.

---

## The actual point

A signature proves key possession. That's a mathematical fact. Attribution requires
a trust model: who controls that key, what that key is registered as, whether the
registry itself is trustworthy.

VWH keeps those two things separate at every layer. Signature verification is
local and offline. Registry data is advisory and verified. The registry commit
check extends that verification up to the git level. The `is_demo` flag demonstrates
the gap directly, with real keys you can use yourself.

"Valid" and "trustworthy" are not synonyms. Build that assumption into your tools.
