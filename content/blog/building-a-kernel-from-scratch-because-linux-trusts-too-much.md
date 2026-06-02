---
title: 'Building a kernel from scratch because Linux trusts too much'
shortTitle: 'Introducing Wolfram'
ogTitle: 'Building a kernel from scratch because Linux trusts too much'
ogSubtitle: 'A capability-based microkernel written in Rust'
date: '2026-06-02T18:30:00'
category: 'Wolfram'
complexity: 8
readingTime: '11 min'
author: 'notvcto'
description: 'Wolfram is a microkernel OS written in Rust, targeting RISC-V first, built around one idea: programs should not have access to anything they were not explicitly given. No root. No sudo. No ambient authority. Every resource is a capability handle.'
tags: ['kernel', 'os', 'rust', 'riscv', 'security', 'capabilities', 'systems', 'wolfram']
---

I ran `ls /proc/self/fd` on a Linux box once and spent ten minutes closing
file descriptors I didn't know were open. Inherited from a parent process.
Leaked across an exec boundary. Just there, silent, ambient.

That's Linux's model. Trust by default. You get access to things you didn't
ask for. You inherit state you didn't request. The security model is layers
added on top: permission bits, UIDs, SELinux policies, seccomp filters. Each
one closing holes the architecture left open. And they do close them. Mostly.
Until the next CVE.

I got tired of patching holes in a foundation that was never designed to be
secure. So I'm building Wolfram.

---

## What Wolfram is

Wolfram is a microkernel. Written in Rust. RISC-V 64-bit first. Built around
one idea:

**Programs should not have access to anything they weren't explicitly given.**

Not "programs should ask nicely." Not "programs have limited access by default
with an escalation path." Just: if you don't hold a capability handle to a
resource, you cannot name it, cannot request it, cannot touch it. The resource
doesn't exist from your perspective.

There is no root. There is no sudo. There is no ambient authority. A process
is born with an empty handle table and receives only what its parent explicitly
passes at spawn time.

This is capability-based security. The idea is from the 1960s. The implementation
is new: Rust, clean RISC-V hardware, no legacy constraints, no compatibility
surface to maintain, no thirty years of decisions baked into the ABI.

---

## Why Rust makes this different

Every existing capability kernel is written in C. That means the security
model can be correct and still have memory safety issues at the kernel level.
A use-after-free in the capability validator is a catastrophic breach, not
just a crash.

Rust eliminates that class of bug. But more than that, Rust lets you encode
capability relationships in the type system:

```rust
// these are different types. the compiler treats them as different.
Handle<Vmo, Read>
Handle<Vmo, ReadWrite>

// this is a compile error, not a runtime panic
fn write_vmo(h: Handle<Vmo, ReadWrite>, data: &[u8]) { ... }
write_vmo(read_only_handle, data)  // rejected at compile time
```

The kernel enforces capability rights at runtime. The type system enforces
them at compile time. Two layers, one of them completely free. No other
capability kernel can say this.

---

## The model in plain terms

Linux file access:

```
open("/etc/passwd", O_RDONLY)
```

Any process can make this call. The kernel runs a gauntlet: UID, GID,
permission bits, ACLs, maybe SELinux. Five systems answering "is this allowed."

Wolfram file access:

```
file_read(passwd_handle)
```

One question: does this process hold `passwd_handle` with READ rights?
Yes or no. That's the entire access control model.

How the process got `passwd_handle` is answered at spawn time. It was given
it explicitly, with specific rights, by its parent, traceable back to init,
which holds the root capabilities the kernel created at boot. This chain is
called a capability derivation tree. It means every grant of authority is
auditable.

```
fer cap audit <pid>
```

That command shows the complete derivation tree for a running process: every
handle it holds, what rights each handle grants, who granted it. On Linux
today this information doesn't exist in one place. On Wolfram it's a
first-class kernel operation.

---

## Six decisions that define the kernel

These were made before any code was written. They're the decisions that
can't be reversed later.

**Microkernel.** Drivers run in userspace as unprivileged processes with
explicitly granted capabilities. A buggy NIC driver crashes a process, not
the kernel. A compromised GPU driver has bounded scope. Monolithic kernel-space
drivers contradict the zero-trust model at the architecture level.

**Zircon-influenced capability objects.** Every kernel resource is a typed
object: VMO, Channel, Process, Thread, Job. Every object has handles. Handles
are unforgeable integers in per-process tables. Attenuation is enforced: you
can only pass equal or fewer rights, never more. Revocation is instant via
capability nodes. Invalidate the node, every handle through it dies simultaneously.

**No fork. Jobs, Processes, Threads.** The job tree is taken directly from
Zircon. Every process lives in a job. Jobs form a tree. Killing a job kills
everything in it recursively. Processes are born with nothing. Fork doesn't
exist, so there's no mechanism to accidentally inherit authority.

**Async channels plus FastCall IPC.** Channels are general purpose: async,
bidirectional, carry bytes and handles, bounded queue. Handle transfer is
move semantics, the sender loses the handle on send. FastCall is the fast
path: synchronous, register-only, around 50-150 cycles, for interrupt
notification and hot paths. Liedtke's thread donation model.

**VMO-everything.** Every region of virtual memory is backed by a Virtual
Memory Object, a named kernel object with a handle. No anonymous memory.
Shared memory between processes is passing a VMO handle through a channel,
attenuated to the rights the recipient needs. Rights are enforced at the page
table level by the MMU. Hardware enforcement, not policy.

**Userspace drivers, always.** MMIO is a Physical VMO mapped into driver
address space: register access is memory access, no syscall overhead. DMA is
a contiguous VMO, hardware-filled. Interrupts arrive via FastCall. A crashed
driver is a dead process. The kernel didn't notice.

---

## fer

On Linux, system administration is a hundred separate tools that each grew up
independently. `kill`, `ps`, `apt`, `systemctl`, `lsof` — each with its own
conventions, its own failure modes.

On Wolfram there's `fer`. One CLI, native to the capability model.

| command | what it does |
|---|---|
| `fer pkg install <name>` | package management |
| `fer drv load <file>` | load a driver, shows capability request, prompts |
| `fer cap audit <pid>` | full capability derivation tree |
| `fer cap revoke <handle>` | revoke a capability instantly |
| `fer jobs` | job tree, live |
| `fer mem inspect <vmo>` | who holds this VMO, with what rights |
| `fer ipc monitor <channel>` | observe message flow |
| `fer spawn <bin> --cap <...>` | launch with explicit capabilities |

These aren't bolted-on tools. The kernel already tracks all of this to function.
`fer` just surfaces it.

One of my favorite things about this design: `fer drv load` shows you exactly
what capabilities a driver is requesting before you grant them. A NIC driver
requesting all interrupt vectors and `CAP_INSPECT_ALL` is visible before it
runs. That's not a feature. That's a consequence of the architecture.

---

## What exists today

A repo. A README. Some Rust that panics when you run it.

The kernel compiles for `riscv64gc-unknown-none-elf`. It boots in QEMU,
initializes serial output, and panics because init doesn't exist yet. The
panic count is 1. The capability system skeleton is there: handle tables,
capability nodes, rights bitmasks, the typed `Handle<T, R>` struct. The
syscall stubs are there. The HAL boundary is there. The rest is Phase 2.

This is day one.

---

## Where it goes

Phase 1 is boots. Phase 2 is the kernel core: capability system fully
implemented, VMOs, process model, IPC. Phase 3 is a shell. Phase 4 is
drivers. Phase 5 is `fer` complete. Somewhere past that is daily driving
it on real hardware.

That last part is years away. The architecture being right is the hard part.
Everything else is time.

The repo is available [here](https://github.com/notvcto/wolfram-os).
If you want to follow along, watch it. If you want to contribute, read
`docs/architecture.md` and find something unchecked in the roadmap. If you
find a way to forge a handle or escalate capability authority, open an issue
immediately.

The panic count is 1. It will go up.
