---
title: 'The panic count is still 2: shipping Ferber v0.1.2 through v0.1.5'
shortTitle: 'Ferber v0.1.5 Deep Dive'
ogTitle: 'The panic count is still 2: shipping Ferber v0.1.2 through v0.1.5'
ogSubtitle: 'Paging HAL, capability isolation, and container trees in Rust'
date: '2026-10-12T23:45:00'
category: 'Ferber'
complexity: 9
readingTime: '14 min'
author: 'notvcto'
description: 'Four releases after getting Ferber to boot on real hardware, Phase 2 is mostly in tree. The kernel now has a dynamic buddy allocator, Virtual Memory Objects, full Sv39 and PML4 paging parity, and an execution container hierarchy where processes start with zero handles. The panic count is still 2, but the code running before it went from a boot stub to an operating system.'
tags: ['kernel', 'os', 'osdev', 'rust', 'riscv', 'x86', 'paging', 'security', 'ferber']
---

The last post ended with "The panic count is 2. Phase 2 starts now."

It did not go up. It did not need to. In Phase 1, hitting the panic meant the hardware did not silently reboot before handing off execution. In Phase 2, the panic is a goalpost moving backward while real kernel systems fill the empty space behind it.

Between `v0.1.2` and `v0.1.5`, four releases shipped. The kernel moved from an ELF loader with a physical bitmap allocator into an actual capability microkernel. Every process is isolated. Hardware page tables are active. Threads switch register contexts in assembly. The container tree guarantees zero orphaned resources.

Here is what went into the tree, what broke in the process, and why the architecture looks the way it does.

---

## The buddy allocator had to bypass itself

Phase 1 only had a physical bitmap allocator. It handed out raw 4 KiB frames. That works for early boot page tables, but a capability system needs small, dynamic allocations for handle tables, capability nodes, and metadata.

In `v0.1.2` I wrote a buddy allocator in `ferber/src/kernel/memory/heap.rs` and wired it up as the `#[global_allocator]`. It manages free lists from order 0 (32 bytes) up to order 7 (4096 bytes). When a free list runs dry, it pulls a 4 KiB page from the physical bitmap allocator and splits it downward. When blocks are freed, they coalesce back up to their buddy.

Then reality hit. A kernel does not only allocate small structs. A multi-page thread stack, a large VMO backing store, or an address space table needs multi-page contiguous physical memory. A buddy allocator capped at 4 KiB cannot satisfy an 8 KiB request.

I did not build a complex multi-megabyte buddy system. If an allocation request exceeds 4096 bytes, the allocator steps out of the way. It bypasses the buddy free lists completely and forwards the request directly to `bitmap::allocate_frames()` for contiguous physical pages. Small allocations get fine-grained slab behavior. Large allocations get direct physical frame backing.

In `v0.1.3` I had to put a ceiling on that bypass. Without an upper bound, a single rogue allocation could request the entire remaining RAM and drain the physical bitmap in one shot. I set `MAX_ALLOC_SIZE` to 128 MiB. Anything larger returns null immediately.

LLVM saw a guaranteed failure and optimized the test away. I had to reach for `core::hint::black_box` to force the compiler to emit the failure path. When compiling under release mode with `-O3`, the optimizer noticed the test allocation was mathematically larger than the heap and eliminated the code entirely. Wrapping the requested size in `black_box` tells the compiler the value is opaque, forcing it to actually execute the out-of-memory check.

---

## Breaking CI so it actually tells the truth

You cannot trust a kernel if your test harness drops logs.

In `v0.1.3`, the RISC-V smoke test kept passing intermittently while dropping early boot output. The cause was stupid: glibc block-buffering. QEMU was routing serial output through stdio, and when `timeout` killed the emulator after the expected panic, the buffered output in glibc never flushed to disk. The fix was routing QEMU serial output directly to a file using `-serial "file:$log"`. No user-space stdio buffer in the middle.

Two hours later CI was broken again. Commit `e426557` literally has the message `chore: fix ci. fml`.

The repo had two competing workflow files trying to build ISOs and run tests independently. I wiped `iso.yml`, consolidated everything into `.github/workflows/ci.yml`, and unified the pipeline. Pushing a tag now builds the kernel for RISC-V and x86-64, runs clippy with `-D warnings` on both architectures, executes the smoke tests, builds the freestanding UEFI bootloader, formats a FAT32 image, builds `ferber.iso` with `xorriso`, and publishes the release assets.

During cleanup I accidentally deleted `scripts/x86-preview.sh`. CI broke immediately because the x86 smoke test depends on it.

That script is not just a build wrapper. It inspects the freestanding x86-64 kernel using `readelf`. It verifies that the binary is an `ET_DYN` position-independent ELF, confirms there are no `INTERP` headers, verifies no `(NEEDED)` shared libraries are requested, and walks the relocation table to ensure no relocation exists other than `R_X86_64_RELATIVE`. If a compiler update introduces an absolute relocation that the UEFI loader cannot resolve, the build fails before QEMU even boots.

I restored the script in commit `dfd928b`. It stays.

---

## No anonymous memory, ever

In Linux, you call `malloc()` or `mmap(MAP_ANONYMOUS)` and get back a pointer. The kernel tracks the memory behind invisible backing pages. You have no handle to the memory. You cannot inspect who owns it without walking `/proc`. You cannot attenuate its rights cleanly.

Ferber does not have anonymous memory. Every byte of virtual memory is backed by a Virtual Memory Object (`Vmo`).

A VMO is a typed kernel object. It holds an array of physical frames. If you need contiguous RAM for DMA or stack frames, you call `Vmo::create_contiguous()`. If you need memory-mapped I/O registers for a device driver, you call `Vmo::create_physical()`.

Before a VMO can be mapped into an address space, the kernel validates capability rights. If you hold a handle with only `READ` rights and you ask the kernel to map it writable, the operation is rejected before the page table is touched. The type system checks rights at compile time. The VMO validator checks them at runtime.

---

## Page tables will shoot you in the back

Milestone 1 shipped in `v0.1.4`. It introduced the Paging Hardware Abstraction Layer (`AddressSpace`), bringing full 1:1 parity between RISC-V 64 and x86-64.

RISC-V Sv39 is clean. It uses a 3-level page table walk across VPN[2], VPN[1], and VPN[0]. It checks that the 39-bit virtual address is canonically sign-extended. There is one hardware rule you have to respect: writable pages must also be readable (`W -> R`). In RISC-V, a page table entry with write enabled and read disabled is reserved by the privileged specification. If you want a writable page, it must also be readable. The HAL encodes this directly. Activating an address space is writing `satp` with mode 8 and firing `sfence.vma`.

x86-64 PML4 was where the landmines lived.

The first landmine is upper-half kernel synchronization. In x86-64 long mode, user space occupies entries 0..255 (the lower half), and kernel space occupies entries 256..511 (the upper half). When you create a new PML4 address space, you allocate a fresh 4 KiB root page.

If you leave entries 256..511 empty, the CPU will kill you. The exact microsecond you write the new root address into `CR3` to activate the address space, the kernel's own code and stack disappear from the translation tables. The CPU faults instantly.

Every new `Pml4AddressSpace` must copy entries 256..511 directly from the active boot `CR3` into the new root table. The kernel mappings remain identical across every address space on the system.

The second landmine is the teardown path. When an address space is dropped, you must recursively walk the page tables and free the intermediate frame pages back to the physical allocator.

If your drop implementation walks all 512 entries, it will free the shared kernel page tables. The first process that terminates will deallocate the operating system.

`Drop for Pml4AddressSpace` strictly traverses entries 0..255. It tears down user-space tables and leaves entries 256..511 untouched.

---

## Why fork is an architectural crime

In POSIX, `fork()` creates a child process by cloning the parent's memory layout and file descriptor table. The child inherits open network sockets, file handles, environment variables, credentials, and memory mappings.

Most of the time, the child does not need any of this. It was trying to spawn an unrelated binary. You spend the next ten lines of C closing file descriptors, sanitizing environment variables, and hoping you did not leak an authorization token across an `exec` boundary.

Every vulnerability involving descriptor leakage across process creation is a direct consequence of `fork()`.

In Ferber, `fork()` does not exist.

Milestone 2 shipped in `v0.1.5`. It implemented the execution container hierarchy: `Job -> Process -> Thread`.

A process is born with an empty `HandleTable`. Exactly 0 handles. It has no stdin, no stdout, no open sockets, no inherited memory mappings, and no ambient authority.

If a parent process wants the child to have access to a resource, it must explicitly pass that capability handle at spawn time. If the handle is not passed, the child cannot name the resource, cannot request it, and cannot touch it. The resource does not exist from the child's perspective.

Zero ambient authority is not an add-on policy. It is the default state of existence.

---

## Zero orphans by construction

On Linux, when a parent process dies, its surviving child processes get reparented to PID 1. They become orphans. They continue running in the background, consuming resources, until something explicitly tracks them down and kills them.

In Ferber, processes do not exist in isolation. Every process belongs to an authorizing `Job`. Jobs form a strict hierarchy rooted at a singleton `Job::create_root()`.

When a job is killed, the termination is synchronous and recursive. `Job::kill()` walks down the subtree, kills all child jobs, and kills all contained processes. In `Process::kill()`, every thread is marked `Dead`.

The entire subtree is dead before `Job::kill()` returns. There are no callbacks, no deferred work queues, and no reparenting to init. Orphan processes cannot exist by construction.

---

## Assembly context switching and a dirty direction flag

Thread stacks in Ferber are Virtual Memory Objects. There are no raw pointers and no heap vectors. When a thread is created, the kernel allocates a contiguous VMO for the kernel stack. The stack top is derived directly from the allocated physical frame. Thread stacks being VMOs means every byte of stack memory goes through the same capability validation as any other mappable resource.

Context switching between kernel threads happens in assembly:

RISC-V saves and restores 14 callee-saved registers: `ra`, `sp`, and `s0..s11` (112 bytes).

x86-64 saves and restores 7 registers: `rsp`, `rbp`, `rbx`, and `r12..r15` (56 bytes).

On x86-64, thread entry is handled through a stack trampoline. During context initialization, the kernel writes the thread entry address directly into the top of the kernel stack (`aligned_top - 8`). When `switch_context` restores `rsp` and executes `ret`, the CPU pops the address from the stack and jumps straight into the thread.

Then I caught something during code review: the direction flag.

Under the System V AMD64 ABI, the direction flag (`DF`) in `RFLAGS` must be cleared to 0 upon function entry. If a thread executed string operations with `DF=1` and yielded without clearing it, the next thread to run would execute string instructions backward and corrupt memory.

I added a single `cld` instruction directly before `ret` in `ferber/src/arch/x86_64/context.S`. The direction flag is sanitized on every context swap.

---

## The goalpost moved

At the end of `ferber/src/main.rs`, the kernel runs its in-kernel verification suite:

```text
[task]  running Job, Process, and Thread subsystem tests...
[task]    [1/5] root job initialization & hierarchy management: ok
[task]    [2/5] process creation in job & empty handle table contract: ok
[task]    [3/5] thread creation with isolated dual-stack context: ok
[task]    [4/5] scheduler ready queue & dispatch staging: ok
[task]    [5/5] recursive job subtree kill & zero-orphan cascade teardown: ok
[task]  process model: ok

Phase 1 boot checks complete.
Phase 2 kernel core checks complete.
```

In `v0.1.1`, the terminal line in `main.rs` was `todo!("spawn init — Phase 2")`.

It now reads:

```rust
todo!("spawn init — Phase 3")
```

The panic count is still 2. The difference is what runs before it.

The repo is available [here](https://github.com/notvcto/ferber). If you want to verify the container hierarchy, run `scripts/riscv-smoke.sh` or `scripts/x86-smoke.sh`. Milestone 3 is bidirectional async channels and FastCall thread donation IPC. Next Monday’s post will have it. Yes, I'll be posting every Monday.

If you still believe an operating system needs `fork()` and ambient authority to function, clone the repo and prove where this model fails.
