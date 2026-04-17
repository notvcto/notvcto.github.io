---
title: 'Your ISP is lying to you — and your router will tell you everything'
date: '2026-04-17'
author: 'notvcto'
description: 'How I decrypted my ISP-provided ZTE F670L config.bin in 5 minutes, found a hidden super admin account, and why none of this should surprise you.'
tags: ['security', 'networking', 'zte', 'isp', 'router', 'gpon']
---

# Your ISP is lying to you — and your router will tell you everything

I was pissed at my ISP locking down features so I mapped the whole routing
infrastructure behind it. Port forwarding broken? "That's just how it works."
Custom DNS? "Not supported." Bridge mode? "What's that?"

Spoiler: it all works. They just don't want you touching it.

So I pulled the config.bin off my ZTE F670L — the same router they shipped me,
the same one they said was "fully managed for my convenience" — and decrypted it.
What's inside? GPON credentials, TR-069 ACS phone-home config, VoIP SIP keys,
and a `super` admin account with full privileges that they forgot to mention exists.
The password was in HaveIBeenPwned. Let that sink in.

The best part? The encryption key is literally printed on the sticker on the bottom
of the router. They just reversed it.

---

## How it works

The F670L encrypts config.bin with AES using a key derived from two things on
the label:

    KEY = serial_base (first 8 chars of serial) + byte-reversed MAC address

So for serial `D38D0370XXXX` and MAC `c4:eb:ff:1e:28:26`:
- Serial base: `D38D0370`
- Byte-reversed MAC: `26:28:1e:ff:eb:c4` → `26281effebc4`
- **Key: `D38D037026281effebc4`**

Rocket science, I know.

---

## Setup

    git clone https://github.com/streetster/zte-config-utility
    cd zte-config-utility
    pip install pycryptodomex
    python3 setup.py install --user

## Get the signature

The included `signature.py` script crashes on this router — it doesn't handle
little-endian headers. Use this instead:

    python3 -c "
    import zcu
    with open('config.bin', 'rb') as f:
        zcu.zte.read_header(f, little_endian=True)
        sig = zcu.zte.read_signature(f)
        print(sig.decode())
    "
    # F670L

## Decrypt

    python3 examples/decode.py --key <YOUR_KEY> config.bin config.xml

Then open config.xml and ctrl+f for `super`. You're welcome.

---

## What your ISP doesn't want you to see

- **GPON/OMCI credentials** — how your ONT authenticates to their network
- **TR-069 ACS endpoint** — the server that can push config changes to your
  router at any time, without your knowledge
- **SIP credentials** — if you have ISP VoIP
- **The `super` account** — full admin access, hidden from the standard web UI

None of this is secret for security reasons. It's secret because informed
customers ask inconvenient questions.

---

## Router signature

`F670L`

## Tested with

- ZTE F670L (GPON ONT)
- [zte-config-utility](https://github.com/streetster/zte-config-utility)
