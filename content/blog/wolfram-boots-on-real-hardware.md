---
title: 'Wolfram boots on real hardware'
shortTitle: 'Phase 1 complete'
ogTitle: 'Wolfram boots on real hardware'
ogSubtitle: 'Five months of nothing. Eight hours. Phase 1 done.'
date: '2026-08-10T00:30:00'
category: 'Wolfram'
complexity: 6
readingTime: '8 min'
author: 'notvcto'
description: 'Phase 1 of Wolfram is done. The kernel boots on RISC-V and x86-64, passes smoke tests in QEMU, boots from USB on real hardware (MSI B650M-A PRO WIFI), and panics exactly where it should. Five months of no visible progress. Eight hours of a sprint that finished it.'
tags: ['kernel', 'os', 'rust', 'riscv', 'x86-64', 'uefi', 'systems', 'wolfram']
---

Five months ago I wrote an announcement post for Wolfram. The last line was
"The panic count is 1. It will go up."

It didn't go up for five months.

---

I'm not going to make that sound cleaner than it was. I didn't have some strategic
reason for the gap. I had a project I was proud of and couldn't find the thread.
That happens. The code sat. The repo sat. The announcement post sat collecting
readers who watched a repo go nowhere.

Then three days ago I sat down and didn't get up until Phase 1 was done.

---

## What Phase 1 actually meant

The original post described a kernel that compiled and panicked. That was honest.
Phase 1 was always about one thing: reliable boot across both target architectures,
verified in QEMU, before touching any kernel features.

The checklist at the end of the sprint:

RISC-V 64 through OpenSBI. Device-tree RAM detection. A bitmap frame allocator.
Trap handling. Secondary hart parking.

x86-64 UEFI boot with full firmware memory-map handoff. Framebuffer diagnostics.
Exception reporting. A boot allocator probe.

A shared kernel core. The RISC-V and x86-64 paths meet at `main.rs` and execute
the same logic from there. One codebase driving distinct binaries for both architectures.

Repeatable QEMU smoke checks. Both architectures. Scripted. Pass or fail, no
ambiguity.

A UEFI ISO with the loader and kernel bundled.

Then the last one: USB boot on the MSI B650M-A PRO WIFI. The kernel ran. Got
through memory allocation. Hit the `spawn init` panic. Correct behavior. That's
the expected terminal state for Phase 1 — init doesn't exist yet.

The panic count went up. Phase 1 is done.

---

## What an 8-hour sprint actually looks like in a diff

44 files changed. 3,473 insertions. 144 deletions.

The big ones:

`boot/uefi/` didn't exist before this sprint. The entire UEFI bootloader is new:
ELF loader, page table setup, firmware memory-map handoff to the kernel. 539 lines
for `main.rs` alone. This is the part that made x86-64 possible.

`wolfram/src/arch/x86_64/` didn't exist before this sprint. Console output.
Exception handling. The trap table. The entry assembly. All of it written in the
sprint.

`wolfram/src/boot_info.rs` is the interface between the bootloader and kernel:
149 lines that define what the bootloader hands off and what the kernel expects.
This is also new.

The bitmap frame allocator in `wolfram/src/kernel/memory/bitmap.rs` went from
a stub to a real implementation: 282 lines tracking physical page frames,
supporting allocation and deallocation, used by both architectures.

The device-tree parser (`wolfram/src/arch/riscv64/device_tree.rs`) is 250 lines
of RISC-V RAM detection. Required for QEMU and for any real RISC-V hardware.

All of this was written, debugged, and verified in one sitting.

---

## The UEFI bootloader was the actual hard part

RISC-V via OpenSBI is relatively clean. The firmware does the early setup, hands
you a device tree, you're in Supervisor mode with a serial port. It's almost polite.

x86-64 UEFI is a different problem. UEFI gives you a runtime environment, a
memory map you have to interpret, and a framebuffer you have to configure. You
have to parse your own ELF, set up page tables, exit boot services at exactly
the right moment, and hand off to the kernel without losing track of where anything
is. One wrong move in the memory-map handoff and you're writing into firmware
data structures you no longer own.

Writing an ELF loader from scratch in a UEFI environment with no allocator and
no std is not the kind of thing that has obvious debugging paths when it goes
wrong. You add serial output. You verify segment parsing. You walk the page
tables by hand and confirm entries. You exit boot services, cross your fingers,
and either the kernel gets control or it doesn't.

It got control.

---

## Real hardware

The Uranium-238 v0.1.0 release attached a `wolfram.iso`. I put the loader and
kernel on a FAT32 USB stick with the UEFI boot path and plugged it into the
MSI B650M-A PRO WIFI. Disabled Secure Boot. The machine found the loader. The
loader found the kernel. The kernel ran.

Memory allocation proceeded. The framebuffer came up. The kernel hit `spawn init`
and panicked with correct output.

That's the Phase 1 target state. The machine doesn't have an OS yet. It has a
kernel that gets far enough to correctly report that init doesn't exist.
That's progress. Verifiable, specific, not dressed up.

---

## What Phase 2 is

The kernel core. The things that make Wolfram an actual capability system rather
than a kernel that boots and panics.

Capability objects: VMOs, Channels, Processes, Threads, Jobs. Handle tables per
process. Rights enforcement. Attenuation. The typed `Handle<T, R>` that the first
post talked about — the compile-time layer that makes writing bugs harder than
writing correct code.

The job tree. Process spawning. IPC channels.

A buddy allocator to replace the bitmap allocator for the main heap.

System call dispatch with actual implementations.

That's the list. Phase 1 was proving the kernel can get to the starting line.
Phase 2 is the starting line.

---

## Five months

I'm not going to do the thing where I make inactivity sound intentional. It wasn't.
I was working on other things, some of which shipped (VWH 4.0.0 is a different
post), some of which didn't. Wolfram waited.

The sprint happened because I finally had the thread again. Eight hours. I knew
where I was going the whole time and I went there.

The repo is [here](https://github.com/notvcto/wolfram-os). The ISO is attached
to the Uranium-238 v0.1.0 release. If you want to watch Phase 2 happen, watch
the repo. If you find a way to get further than the `spawn init` panic without
implementing init, open an issue.

The panic count is 2. Phase 2 starts now.
