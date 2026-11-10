---
title: 'I wanted keyboard input. First I had to stop the controller.'
shortTitle: 'Stopping the USB controller'
ogTitle: 'I wanted keyboard input. First I had to stop the controller.'
ogSubtitle: 'Firmware handoff, 32-bit clocks, and a USB controller that finally stayed stopped'
date: '2026-11-09T21:30:00-04:00'
category: 'Ferber'
complexity: 9.0
readingTime: '18 min'
author: 'notvcto'
description: 'Ferber can now take firmware ownership of the dedicated USB controller on my workstation, halt it, reset it and verify that it stays stopped. Getting there exposed restrictive firmware parsing, an overbroad IVRS check, a 32-bit clock assumption and an unsupported Debug Capability. The same work also hardened the dormant AMD-Vi backend and caught register-layout bugs that ordinary successful boots would never expose. Keyboard input is still ahead.'
tags:
  - 'kernel'
  - 'osdev'
  - 'rust'
  - 'x86-64'
  - 'uefi'
  - 'usb'
  - 'iommu'
  - 'ferber'
---
This post is late. 13 hours late.

I was busy rebooting my workstation to find out which assumption I had gotten wrong this time.

The goal is still an interactive console. A program reads a line, prints it back and waits for another one. Ferber already has an independently built executable for that. It even has a prompt.

The prompt continues to enjoy a peaceful existence inside a binary nobody can interact with.

This week I got the USB controller to stop.

That sounds like a concerning amount of work for a machine doing less. In a kernel, stopping the right thing and knowing what stopped is useful progress.

The final result came from eight checkpoints. Thirty-three files changed. 2,285 insertions and 56 deletions. No new release yet. The work is still on the console branch, and v0.3.1 remains the latest release.

Here is what was hiding between the executable and the keyboard.

## The controller can keep working after the CPU stops paying attention

A userspace driver needs access to device registers. Those registers can instruct the controller to read and write memory through DMA.

The CPU's page tables do not constrain those accesses.

Giving a driver a bounded register mapping therefore leaves another authority question: which physical pages can the controller reach after the driver programs it?

That is why the console milestone includes IOMMU work. Ferber needs a hardware boundary around the controller's DMA authority before handing the controller to an unprivileged process.

It also needs a reliable way to stop that controller.

Closing a capability handle cannot make an outstanding DMA transaction disappear. Killing the driver cannot retract a command the device already accepted. Reclaiming memory while the controller can still write to it creates a fairly direct route to corrupting whatever receives those pages next.

The current diagnostic works on one explicitly selected controller. On my MSI B650M-A PRO WIFI, that is the dedicated AMD controller identified as `1022:15b8`, observed at `12:00.0`.

The kernel requires a unique identity match. The bus address is checked against the firmware handoff record. It is not a hardcoded instruction to stop whatever happens to occupy that address.

The shared controllers carrying unrelated peripherals stay outside this probe.

I would quite like the debugging session to leave the rest of the workstation alone.

## A disabled IOMMU does not promise empty caches

Before touching the physical controller, I fixed an initialization gap in the AMD-Vi backend.

The backend already had explicit deny-default device entries. An all-zero AMD-Vi device-table entry can permit bypass, so zeroing the table is not a useful substitute for constructing entries that deny access.

There was another assumption to remove: observing that translation is disabled does not establish that every relevant IOMMU cache is empty.

The initialization path now requires Invalidate All support, advertised through IASup. After installing the tables and enabling the unit, it submits `INVALIDATE_IOMMU_ALL`, then a CompletionWait command.

Initialization succeeds only after the expected completion is observed.

A matching completion cannot hide a pending hardware fault. Failed completion, clock failure or an expired deadline poisons the engine and prevents reuse.

The tables also retain their lifetime across uncertain activation. Once enabling the unit has been attempted, the backend keeps its coherent buffers until reboot, including failure cases. Returning those pages while hardware might still reference them would be an impressively bad cleanup policy.

This week also replaced the fixed iteration count in command completion with HPET deadlines.

A million loop iterations do not describe a portable duration. The engine now asks for a one-second deadline and measures elapsed hardware ticks. A separate stopped-clock watchdog catches repeated readings that never advance.

The distinction matters later in this story.

This backend remains dormant. The physical handoff diagnostic does not activate AMD-Vi. The IOMMU address printed in its output is discovery metadata.

Cache invalidation completion also does not establish that every PCI requester is quiesced or that firmware DMA has drained. Those remain prerequisites for activation.

## Finding the register bounds required help from firmware

The first controller problem was circular.

The trusted xHCI adapter requires a bounded register aperture. The BAR-sizing helper requires a controller that is already halted or reset.

To stop the controller, I need to access its registers.

To establish the bounds through that sizing path, I need to have stopped the controller.

Great.

Probing an active BAR by writing all ones into its configuration registers would sidestep the helper's precondition. It would also discard the reason that precondition exists.

The UEFI PCI I/O protocol already exposes the resources assigned to a BAR through `GetBarAttributes`.

The loader now captures that metadata before ExitBootServices. It validates the selected function and BAR0, then copies the values into a pointer-free handoff record.

BootInfo advanced from version 4 to version 5. The structure grew from 168 to 232 bytes by appending a 64-byte controller-resource record. Existing field offsets remain unchanged.

The record contains the identity, segment and bus address, raw BAR value, base and length. Firmware descriptor pointers do not survive into the kernel.

Ordinary loader builds and RISC-V boots provide an absent record. The capture path belongs to the opt-in xHCI diagnostic.

After firmware exit, the kernel compares the record against live PCI configuration. Identity, class and BAR placement must still agree. The aperture must also avoid RAM, protected boot data and platform-control regions.

Only then can the kernel use the mapping to inspect the controller.

## My firmware parser had learned the wrong lesson from QEMU

The first physical boot stopped in the loader.

```text
Ferber loader xHCI resource capture failed: 0x8000000000000001
```

`EFI_LOAD_ERROR`.

Technically accurate. Operationally useless.

Several local checks returned that status. The output did not distinguish a malformed descriptor from an invalid controller record or a duplicate target.

I added the capture substage, raw BAR and bounded descriptor data to the failure output. The next boot identified the exact rejection:

```text
xHCI capture substage: BAR descriptor values
BAR0: 0x00000000f6a00004
```

The descriptor decoded to:

```text
base:        0xf6a00000
length:      0x00100000
maximum:     0xf6afffff
translation: 0x00000000
```

A one-MiB region beginning at `0xf6a00000` ends at `0xf6afffff`.

The firmware response was consistent.

My parser only accepted the alignment-mask representation observed in the QEMU/EDK2 path. For that same length, it expected `0x000fffff` in the maximum field.

I had taken one implementation's representation and made it the only acceptable one.

The fix accepts exactly either the alignment mask or the checked inclusive end:

```rust
maximum == length - 1
    || base.checked_add(length - 1) == Some(maximum)
```

The surrounding checks remain. Zero lengths, overflow, nonzero translation, disagreement with the raw BAR and unrelated maximum values still reject the descriptor. The final resource record also enforces its size, alignment and address limits.

The six captured words from the physical failure are now a regression fixture.

This is the kind of firmware compatibility bug I want to fix with a photograph and a test. Silently accepting arbitrary descriptor values would have made the next boot more exciting for the wrong reasons.

## PCI inventory includes functions that are not ordinary DMA endpoints

The loader got through.

The kernel then stopped here:

```text
[FERBER_TEST] xhci_handoff: FAIL (incomplete IVRS coverage)
```

AMD's IVRS table describes IOMMU units and the requester IDs they cover, including aliases.

The diagnostic checked the selected controller's coverage and walked the rest of the PCI inventory. It rejected uncovered entries.

The actual firmware table omitted two structural functions at the start of that inventory: the root-complex host function at `00:00.0` and the IOMMU's own function at `00:00.2`.

The selected USB controller was covered.

My loop had applied the same requirement to everything it could enumerate.

The correction needed to preserve a useful distinction. Missing coverage and conflicting coverage cannot become the same convenient exception.

The shared parser now exposes an optional lookup. An unambiguous absence returns `None`. Malformed or conflicting coverage remains an error. The existing strict lookup still rejects absence.

The diagnostic permits that absent result only for narrowly classified structural functions. A host bridge must have the expected header and programming interface and sit on the first bus of a validated MCFG region. An IOMMU function must have the expected class and match the exact function identified by IVRS.

Ordinary uncovered devices still fail. Selected-controller coverage remains strict. Shared requester aliases still fail.

These exceptions belong to this diagnostic's inventory check. They do not authorize IOMMU activation or establish global DMA containment.

The actual 200-byte firmware table is now another regression fixture. The tests check that those structural entries can pass the diagnostic while the strict lookup continues to reject their missing coverage.

That got me to the clock.

## The clock had 32 bits and I had required 64

The next physical failure was:

```text
[FERBER_TEST] xhci_handoff: FAIL (HPET clock)
```

Another broad error. Another reason to make failures explain themselves.

The more specific output reported:

```text
[hpet] initialization: CounterWidth
[hpet] base: 0xfed00000
[hpet] initial capabilities (hex): Ok(429b17f10228201)
```

The HPET advertised a 32-bit main counter. The initialization code required 64 bits.

There was no invalid period to work around. The period field was 69,841,279 femtoseconds per tick. At that rate, the 32-bit counter wraps roughly every 300 seconds.

The current hardware waits are at most one second.

Supporting that counter required width-aware accesses and deadline arithmetic. Removing the rejection by itself would have left the 64-bit implementation reading the wrong amount of counter state and calculating elapsed time incorrectly across rollover.

Counter reads and reset writes now use the advertised width. On a 32-bit counter, the upper word is ignored and left untouched.

Elapsed time is calculated modulo the counter width:

```rust
let elapsed = now.wrapping_sub(start) & counter_mask;
let expired = elapsed >= requested_ticks;
```

Each deadline must fit within half the counter range. Oversized requests are rejected.

The tests cross rollover at both widths and check the tick immediately before expiry, exact expiry and later expiry. They also verify that the physical capability value is accepted, that the 32-bit path ignores the upper word, and that a stopped counter still causes failure.

There is a limit here. These are continuously polled boot deadlines. A caller cannot leave a deadline unchecked through a complete counter wrap and expect the low counter bits to reveal how much time disappeared.

Suspend and arbitrary scheduling delays need a different clock contract. The current handoff waits remain short and continuously polled.

The [HPET specification](https://www.intel.com/content/dam/www/public/us/en/documents/technical-specifications/software-developers-hpet-spec-1-0a.pdf) explicitly defines both main-counter widths. This was a missing implementation case.

The next boot got through clock initialization.

Then the controller layout failed.

Of course it did.

## The controller had a debug engine I was refusing to recognize

The output now named the selected controller and its validated aperture:

```text
[xhci] selected 0000:12:00.0 BAR 0xf6a00000+0x100000 IOMMU 0xf7700000 alias 0x1200
[xhci] failed stage: Layout
```

The diagnostic initially supported USB Legacy Support and Supported Protocol extended capabilities. Unknown types were rejected.

This time I could inspect the selected controller through Linux's read-only xHCI debug interface. That provided its capability registers without another diagnostic-only reboot or direct host-side register writes.

The controller exposed a USB Debug Capability, ID `10`.

Its control value was `0x000f0000`. The Debug Capability Enable and Debug Capability Run bits were both clear.

The parser had a concrete, inactive structure it did not support.

The [xHCI specification](https://www.intel.com/content/dam/www/public/us/en/documents/technical-specifications/extensible-host-controler-interface-usb-xhci.pdf) defines a 64-byte Debug Capability register block. The diagnostic now reserves and validates that whole span.

It rejects truncated, overlapping and duplicate Debug Capabilities. It requires the enable and run bits to be clear during inspection, before takeover and after reset.

The probe never writes Debug Capability registers.

If the engine becomes active after inspection, the probe fails and attempts ordinary PCI containment. It does not try to negotiate ownership of a running debug engine.

The captured controller layout is now a test fixture too. It covers the capability header, operational registers, port region, runtime registers, doorbells and the legacy, protocol and debug capability chain.

The Linux snapshot established what needed support. It did not establish the firmware state on the next Ferber boot. The boot still had to check that itself.

## A valid pointer can still identify the wrong register

The physical compatibility failures were only part of the work.

Adversarial tests found layout bugs that had passed the ordinary success cases.

One malformed xHCI description placed the legacy ownership capability at the same offset as the operational command register. The old inspection path accepted it.

The handoff code could then write the OS ownership semaphore bit into `USBCMD`.

The offset was inside the BAR. The meaning was wrong.

Another malformed layout put a later capability header inside the body of a Supported Protocol record. That record has a fixed body plus a variable number of speed entries. Reserving only the header left the rest of the record available to be misinterpreted.

The fix validates complete spans before allowing controller writes. Implemented operational registers, ports, runtime registers, doorbells and capability records must not overlap. Supported Protocol records include their speed entries. The Debug Capability reserves all 64 bytes.

PCI capability parsing had a related problem.

A synthetic configuration placed an MSI-X header inside an MSI capability's message-address payload. Following the linked list accepted both entries. Interrupt masking could then write a presumed MSI-X control field that was actually part of the MSI address.

That parser now checks complete known capability spans too, including optional MSI fields and the controls used by translation-related extended capabilities.

These were malformed-input reproductions. They were not failures observed on the MSI board.

They are still bugs worth fixing before hardware assignment.

A register write gets its authority from more than the fact that its address fits inside a mapping.

## The successful result was a stopped controller

The next physical boot finally produced:

```text
[xhci] selected 0000:12:00.0 BAR 0xf6a00000+0x100000 IOMMU 0xf7700000 alias 0x1200
[FERBER_TEST] xhci_handoff: PASS
[xhci] diagnostic stopped; physical DMA isolation is not established
```

Christ. Finally.

The selected controller completed firmware handoff, halt and reset. Final checks verified its identity, BAR placement and stopped state, with PCI bus mastering and interrupt generation disabled.

The diagnostic then stopped.

It did not start USB command rings. It did not delegate a Device capability to userspace. It did not launch the echo program.

That final line about DMA isolation stays in the output because a successful reset does not prove every outstanding PCI write has drained. It also does not establish containment for every other requester on the fabric.

The diagnostic leaves unrelated PCI functions alone. Complete requester containment, peer-to-peer policy, DMA draining and interrupt routing remain work ahead of userspace assignment.

The physical run used the `38c91de` candidate. The image was built from the clean signed commit, flashed and compared byte for byte against the ISO before booting.

The source commit and ISO hash are recorded together. The version banner still says `0.3.1` because these are development checkpoints rather than a new release.

## The tests prove different parts of the result

The initial handoff checkpoint passed the full 51-case RISC-V and 44-case x86 QEMU matrices, together with the release init ISO boot.

The later hardware fixes received focused regressions, Clippy checks and repeated diagnostic boots. I did not rerun that entire architecture matrix after every physical compatibility fix.

The latest focused suites contain 13 handoff tests, 26 platform tests and 17 UEFI tests.

The diagnostic QEMU suite checks a present controller, a missing controller, duplicate targets and missing IVRS data. Missing or ambiguous prerequisites require an explicit failure. A timeout by itself does not count as a passing rejection.

The host tests exercise captured firmware descriptors, structural IVRS exceptions, counter rollover, malformed capability layouts, active debug engines and partial handoff failures.

QEMU exercises the emulated controller and its 64-bit HPET. The board supplied the 32-bit clock and the additional capability layout.

The physical PASS adds evidence for this selected controller on this workstation. It does not generalize the result to arbitrary USB controllers or establish physical RISC-V support.

No physical RISC-V hardware has been available.

## The keyboard still needs the rest of its authority path

Last week, the missing console path already included device ownership, DMA isolation and interrupt delivery.

This week made the first physical controller handoff work and removed several assumptions that would otherwise have followed it into assignment.

The next work is complete requester containment and safe AMD-Vi activation. After that comes interrupt routing and hardware-backed wakeups, followed by the running driver services and init's explicit delegation of the console session.

The echo executable is still waiting.

It can continue waiting a little longer. I now have physical evidence that the controller can be handed over, reset and left stopped. That is a better foundation than asking the driver to begin with firmware's leftover state and hoping cleanup eventually works.

The code is on the [console branch](https://github.com/ferber-os/ferber/tree/feature/console). The [handoff contract](https://github.com/ferber-os/ferber/blob/38c91deb260ab57b73796ad64035d1ba7686c5e4/docs/reference/xhci-handoff.md) describes the current bounds.

Physical DMA isolation, interrupt delivery and interactive input remain unverified.

If you're going to hand a process a controller, first prove you can stop it.
