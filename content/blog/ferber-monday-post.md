---
title: 'Ferber can launch services. Giving them a keyboard is harder.'
shortTitle: 'From init to services'
ogTitle: 'Ferber can launch services. Giving them a keyboard is harder.'
ogSubtitle: 'Memory budgets, userspace services, initramfs, and the hardware boundary'
date: '2026-11-02T08:00:00-04:00'
category: 'Ferber'
complexity: 9.0
readingTime: '14 min'
author: 'notvcto'
description: "Ferber gained hierarchical allocation budgets, userspace process construction, configured service launch, and a read-only filesystem service. The next console work reaches into device ownership, DMA isolation, interrupt delivery, and the difference between closing a handle and stopping hardware.\n\nThree releases took Ferber from a resident init to configured services loaded through a userspace filesystem. The next milestone is an interactive console. That work has already reached PCI discovery, DMA isolation, device capabilities and interrupt ownership, while the echo program still has no connected hardware path."
tags:
  - 'kernel'
  - 'osdev'
  - 'rust'
  - 'capabilities'
  - 'memory'
  - 'ipc'
  - 'userspace'
  - 'ferber'
---
I wanted a program that reads a line and prints it back.

There is an independently built executable for that now. It has a prompt, a bounded line editor and a console protocol client.

You cannot interact with it yet.

Getting from that executable to a keyboard means deciding which process owns the controller, which memory the controller can access, what happens when its capability is revoked, and whether the scheduler can sleep safely while waiting for an interrupt.

A little plumbing.

Before reaching that particular hole, I shipped hierarchical memory accounting, userspace task construction and a filesystem service. Ferber crossed v0.3.0. Init now launches independently built services from configuration.

Here is what changed, and why typing into the thing still takes work.

## Memory stays charged after its creator disappears

The first problem was accounting.

A process can allocate a VMO, give another process access to it, and exit. The recipient can keep the backing alive through a handle or mapping. A queued capability can retain it too.

If killing the creator refunds that memory immediately, the accounting lies. The physical pages are still occupied. Another process can spend the supposedly recovered budget while the original allocation remains alive.

In v0.2.14, physical allocation charges started following their original Job budget until final destruction.

Admission checks the complete budget ancestry before changing counters. A child with room in its own budget can still be denied because its parent is full. A closed ancestor rejects new allocations even when the allocator could satisfy the request from a cached buddy block.

The backing retains its original owner. Transferring a capability changes who can use the resource. It does not move the allocation charge.

That distinction survives process exit and Job closure. The budget ancestry remains alive until the final allocation charged against it disappears.

The allocator also has to charge what it actually consumes.

A 4 KiB payload with page alignment can require two physical pages once the allocation header is included. Padding, unused buddy blocks and fragmentation consume real RAM.

Separate buddy arenas keep owners from silently sharing an accounting page. A fully coalesced page returns to the physical allocator and releases its charge.

Reallocation gets unpleasant here. When replacement storage is required, old and new backing coexist temporarily. Both must fit. If replacement fails, the old allocation remains valid and charged to its original owner.

The verification fixture keeps memory alive after killing its creator. A producer writes an 8 KiB VMO and transfers read authority to a consumer under a sibling Job. The producer exits. Its budget closes. The consumer still reads the bytes.

The charge remains with the closed producer budget until the consumer releases the final reference.

That is the behavior the ledger has to describe.

## Init now builds the process it wants to run

A resident init could announce readiness and block. Useful foundation. Limited occupation.

v0.3.0 gave it explicit task construction authority.

The kernel delegates authority over a dedicated services Job. Init can create a draft process, install mappings, move capabilities into it, prepare its initial thread and start it.

A draft begins with zero handles. It cannot execute while construction is incomplete.

That gives process creation a publication boundary. Mapping a segment does not make a half-built process runnable. Creating its stack does not admit it to the scheduler. Start performs the final admission after preparation.

The preparation paths have to tolerate failure without leaving a runnable fragment behind.

Executable mappings require sealed backing. Writable mappings retain their writable permits. Stack guards remain reserved. Capability delegation moves eligible handles into actual child slots rather than assuming the child's numbering matches the parent's.

The controller also has a lifetime. Dropping the final controller for an unstarted draft aborts construction. Once the child starts, closing its controller cannot kill it accidentally. The running process belongs to the Job and scheduler machinery.

Revocation complicates construction. Operations revalidate the Job authority used to create the controller. A caller cannot retain a controller and continue building after losing that authority. Abort remains available through a live controller so cleanup does not become impossible when authority disappears.

The resulting service really executes in userspace. It announces readiness, receives a challenge forwarded by init and replies.

The verification observes sends from the actual child process and checks the exact endpoint. A stale or unsolicited PONG cannot satisfy a later challenge.

“Init started a service” needs evidence that the service ran.

## Several blocked services can be a healthy system

Launching services exposed another problem with the old finite tests.

A test program eventually exits. A service is often supposed to remain alive and wait.

An empty runnable queue can mean the system has completed its immediate work. It can also mean every process is waiting for something that cannot happen.

The scheduler needs enough information to distinguish those states.

Ferber tracks blocked readers, tasks holding live WRITE capabilities and registered sources. The bounded wait graph must reach a valid source before the system accepts the wait as legitimate.

Two processes holding endpoints to each other do not manufacture an external source. A closed cycle remains a deadlock.

Source leases use weak endpoint identity and checked generations. They must not keep a channel alive merely because the scheduler once knew about it.

The released service boot still ends in a validated terminal steady state with interrupts masked. A separate software-wake probe queues concrete work after quiescence, resumes the processes and checks another challenge.

That proves cooperative software delivery. It does not prove hardware interrupt wakeup.

Keeping that distinction explicit matters now that the console wants to wait for actual input.

## Filesystem access arrives through a session channel

The next release replaced the fixed service image arrangement with named files.

v0.3.1 introduced a custom indexed read-only initramfs format. Its version is independent of the boot envelope that transports it.

The kernel validates the envelope and loads init. It does not resolve archive paths.

Ferrum's initfs process owns that job.

The archive has a versioned header, sorted path index, dense string table and uncompressed data. The parser validates the whole archive before lookup. Duplicate paths, missing parents, unsupported entry kinds, overlapping ranges, nonzero padding and trailing bytes are rejected.

The format is deliberately small. Files and directories. Bounded names and depth. No compression or ownership database.

Init receives a sealed archive VMO. It uses the archive to construct initfs, then releases its own mapping and moves the archive capability to the filesystem process.

Initfs receives no process-creation authority.

Clients access files through predelegated session channels. OPEN returns an ID that means something only within that session. READ transfers bounded chunks. LIST paginates directories. Closing the session releases its open state.

There is no ambient pathname lookup syscall.

The configuration makes delegation visible:

```text
version 1
service alpha libexec/services/alpha fs
service beta libexec/services/beta none
```

Alpha gets a filesystem session. Beta does not.

Init reads the configuration and executable bytes through initfs. It prepares every configured draft before starting any configured child.

That requirement came from a bug. Starting an earlier service before validating a later executable left startup partially published when the later file failed.

Preparation now completes across the configured set before execution begins.

Another bug reused a PONG buffer while forwarding the next child's PING. Multi-service protocols have a talent for exposing assumptions that looked harmless with one child.

Malformed filesystem clients also initially had too much influence over the server. A bad message or failed reply could terminate the filesystem process.

Those failures now disconnect the offending session. Other clients retain their service.

## Waiting on several channels needs one cancellation contract

Initfs needs to listen to control traffic and several client sessions.

Polling every channel would leave a filesystem service consuming execution time while nothing happens.

Syscall 23 adds channel wait-many for up to 16 handles.

Every entry requires READ and WAIT. All entries are validated before readiness is reported. Aliases of the same endpoint are rejected.

The result identifies the lowest ready input index without consuming its message. Queued data and peer closure both count as readiness.

One task token and generation cover the complete registration set. If registration fails partway through, earlier registrations are removed. Return, cancellation and teardown remove the whole set too.

Closing or revoking any watched capability cancels the wait. Slot reuse cannot silently redirect an old registration toward a new handle.

The scheduler includes every member in its producer and source analysis. Waiting on more channels does not grant an implicit reason to believe something will wake the process.

## A device capability has to survive the death of its handle

The console work is on the development branch. It is not part of the released interactive experience.

The current device ABI names kernel-approved assignments. A process cannot supply an arbitrary physical address and ask to map it. Ordinary VMO creation cannot manufacture device authority.

The first mutable operation binds an assignment to one process. Once claimed, it cannot migrate to another driver.

Mappings retain physical VMOs for their approved apertures. They are non-executable. Device addresses do not become allocator-owned RAM, and ordinary user-copy helpers reject device pointers.

Closing a Device handle does not remove a live mapping or stop outstanding DMA.

The process therefore retains cleanup records independently of its handle table. Revocation contains the complete assignment, including mappings created through other aliases. A sibling handle cannot restart it afterward.

DMA leases retain both their backing and any writable permit. A device that can still write into memory must continue to block executable sealing even after the original VMO handle closes.

Teardown has to stop the hardware before returning those pages.

If quiescence cannot be established, the implementation quarantines the backend and backing. Reusing memory while a controller might still write to it would turn a cleanup failure into corruption somewhere else.

The AMD-Vi groundwork exists, but normal boot does not activate it or delegate the controller yet. Discovery, firmware handoff, cache invalidation and interrupt routing still need to establish the conditions that make assignment safe.

Dormant isolation code is not physical isolation evidence.

## The echo prompt waits for a real wake source

The terminal renderer now has Spleen, colors and scrolling. The serial service machinery preserves pending reads and writes across reply backpressure.

That matters because a failed reply must not consume input the client never received. A full reply queue also cannot turn a write retry into duplicate accepted output.

The echo executable uses a shared console client and a bounded line editor. It can service lifecycle messages while waiting for its console response.

The missing path connects those pieces to running drivers, delegates the session through init and makes hardware interrupts wake the waiting processes.

RISC-V uses the serial path. Physical x86-64 needs the keyboard controller and framebuffer path.

The x86 work includes DMA and interrupt isolation before userspace controller assignment. The first intended physical target is a dedicated USB controller with a wired keyboard. Shared controllers carrying unrelated devices need a broader ownership model.

The prompt is small. The authority required to make it honest is considerable.

## The successful boots have a precise scope

The released service and initramfs implementations reached the expected markers on my physical x86-64 workstation:

```text
[FERBER_TEST] memory_verification: PASS
[FERBER_TEST] boot_payload: PASS
[FERBER_TEST] service_launch: PASS
[FERBER_TEST] multiservice_idle: PASS
[FERBER_TEST] init_ready: PASS
[FERBER_TEST] init_waiting: PASS
```

Those physical runs used pre-bump builds. They establish the observed behavior of those builds. They do not establish an exact source hash for every subsequently packaged release asset.

RISC-V verification remains QEMU-only. I still do not have physical RISC-V hardware.

The current console checkpoints passed host regressions, both architecture Clippy checks, 51 RISC-V QEMU cases, 44 x86 QEMU cases and a release init ISO boot through OVMF.

Those checks preserve the existing boot behavior. They do not demonstrate an interactive console or physical DMA isolation.

Integrated failure injection across multi-service preparation and start also remains a coverage gap. Lower-level allocator and task failure tests exist, but their success does not automatically prove every combined startup failure.

Ferber now has services that construct other programs, read named files and remain alive while waiting for work. The next step connects that work to devices that keep operating independently of the CPU.

The source is [here](https://github.com/ferber-os/ferber).

If a driver can disappear while its controller still writes to memory, show me where your ownership model accounts for the controller.
