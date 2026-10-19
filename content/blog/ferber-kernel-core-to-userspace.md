---
title: 'From kernel core to userspace: Ferber v0.1.6 through v0.2.6'
shortTitle: 'Ferber enters userspace'
ogTitle: 'From kernel core to userspace: Ferber v0.1.6 through v0.2.6'
ogSubtitle: 'Capability ownership, sparse RAM, blocking IPC, and the first separately built ELF'
date: '2026-10-19T08:00:00-04:00'
category: 'Ferber'
complexity: 9.0
readingTime: '25 min'
author: 'notvcto'
description: 'Nine releases took Ferber from kernel IPC primitives to executing a separately built ELF on physical x86-64 hardware. Since v0.1.5, Ferber gained a userspace privilege boundary, capability and channel syscalls, sparse physical-memory management, cooperative scheduling, and a bounded static ELF loader. Getting those features to coexist meant fixing lock ordering, defining capability ownership, closing wakeup races, and moving task destruction onto a stack that would survive it. Both architectures pass the QEMU suites, physical x86-64 has run the ELF fixture, and the project survived a complete rename. Wolfram became Ferber.'
tags:
  - 'kernel'
  - 'os'
  - 'osdev'
  - 'rust'
  - 'riscv'
  - 'x86-64'
  - 'memory'
  - 'ipc'
  - 'elf'
  - 'capabilities'
  - 'ferber'
---
Two channel endpoints sending at the same time could deadlock. Every ordinary boot probe could still pass.

The problem was sitting in the lock order. One side could hold endpoint A and wait for B while the other held B and waited for A. A single active CPU with interrupts disabled gave that bug very little opportunity to introduce itself.

That is the sort of work nine version numbers fail to explain.

The last post stopped at v0.1.5, with paging, execution containers, and assembly context switching in place. v0.1.6 through v0.2.6 took those pieces across the userspace boundary. Most of the difficult work happened where an operation could fail, suspend, or destroy something another object still needed.

## Queues and thread donation solve different scheduling problems

v0.1.6 introduced asynchronous channels. Each endpoint has an incoming queue. A successful send places owned message data into the peer's queue and allows the sender to continue. The receiver can consume that message later.

There are explicit limits: 64 queued messages per incoming queue, 64 KiB of payload per message, and 64 transferred handles per message. A full queue produces backpressure. An empty queue gives a nonblocking receiver nothing to consume. Closing the peer becomes observable, but already queued messages can drain first.

Those semantics let producers and consumers make progress at different times. A message has to retain its bytes and capability references while nobody is actively handling it.

FastCall has a different intended contract. The caller needs a synchronous answer from a target. Thread donation means handing execution directly to that target while the caller waits for its reply, avoiding an ordinary trip through the ready queue. The arguments and results fit in registers, so the call does not need an allocated message payload.

There is an important qualification to the v0.1.7 milestone. The current FastCall function models those thread-state transitions: it rejects a dead target, marks the caller blocked, marks the target running, and returns an echo of two argument words. It does not yet switch the CPU into the target's code or provide a userspace call-and-reply path.

The interface and early donation model exist. Actual target execution, capability authorization for the call, and runtime integration remain work. I am also not presenting the 50–150-cycle estimate in the early notes as a measured result.

The asynchronous channel path has since acquired real userspace syscalls and blocking receive. FastCall still has an unchecked syscall entry on the roadmap. Those are distinct completion levels, and they need to stay distinct in the description.

## A syscall has to find a trusted stack before it calls Rust

v0.2.0 crossed the privilege boundary on both architectures. The obvious part is entering RISC-V U-mode or x86-64 Ring 3. Returning safely through the kernel is where the assumptions become dangerous.

On x86-64, `syscall` does not automatically switch to the kernel stack selected in the TSS. It transfers control to the configured entry point while `RSP` still belongs to userspace.

Calling a Rust function at that point would put privileged execution on a user-controlled stack.

The entry path therefore begins with the trusted CPU-local state:

```asm
swapgs
mov gs:[8], rsp
mov rsp, gs:[0]
```

The first store saves the user stack pointer into supervisor state. The next instruction loads the selected task's retained kernel stack. Only then does the entry code build a frame and call the handler.

The TSS stack remains necessary for the privilege-changing exception path. The syscall path performs its own stack selection. The dispatcher updates both trusted entry paths when selecting a task.

User flags need the same treatment. A task can enter a syscall with the direction flag set. Rust and the System V AMD64 ABI expect it cleared. Leaving it set can make string operations walk backward through memory.

Ferber configures `MSR_FMASK` to clear unsafe entry flags and executes `cld` before calling Rust. The probe deliberately arrives with hostile flag state. The handler checks the kernel's entry flags, and the return path preserves permitted arithmetic flags while stripping control state the user should not restore.

Scheduling also made unsaved CPU state an immediate concern. The x86 path disables user FSGSBASE instructions and protection keys, and arranges for unsupported x87/MMX/SIMD use to trap. This release does not save and restore a general FP/vector context. Integer-only execution is an explicit boundary.

RISC-V has its own stack problem. The trap entry exchanges `sp` with `sscratch`, which holds the trusted kernel stack while userspace runs. Once the user frame is saved, `sscratch` becomes a sentinel for nested supervisor traps.

Without that distinction, a trap taken while already inside the kernel could apply the user-entry stack swap again. The entry assembly handles the supervisor case on the current kernel stack and preserves the saved trap state. Kernel `gp` and `tp` are restored before entering Rust from userspace.

Both ports use Linux-style argument registers with Ferber syscall numbers. That register convention does not provide Linux or musl compatibility. Unknown syscalls return `-38`.

## A successful roundtrip does not prove the page permissions

Getting a task into user mode and back only proves that the permitted path worked. It says little about the accesses that should fail.

Separate builds attempt a supervisor-memory read, a write into RX code, and instruction fetch from an NX page. The fault path checks user origin, the expected instruction and address, and the architecture-specific access cause before printing its PASS marker.

On x86-64, that includes checking the page-fault access bits. On RISC-V, the expected load, store, or instruction-page-fault cause has to match the scenario. An unrelated panic cannot satisfy those tests. Neither can a timeout.

These are deliberate terminal fault probes. General recovery from an unexpected user fault is still unfinished.

The user-copy helpers have a related failure rule. They preflight every page in a range before writing any destination bytes. If the last page is unmapped or lacks permission, the earlier pages remain unchanged.

Copies then proceed through supervisor RAM aliases. RISC-V does not need to toggle SUM to let supervisor code dereference user mappings directly. The caller must keep mappings and backing stable and must prevent the kernel buffer from overlapping the user backing. Demand paging, concurrent unmapping, and recoverable copy faults need a more complete mechanism.

## A duplicate handle and a derived capability have different revocation behavior

v0.2.1 added handle closure, duplication, and inspection. v0.2.2 added attenuation and subtree revocation.

The distinction between duplication and derivation determines how delegation behaves.

Duplicating a handle creates another table slot pointing to the same capability node. It does not create a new revocation branch. Closing one slot releases one reference. Revoking the shared node invalidates every alias through it.

Attenuation creates a distinct child node with equal or fewer rights. The child retains its parent, so validity can be checked through the derivation chain.

For example:

```text
node N
  handle a -> N
  handle b -> N

  child C
    handle c -> C

  child D
    handle d -> D
```

Revoking `C` invalidates `C` and its descendants. `N` and sibling `D` remain valid. Revoking `N` invalidates both aliases to `N` and every descendant branch.

The implementation does not walk the subtree and rewrite every node. It marks the selected node invalid. Later validity checks walk the retained ancestry and reject a capability if any ancestor is revoked.

That makes invalidation cheap, while lookup cost depends on derivation depth. It also means revocation must not be confused with immediate destruction. Existing references can remain allocated, and revoking a VMO capability does not remove mappings already installed from it.

Attenuation requires `DUPLICATE`. Revocation requires `MANAGE`. Receiving a transferred capability does not manufacture either right. Transfer carries the node and the rights it already had.

Inspection requires `INSPECT` and copies a small type-and-rights record to validated user memory. It exposes no kernel pointers or internal node IDs. Handle arguments are checked before conversion so oversized values cannot silently truncate into a valid slot.

Ownership was just as important as authorization. Handle tables, typed handles, and queued messages now retain owned node references. Each node retains its concrete object backing and its parent. Closing a parent handle cannot destroy ancestry that a surviving child still needs to validate.

That strong ancestry creates another problem: dropping a deep, uniquely owned derivation chain recursively could consume the kernel stack. The node destructor peels uniquely owned ancestors iteratively instead.

The node factory also has a recoverable quota of 1,024 live or reserved nodes. A failed allocation releases its reservation. Duplicate aliases do not consume another node. Closing the final owner can return quota rather than exhausting a permanently consumed pool.

Rust helps express those ownership relationships. It does not choose them for the kernel.

## A physical-address envelope is not a RAM bank

The old allocator managed at most 4 GiB. v0.2.3 replaced that assumption. Removing the ceiling required more than enlarging a bitmap.

Firmware reports intervals. Those intervals can overlap, contain holes, or describe pages the kernel must never allocate. Subtracting the lowest address from the highest would count physical holes as memory.

The shared normalization path first sorts and merges usable byte intervals. It then rounds usable memory inward to complete pages. Reservations round outward and are subtracted afterward.

The order matters. Two adjacent fragments can form one complete page:

```text
usable: [0x1000, 0x1800)
usable: [0x1800, 0x2000)
```

Rounding each fragment inward first would discard both. Merging first correctly preserves `[0x1000, 0x2000)`.

Reservations win overlaps. The kernel image, handoff structures, firmware-map storage, framebuffer, page zero, and other reserved regions remain unavailable. RISC-V discovery honors enabled FDT memory nodes and static reservations, including `no-map`. Unsupported reservation translations and unresolved dynamic reservations fail boot rather than being guessed around.

UEFI currently contributes only conventional memory to the usable set. Boot-services and other firmware categories remain reserved. Reclaiming them will require proving that retained loader data and references no longer need those pages.

The handoff also separates physical reservation addresses from readable virtual pointers. A pointer the loader can read is not automatically a physical address the allocator may reserve, or a pointer the kernel can keep dereferencing after replacing the loader's mappings.

That is conservative. It also gives later memory-efficiency work a clear place to begin.

## The allocator has to reserve its own bookkeeping

A dense bitmap indexed across the entire physical-address envelope would waste storage on holes. The replacement uses linked, page-sized metadata blocks describing actual managed frames.

Each metadata page tracks up to 16,256 frames with separate used and permanent-reservation bits. More physical RAM means more metadata blocks. A high physical address does not require a bitmap covering every absent page below it.

Those metadata pages still have to come from somewhere before the allocator exists.

Bootstrap code carves them from the validated extents, skips pages already consumed by bootstrap tables, and links them without using the heap. Before ordinary allocation begins, every metadata and bootstrap-table page is marked permanently unavailable.

Otherwise the allocator could hand out the page containing its own bitmap. That would be a short debugging session.

Accounting makes the ownership split checkable:

```text
managed = bootstrap-reserved + allocated + free
```

The printed start/end addresses describe an envelope. Managed frame count describes capacity.

Contiguous allocation can cross metadata-block boundaries, but it cannot cross a physical hole. Freeing a range validates every frame before changing any ownership bits. A bad later frame must not leave the earlier half freed.

The heap's 128 MiB limit remains a limit on one allocation. It no longer defines how much system RAM the physical allocator can manage.

## Finding RAM does not make it addressable by the kernel

A physical frame above the old limit is useless if the kernel still assumes it can dereference the physical address directly.

Both ports now use permanent high-half kernel mappings and explicit supervisor aliases for eligible RAM. Translation helpers resolve a physical address through the discovered extent map. Unknown RAM addresses fail instead of becoming arbitrary pointer arithmetic.

The aliases are packed. Physical holes consume no virtual space, although alignment padding does. Sv39 provides a 248 GiB RAM-alias window. That is a real architectural resource, and maps exceeding it fail boot rather than being silently truncated. x86-64 has its own alias-window and hardware physical-address-width limits.

The bootstrap sequence differs across architectures. RISC-V uses image-owned tables to establish temporary packed aliases. x86-64 uses bounded scratch mappings to construct access to RAM outside its temporary identity coverage. Both eventually replace those bootstrap mappings with exact permanent tables.

The kernel image is excluded from general writable RAM aliases. Kernel text stays RX, rodata stays RO/NX, and data and stacks stay RW/NX. Leaving an RW alias to an RX text page would undermine the protection the executable mapping appeared to provide.

Reserved and `no-map` memory receives no ordinary RAM alias. The framebuffer uses an explicit device alias and volatile accesses.

New process roots have private lower halves and share the permanent supervisor upper half. Teardown frees owned user page tables and roots. It preserves shared kernel tables and never treats a mapped leaf frame as page-table-owned memory.

VMO ownership follows the same separation. Allocated VMOs own and eventually free their frames. Physical/MMIO VMOs preserve external contents and do not free that memory. Every newly allocated frame is cleared completely, including bytes beyond the VMO's logical length in its final page.

Contiguous and physical backing use a base address and page count instead of a vector entry for every frame. Scattered allocation unwinds the frames already acquired if a later allocation fails. Kernel stacks still require contiguous backing; user stacks can use scattered frames behind a contiguous virtual mapping.

There is still a concurrency boundary here. The allocator spinlock serializes state, but it is not interrupt-reentrant. An interrupt handler allocating while the interrupted context holds that lock would spin on its own CPU's lock forever. IRQ allocation and SMP need an explicit locking and initialization-publication design before either is enabled.

## 52 MiB and 32 GiB answered different questions

I also kept turning QEMU's RAM down.

With QEMU/OVMF and `-m 52M`, I got a successful boot. That option configures 52 MiB of guest RAM. At 51 MiB, the boot reached the kernel and failed with OOM. At 48 MiB, it failed earlier in the firmware boot path.

Those results locate the observed failures at different stages. They do not measure how much memory each stage owns.

The 52 MiB configuration has to accommodate the boot chain: firmware, loader allocations, the loaded kernel, page tables, stacks, handoff data, and the verification workload. It is not a measurement of the kernel's steady-state working set.

It is also scoped to the QEMU/OVMF setup I tested. Different firmware builds, binaries, memory layouts, and test paths can change the result. I am not claiming a universal 52 MiB minimum.

On the physical machine with 32 GiB installed, Ferber managed about 31.4 GiB across 23 extents. That run demonstrated discovery and allocation beyond the old 4 GiB ceiling. It does not establish a minimum or maximum for a future useful userspace.

The verification follows detected extents, checks their boundary translations and permissions, and exercises owned VMO allocation, mapping, copies, unmapping, and restored accounting. It writes only memory the test owns. The dedicated high-memory threshold and capacity builds were removed in v0.2.4. Ordinary verification runs against the map it actually received.

That is representative allocator and backing verification. It is not an exhaustive destructive test of every installed RAM cell.

## Opposite sends exposed the channel lock inversion

The original channel structure let a send acquire its own endpoint and then the peer endpoint.

Two simultaneous sends could therefore produce:

```text
sender A: owns A, waits for B
sender B: owns B, waits for A
```

v0.2.4 replaced that relationship with one shared pair lock covering both incoming queues and endpoint-liveness state. Opposite sends serialize through the same lock. There is no second endpoint lock to acquire in reverse order.

A host regression runs opposite-direction sends against the actual channel implementation. That matters because the ordinary single-CPU boot path does not establish correctness under simultaneous execution.

Destruction needed similar care. Endpoint teardown detaches queued messages while holding the pair lock, then destroys their owned references after releasing it.

Dropping the final capability reference can invoke an object destructor. That destructor may acquire kernel locks. Allowing it to run while channel state is locked creates another route back into the same locking problem.

## Moving handles requires an infallible commit point

Exposing channels through syscalls added a failure guarantee: a rejected send must leave the sender's handles intact.

Removing handles first and trying to enqueue afterward would violate it. Queue exhaustion, peer closure, or allocation failure would already have changed authority.

The send path validates the endpoint, payload handles, transfer rights, and concrete object backing. It copies the user inputs and reserves payload storage. The channel then checks peer state and queue capacity and reserves the queue slot.

Only after those operations succeed does the commit callback remove the sender's handles and construct the queued message.

Receive has the corresponding contract. It must leave the message queued, destination slots unchanged, and user outputs untouched if validation fails.

It therefore checks output capacities, finds destination handle slots, and validates every output span before copying bytes or publishing handles. Once that preflight succeeds, the supported mapping-lifetime contract makes the commit operations infallible.

This guarantee depends on stable mappings and backing. The process lock pins the mappings for these operations in the supported execution model. Concurrent user unmapping remains unfinished work.

## Different virtual addresses can still name the same output bytes

Receive writes payload bytes, encoded handle numbers, and result counts into separate user buffers.

Checking that their virtual ranges do not overlap is insufficient. Two different virtual pages can map the same physical frame. One output could overwrite another despite passing a virtual-range comparison.

The validator therefore compares translated physical chunks as well. It rejects overlap between outputs and repeated physical backing within a single output span.

This is one of the less glamorous consequences of supporting mappings properly. Different pointers stop being a useful synonym for different storage.

Capability transfer also has an ownership restriction. Current syscall payloads accept genuine VMOs and the current leaf Resource object. Checking a serializable type tag alone is insufficient; the concrete backing has to match.

Graph-owning objects remain excluded. Otherwise a queued capability could retain a process whose handle table retains the endpoint that owns the queue:

```text
queue -> capability -> process -> handle table -> endpoint -> queue
```

Reference counting cannot reclaim that cycle.

The restriction keeps the supported ownership graph bounded while a general cycle policy remains unfinished.

Discarding an undelivered message now releases its references without revoking the node. Revocation stays explicit and requires `MANAGE`. A capability revoked while queued can still be received, but the resulting handle is already invalid for ordinary operations and can be closed.

## Blocking receive has to close the empty-check race

v0.2.5 connected channels to cooperative scheduling. Syscall `10` adds blocking receive and requires both `READ` and `WAIT`. The earlier nonblocking receive remains available.

The wakeup race to prevent is straightforward:

```text
receiver: observes an empty queue
sender:   enqueues a message, finds no registered receiver
receiver: registers and goes to sleep
```

There is a message ready, and the receiver is asleep waiting for the notification it already missed.

Channel readiness and wait registration therefore share the pair lock. Registration rechecks whether a message is present or the peer has closed. If either changed after the receive attempt, registration declines to park and the syscall retries.

A notification can also arrive after registration but before the actual context switch. The wait token latches that event, so it is still visible when the dispatcher examines the blocked task.

Each task reuses a token with a generation number and notification bit in one atomic word. A notification uses compare-exchange against the original generation. An old event cannot mark a later wait ready.

Wait registrations weakly reference their tokens. Cancellation records weakly reference channel pair state. A forgotten registration must not become the object keeping a dead task or closed endpoint alive.

Host tests exercise send-versus-registration and close-versus-registration races, stale generations, cancellation, allocation failure, and repeated registration cleanup.

A wakeup still does not grant ownership of a message. Another receiver may consume it first. The resumed syscall revalidates authority and attempts receive again.

## A sleeping syscall must retain its stack without retaining its locks

Blocking inside a syscall leaves a real kernel call stack suspended. Its trap frame, local state, and return path have to survive while another task runs.

The scheduler registry retains the process and thread. The thread retains its VMO-backed kernel and user stacks. The saved CPU context points into storage whose owner remains alive.

Lock guards cannot cross the context switch. Neither should temporary strong references be left on a suspended stack if killing that task would abandon the frame and prevent its destructors from running. The receive path scopes those temporary owners away before parking.

Pending wait state also records the original process, numeric handle slot, capability identity, and wait generation.

Handle slots are reusable. If a task closes slot 7 while another thread waits through it, installing a new capability in slot 7 must not redirect the suspended syscall. Close cancellation is latched before reuse and returns `-9`. Revocation through the node or an ancestor is reconciled as `-116`.

Ready-queue storage is reserved during admission. Dispatch and wakeup do not need a fresh queue allocation to make an already admitted task runnable. Registering a wait can fail before parking; notification itself does not depend on an allocation succeeding.

Execution remains cooperative on one active CPU with interrupts masked. A task must yield, block, or exit before another task runs. The host concurrency tests harden the channel primitive; they do not establish an SMP scheduler.

## An exited task cannot free the stack running its destructor

The first version of thread exit marked the thread dead and halted. Letting other tasks continue requires actual reclamation.

A task cannot free its own kernel stack while executing cleanup on that stack. It also cannot destroy the page tables currently translating that execution.

The dispatcher therefore runs on a dedicated 32 KiB contiguous VMO stack. After switching away from the task, it activates the permanent kernel root before reclaiming resources.

It unmaps the retired user stack, detaches the thread, and handles last-thread process exit. Final process handles are released, the process is detached from its Job, and owned resources are dropped outside the relevant locks.

The Job reference matters. Removing a task from the scheduler does not necessarily remove every owner keeping its process alive.

Repeated runs check frame and capability-node baselines and require an empty scheduler registry. If live tasks remain but none is runnable, the harness diagnoses:

```text
cooperative deadlock: live tasks with no runnable producer
```

The deadlock probe requires that exact diagnosed condition. An unrelated panic or a timeout cannot substitute for it.

## ELF validation has to follow hardware pages

v0.2.6 added Checkpoint A: loading and executing a separately built static ELF.

The parser accepts ELF64 little-endian `ET_EXEC` for the exact target machine. It uses checked table and payload ranges and bounds work before process construction: 4 MiB of file data, 32 program headers, 16 load segments, 16 MiB of rounded segment mappings, and 256 section headers.

A load segment requires `filesz <= memsz`, valid alignment, file-offset/address congruence, and a range inside the lower user half above page zero. The entry must lie in file-backed executable bytes. It cannot point into BSS or unused page padding.

Permission validation operates on rounded pages. Two byte-disjoint segments can still demand incompatible permissions for the same hardware page:

```text
text: [0x400000, 0x400900) RX
data: [0x400900, 0x401000) RW
```

Both occupy the page beginning at `0x400000`. Giving each byte range its requested permissions is impossible with one page-table leaf. This checkpoint rejects rounded overlap rather than merging those demands.

Accepted load permissions are R-X, R--, and RW-. Writable-executable and execute-only segments are rejected. Interpreters, dynamic linking, TLS, relocation sections, executable stacks, and unsupported runtime requirements are also rejected.

The format checks do not validate every instruction the executable contains. Integer-only execution remains an explicit requirement, and unexpected user faults still take the fatal kernel path. Passing the accepted ELF format does not establish safe execution of arbitrary hostile programs.

## Partial ELF construction must never become runnable

After complete image and stack-range validation, the kernel creates a fresh process under the root Job. Each segment receives a separate zeroed VMO. File bytes are copied at their in-page offset, leaving BSS and page tails zero.

The process reserves backing-owner capacity before installing mappings. A successful mapping followed by a failed ownership-vector allocation would be an awkward place to discover that the mapping itself does not own its frames.

Partial VMO mapping failure removes the leaves already installed. Private intermediate tables can remain until failed-process teardown releases them. The address space is destroyed before its retained segment backing is released.

Failure handling also kills and detaches the partial process from its Job. Killing alone would leave the Job's strong reference keeping it allocated.

Only a fully constructed process and thread reach scheduler admission. Each thread now stores its own user entry address; the scheduler no longer assumes every task begins at the resident probe's fixed address. The loaded task uses the existing yield and exit syscalls. This checkpoint adds no syscall numbers.

The user stack is a separate 16 KiB RW/NX VMO with an unmapped page below it. Initial SP is aligned. There are no arguments, environment, auxiliary vector, return address, or bootstrap channel. The process starts and remains at zero handles for this fixture.

The loader regressions compile the production loader against fallible host resources and inject failure at each setup step, including partial mapping and admission. They check that failed construction leaves no published task or leaked model resources.

Those models do not exercise hardware page tables or actual context switching. QEMU runs cover the real kernel path. The distinction matters when deciding what a green test actually proved.

## The ELF marker follows execution and reclamation

The fixture is built separately by `build-user-elf.sh`. Its Rust `no_std` wrapper includes architecture-specific assembly for `_start`.

The instructions that execute are assembly. This milestone does not establish a general Rust startup runtime.

The fixture checks stack alignment, initialized read-only and writable data, all 8 KiB of BSS zeroing, and writes at both ends of that BSS. It makes an unknown syscall and checks `-38`, yields and checks zero, verifies preserved register and stack state, then exits successfully.

One warmup and three measured executions must restore frame, capability-node, and Job process counts and leave the scheduler empty before the kernel prints `userspace_elf: PASS`.

The warmup matters because allocator and scheduler capacity can legitimately remain allocated for reuse. The measured baseline is taken after that initialization, so the check looks for per-run leaks instead of mistaking reusable capacity for one.

The image is currently embedded as independently linked ELF bytes. Production boot-payload delivery remains ahead.

These markers come from two separate build configurations. The resident suite reaches:

```text
[FERBER_TEST] memory_verification: PASS
[FERBER_TEST] privilege_switch_roundtrip: PASS
[FERBER_TEST] handle_syscalls: PASS
[FERBER_TEST] capability_mutation: PASS
[FERBER_TEST] channel_syscalls: PASS
[FERBER_TEST] cooperative_scheduling: PASS
[FERBER_TEST] blocking_channel_receive: PASS
[FERBER_TEST] task_reclamation: PASS
```

The separate ELF build reaches:

```text
[FERBER_TEST] memory_verification: PASS
[FERBER_TEST] userspace_elf: PASS
```

Both implementation paths have passed on physical x86-64 hardware. The ELF hardware boot used version metadata from before the release bump. The local suite passed 40 host tests and 27 QEMU/ISO boots, and hosted CI passed for the release as well.

RISC-V execution is verified in QEMU. No physical RISC-V run is claimed. These results also leave the single-CPU, integer-only, interrupt-disabled execution boundary intact.

## The test harness has to reject the wrong success

A grep for `PASS` would be a poor contract for this system.

The smoke parser checks the exact markers for the selected scenario. It rejects missing or duplicate markers, unexpected scenario markers, failures, unrelated panics, and truncated final output. The ELF scenario cannot accidentally pass by producing the resident suite's successes.

The host suites cover memory-map normalization, reservation subtraction, malformed ELF input, allocation failure, channel concurrency, and loader rollback. The boot suites cover actual architecture entry, mapping behavior, syscall return, scheduling, and reclamation. None of those layers substitutes for all the others.

Strict Clippy checks remain in place for both kernel targets, probe configurations, and the UEFI loader. Freestanding x86 ELF validation checks the kernel format and relocation contract expected by the loader. The ISO suite also tests OVMF's CD-ROM boot path through the shared packaging script.

Automated ISO smoke builds enable the emulator diagnostic port for log capture. The published v0.2.6 ISO embeds the ELF checkpoint without that emulator-only feature. The packaging path is shared; the two kernels are not byte-identical.

## The naming collision was the other bullet to dodge

Wolfram was already established software branding. Discovering the existing software trademark and the search collision was sufficient reason to rename before the project became more visible.

So Wolfram became Ferber across crate directories, boot banners, documentation, workflows, scripts, Easter eggs, and release references. The rename touched 88 files. Public links and posts needed updating too.

That was the bullet dodge. We caught the collision early enough to change the name across the project without dragging an established ecosystem along with it. I did not need a legal dispute to tell me the name was a bad fit.

Ferber keeps the tungsten connection. Uranium remains the release codename. v0.2.4 was reissued with the new branding, and a small migration note preserves the connection for anyone following the old name.

The surrounding documentation moved too. The roadmap became its own file, contribution paths became explicit, and a first contribution no longer implies starting in the kernel. Architecture work still has architecture-reading requirements. Translations, diagnostics, tests, tooling, and other bounded work have a visible path in.

The roadmap now places initial ramdisk and bootstrap loading in Phase 3, an initial userspace on-disk filesystem after block-device support in Phase 4, and native NVMe plus the capability-native filesystem in Phase 6. Those entries describe future work; this release does not include a filesystem implementation.

## Init now needs a contract between independently built programs

The remaining distance to `init` has changed.

The kernel can construct an address space, own its backing, enter userspace, return through syscalls, suspend a task, and reclaim it. The next boundary is the startup contract used by an independently built program.

That means deciding how the first executable is delivered, what its initial stack contains, how it discovers its bootstrap capability, and which messages the kernel control side accepts. The channel needs defined rights and a protocol. Errors need meanings that survive separate compilation.

The kernel can construct the first `init` process through the ELF path before userspace task-creation syscalls exist. An init that launches services will then need those APIs, memory operations, and explicit delegation.

That introduces more partial lifetimes: a process whose address space is half built, a failed capability grant, a canceled launch, or a service that dies before acknowledging startup. Every one of those paths has to preserve the same authority and ownership rules as the happy path.

The existing primitives now have to compose across an interface the kernel's resident fixtures no longer control. The runtime must agree with the loader. Init must agree with its bootstrap service. Process creation must agree with cancellation and teardown. A successful syscall sequence is only one part of that contract.

FastCall and an on-disk filesystem can follow on their own paths. They do not need to block the first startup protocol. Useful init will still require considerably more than an ELF reaching its entry point. VMO syscalls, user-created task lifetimes, recoverable user faults, preemption, FP/vector state, IRQ-safe allocation, and SMP remain unfinished.

The code and roadmap are at [notvcto/ferber](https://github.com/notvcto/ferber).

Start init without making it an exception to the security model.
