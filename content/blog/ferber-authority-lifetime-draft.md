---
title: 'From bootstrap handles to executable memory: Ferber v0.2.7 through v0.2.13'
shortTitle: 'From bootstrap handles to executable memory'
ogTitle: 'From bootstrap handles to executable memory'
ogSubtitle: 'Authority and lifetime across seven microkernel releases'
date: '2026-10-26T08:00:00-04:00'
category: 'Ferber'
complexity: 9.0
readingTime: '20 min'
author: 'notvcto'
description: 'Seven Ferber releases brought explicit bootstrap delegation, a Rust startup ABI, independently delivered executables, resident init, shared VMO mappings and irreversible executable sealing. The engineering problem connecting them was keeping authority separate from resource lifetime.'
tags:
  - 'kernel'
  - 'os'
  - 'osdev'
  - 'rust'
  - 'riscv'
  - 'x86-64'
  - 'capabilities'
  - 'memory'
  - 'userspace'
  - 'ferber'
---
A capability handle can disappear while the resource behind it is still alive.

That became increasingly important this week.

Ferber already had a scheduler, capability handles, IPC and an ELF loader. It could enter userspace on both architectures and execute an independently compiled program. The program was still a verification fixture, though. Its executable bytes came from the kernel build, and its behavior was designed around a finite test.

I wanted to move past that.

The first changes established a bootstrap channel and a defined Rust userspace startup ABI. Then the boot environment started delivering the executable independently of the kernel. After that came Ferrum's first resident `init`.

A process that stays alive needs memory it can create, access, share, map and eventually make executable. Those operations introduce ownership rules that can't depend exclusively on whether a capability handle is still present.

A revoked handle doesn't necessarily release the backing. A closed handle doesn't invalidate an existing mapping. And a VMO cannot safely become executable while another process can still write through an installed alias.

Nine commits later, the result spans seven versions, 104 changed files, 8,148 insertions and 623 deletions.

The most recent fixture writes executable code, seals its backing and runs it. The code returns 17. It then replaces the mapping at the same address with separately prepared executable backing and runs again.

42.

Making userspace independent forces the kernel to account for authority and lifetime separately. That is the thread running through all of this.

## A process starts with authority it was actually given

Ferber processes are born with empty handle tables. An independently linked executable does not get to assume that stdin, a console, a filesystem or even another process exists.

That creates a practical question immediately. How does its first useful interaction happen?

In `v0.2.7`, the kernel constructed the process with zero handles, then explicitly installed a bootstrap channel before admitting the thread to the scheduler. The fixture received a prequeued challenge, returned the expected reply, closed the handle and exited. The kernel checked both the reply and reclamation.

The order matters. Process construction establishes isolation. Delegation grants a particular resource. Scheduler admission makes the thread runnable. Failure before admission must unwind the partially constructed process and any authority already installed in it.

The first fixture used slot zero. That was adequate for proving the channel exchange. Keeping it as an undocumented startup assumption would have been asking for trouble.

A handle table index is a value assigned by the kernel. It is not an entry-point convention. The moment the loader inserts something else first, code that assumes slot zero starts addressing the wrong resource.

`v0.2.8` introduced startup ABI v1. The initial stack pointer references a 32-byte record shared between the kernel and userspace Rust code. Its layout is explicit:

```text
bytes  0..8    magic
bytes  8..12   version
bytes 12..16   record size
bytes 16..20   bootstrap handle
bytes 20..24   presence flags
bytes 24..32   reserved zero bytes
```

Fields use fixed-width little-endian encoding. The decoder checks the exact length, magic, version, size, flags and reserved bytes. Presence has its own flag because handle zero is valid. An absent bootstrap handle must use the defined absent encoding.

The fixture deliberately receives its capability in slot seven. It discovers that number through the record and runs the same channel exchange. That catches the assumption the new ABI was supposed to remove.

The record itself grants nothing. Writing a number onto a stack cannot create a capability. The kernel has already installed the corresponding table entry, and subsequent syscalls still resolve it through the calling process's handle table.

The stack change also exposed a lifetime distinction. The mapping covers the complete guarded 16 KiB stack. Initial SP points near its top, at the startup record. Treating SP as the mapping boundary would give teardown the wrong region to release. The loader now validates entry SP separately from stack extent and alignment.

Shared userspace became integer-only `no_std` Rust with small architecture entry and syscall shims. RISC-V userspace builds for `riscv64imac-unknown-none-elf` with LP64, while the kernel target remains `riscv64gc-unknown-none-elf`. The scheduler does not preserve user floating-point state. A compiler target that assumes the floating-point calling convention would make a promise the kernel cannot keep.

That is the sort of detail that stays invisible while the kernel runs assembly it controls. A separately compiled Rust consumer makes the contract harder to avoid.

## The executable is no longer part of the kernel binary

The ELF fixture was independently linked, but its bytes were still embedded into the kernel for the opt-in test build. Changing the program therefore changed the kernel artifact.

`v0.2.9` moved delivery into the boot environment. UEFI reads `BOOT.ELF` beside the kernel. RISC-V receives the executable through the device tree's initrd properties. BootInfo v3 carries the exact byte length, physical source and permanent virtual alias.

The input is one bounded raw static ELF, up to 4 MiB. An archive, namespace and filesystem service still have to come later. Keeping the format small made the ownership problems easier to isolate.

The source pages must become reserved before allocator metadata or bootstrap page tables can claim them. Their reservation covers the entire page-rounded allocation, while the ELF parser sees only the exact file length. UEFI zeroes allocation padding before handing it off.

The permanent source alias is supervisor-only, read-only and non-executable. Those pages are excluded from the ordinary writable RAM aliases. Otherwise, making one address read-only would leave another address through which the same source bytes could still change.

A retained physical VMO describes the payload without clearing it or freeing the boot-reserved source pages. Loading the ELF allocates fresh owned VMOs for segments and copies the file contents into them. Those segment allocations participate in ordinary process teardown. The source reservation remains for the boot lifetime.

That means two different lifetimes exist before the first instruction executes. The boot payload survives process destruction. A particular loaded instance owns its private segment backing only as long as that instance needs it.

Checking this path exposed real mistakes.

One involved high physical UEFI addresses clobbering unrelated virtual mappings. A physical address is not automatically a safe virtual location. The loader's mapping work has to respect the virtual layout already in use, even when the firmware places allocations somewhere inconvenient.

Another involved payload allocations leaking when a later step failed before the boot-services handoff. Successful reading did not make those pages permanently owned by the kernel yet. The failure path still had to release them.

UEFI complicates that cleanup. The payload owner can release an allocation while firmware services remain usable. After an `ExitBootServices` attempt, it must not try to repair failure by calling firmware cleanup routines. The owner tracks that boundary and suppresses firmware calls once the attempt has happened.

There was also a test problem. Negative boot cases could accept unrelated failure output. A test expecting malformed-payload rejection is useless if an unrelated panic satisfies its parser. The checks were tightened to require the exact expected diagnostic and reject contradictory, duplicate or truncated evidence.

The smoke tests swap in missing, malformed and valid early-exit executables while checking that the kernel's hash remains unchanged. A valid ELF that immediately exits still fails the expected bootstrap protocol. Parsing an image and admitting a process cannot produce the success marker by themselves.

The executable had become independent of the kernel build. The tests needed to become equally explicit about what that independence actually proved.

## A blocked init is supposed to stay blocked

A finite fixture receives a message, replies and exits. Its successful terminal state is easy to describe.

Init should stay alive.

That made the existing cooperative deadlock diagnostic inconvenient in exactly the right way. If every live task is blocked and no runnable producer exists, ordinary scheduler runs diagnose:

```text
cooperative deadlock: live tasks with no runnable producer
```

A resident init waiting for its next message has no reason to exit simply because the current milestone has no service to start. Disabling the diagnostic for a process named `init` would turn a useful invariant into a naming convention.

`v0.2.10` introduced minimal Ferrum init and a separate startup session. Init is delivered as the external Rust ELF. It reads the same startup record, discovers its explicitly delegated channel and receives READ, WRITE and WAIT authority for that endpoint.

It receives no job, namespace, device or process-creation authority.

Startup uses a versioned 16-byte START/READY protocol. Both sides check the exact message length, magic, version, opcode and reserved zero fields. The messages must contain no transferred capabilities. Init validates START, replies READY and blocks on that same endpoint.

READY alone is insufficient evidence. A program could send READY and exit. It could send READY and wait on an unrelated channel. It could close the bootstrap handle and block somewhere else.

The terminal-wait validator checks the admitted process and thread identities, the actual delegated capability node, the handle slot, the channel pair and opposite endpoint side. It checks the registered wait token, generation, rights, notification state and cancellation errors. Init must be the sole live task. Unexpected queued traffic prevents success.

An open peer does not make any arbitrary blocked receive legitimate.

The checks run from the permanent-root dispatcher stack outside the relevant locks. On success, the kernel retains its bootstrap peer and init's live resources through terminal halt. This milestone has no interrupt-driven event source. It demonstrates a precisely validated suspended process rather than a functioning service event loop.

The destruction path needed testing too. Keeping init alive forever would otherwise give its cleanup code an excellent place to hide.

Before the final live instance, each init boot performs private close-after-park runs. The kernel waits until init is genuinely suspended, closes its peer, resumes the task, observes the expected failure exit and reaps it safely. After warming allocation capacities, a measured repetition checks frame counts, capability-node counts and the root Job's process count.

Only then does the final init remain alive.

The ordinary deadlock case still has its original expected panic. Separate adversarial executables test malformed readiness, premature exit, bootstrap closure and waiting on the wrong channel. The production init binary did not need a collection of test commands bolted into its protocol.

We have init now. Its job, currently, is to start correctly and remain alive for a reason the kernel can verify.

## A handle is not the lifetime of its memory

A resident process needs a memory API. `v0.2.11` exposed VMO creation, reading and writing through syscalls 11 through 13. `v0.2.12` added mapping and exact unmap through calls 14 and 15.

The operations look small from userspace. The ownership behind them is where most of the work lives.

Creation returns fresh zeroed owned RAM. Logical object size is distinct from page-rounded backing. A request for 4,097 bytes owns two frames, but the extra bytes in the second frame do not become accessible through byte operations.

Objects are bounded to 16 MiB. A single byte-copy request is bounded to 64 KiB. Physical and MMIO wrappers are excluded from the public byte API. A device register has side effects that ordinary RAM copying cannot model safely.

Every complete allocated frame is cleared before exposure, including the tail beyond logical size. Otherwise, a later mapping or a different view of recycled backing could expose data the new owner never wrote.

Copying introduced another alias problem. Two disjoint virtual ranges can refer to overlapping physical bytes. A virtual-range check cannot establish the nonoverlap required by `copy_nonoverlapping`.

Writes therefore snapshot the complete user source into a fallible staging buffer before changing VMO backing. Reads snapshot VMO bytes before writing the user destination. Complete logical ranges, physical RAM aliases and user-page permissions are validated before publication.

A read destination that repeats overlapping physical chunks is rejected. One physical location cannot simultaneously hold two different output bytes just because userspace supplied two virtual addresses for it.

These copies provide a specific failure guarantee: returned validation and allocation errors leave the destination unchanged. That remains scoped to stable mappings and the current execution model. Another CPU or a DMA device writing the same storage would require additional synchronization.

Allocation accounting follows the object. The global user-created VMO budget is the smaller of 64 MiB and one quarter of managed pages. A nonallocating charge belongs to the VMO until final destruction. Duplicating a handle does not charge the same pages twice. Transferring a handle, queueing it in a message or exiting the creator cannot release the charge while another owner still retains the backing.

Kernel allocations remain outside that budget. Hierarchical Job limits and guaranteed kernel headroom are still separate work.

Mappings add another owner.

Each successful user mapping records its virtual range, VMO offset, permissions and a strong `Arc<Vmo>`. It retains the actual backing object independently of capability nodes. Closing or revoking every handle can therefore reclaim the nodes and ancestry while the mapped frames stay alive and charged.

Revocation denies later capability operations. Existing mapped access continues until exact unmap or process teardown. A CPU load through an installed PTE does not consult the handle table.

That behavior needs to be explicit. Assuming revocation removes a mapping would give the caller a security guarantee the kernel never implemented.

Map requires explicitly granted MAP authority. The initial mapping patch supported RO and RW/NX. It rejects occupied ranges, raw reserved PTEs, huge leaves and registered stacks or their guard pages. An absent PTE does not mean a stack guard is available for allocation.

A process may hold 64 user mapping records, 16,384 mapped pages counting aliases, and 256 private page-table frames. The table limit includes its root and ELF/stack tables. These are bounds on metadata and address-space amplification as well as data allocation.

The page-table transaction was the difficult part.

Installing a range can need several intermediate tables. If the kernel links the first new table into the live tree and the next allocation fails, it now owes rollback for reachable paging state. On x86, opening an ancestor's permissions can also affect existing siblings.

Both walkers preflight the complete raw range and count the missing table prefixes. They allocate and zero the required frames off-tree. Record capacity and quotas are checked before reachable entries change. The final publication path allocates nothing.

The x86 commit opens ancestor entries only when preparation is complete and preserves the effective restrictions of existing sibling mappings. A failed preparation leaves existing PTEs and effective permissions unchanged.

Unmap has the opposite ordering problem. Removing a mapping record and freeing backing before invalidating translations could let the allocator reuse pages while stale CPU state still refers to them.

The syscall accepts one exact registered region. It validates every expected physical frame and permission before removing anything. It clears leaves, detaches empty owned lower-level tables, invalidates local translations and then releases retired table frames and mapping ownership.

Root tables and shared kernel tables stay outside pruning. Page tables own their intermediate frames; they never own the VMO data frames described by their leaves.

Last-thread reaping drains dynamic mappings from the permanent-root dispatcher stack. Even an externally retained dead Process object cannot keep those dynamic mappings installed through the reaper path. Fallback destruction preserves address-space-before-backing field order.

Authority and lifetime have now separated in several places. The handle permits an operation. The mapping permits memory access. The object retains the pages. The allocation charge survives until the pages can actually be returned.

## Executable memory has to stop being writable everywhere

`v0.2.13` made the distinction security-critical.

Per-mapping W^X would let the kernel install an RX alias while another process retained an RW alias to the same frames. Every individual PTE could look reasonable. The executable bytes could still change underneath the reader.

Closing the writer's handle would not help. Its mapping owns the backing independently. Revoking its capability would not help either. Revocation does not remove installed memory access.

The seal has to account for actual writable mappings across the entire object.

Executable authority is requested at creation. Existing creation options retain their rights. The new executable bit requires the existing mappable bit, so valid options are zero, one and three. Options three grant MAP and EXECUTE in addition to the original rights.

That grants authority to publish code from fresh memory. It does not make mutable backing immediately executable.

Syscall 16 requires MANAGE and EXECUTE and irreversibly seals the whole VMO. RX mapping additionally requires READ, MAP and EXECUTE, plus sealed backing. Execute-only and RWX requests remain invalid.

The VMO's existing content lock now protects sealed state and a count of writable-mapping permits. Every writable user mapping holds a permit against the object. Any live permit blocks sealing with `-16`.

That includes a writable subrange in another process. It includes a mapping whose originating handle was transferred, closed or revoked. It also includes a provisional writable map whose page-table preparation has not finished.

The permit is acquired before fallible preparation. If allocation or quota admission fails, RAII releases it. Once publication succeeds, the mapping record retains it until exact unmap or teardown has invalidated the corresponding translations.

This ordering is the invariant:

```text
acquire writable permit
prepare tables
publish writable mapping
...
remove writable translations
invalidate translation state
release writable permit
```

Releasing the permit when a handle closes would make the count describe the wrong thing. Releasing it before invalidation would open a window where sealing succeeds while writable access is still represented by stale translations.

The kernel does not silently strip another process's mapping to make publication succeed. The caller gets a busy error and can coordinate explicit unmap before retrying.

Once sealed, the VMO rejects byte writes and new RW mappings. Ordinary internal VMO write methods enforce the same state check. Empty writes fail too. Repeating an authorized seal succeeds, but no operation makes the object mutable again.

Old capabilities retain their WRITE bits. Their rights have not been attenuated. The object has entered a state in which writes are no longer permitted.

The comment beside that transition now reads:

```rust
// WRITE bits on old handles are now collector's items.
```

There was an indirect write surface to audit as well. Capability inspection, channel receives and VMO reads all let the kernel copy bytes into user-provided destinations. Those copies use supervisor physical aliases. A writable kernel alias exists even when the user alias is RX.

The existing whole-range user-output preflight requires effective writable user PTEs. Globally correct writable permits guarantee that no writable user mapping survives sealing. Keeping both controls intact means those syscalls cannot use an RX alias to modify sealed backing. Rejected channel receives leave messages and transferred handles queued.

This guarantee covers supported user-controlled mutation. Permanent supervisor RAM aliases remain RW/NX. Arbitrary raw kernel writes and DMA are outside the sealing contract. Calling the physical pages universally immutable would overstate what this implements.

Instruction visibility was another separate boundary.

Writing code through a supervisor alias and installing an executable PTE does not finish the architecture contract. The CPU also needs the appropriate ordering between prior data stores and later instruction fetch.

RISC-V now executes `fence.i` after successful executable range installation and translation invalidation. The existing initial-entry fence covered the first transition into user mode. It could not establish the same guarantee for code installed during a later returning syscall.

x86 uses CPUID leaf zero between compiler fences. That provides an explicit serializing operation before execution through the user alias. The instruction-publication hook lives in the production walkers, so trusted ELF RX installation uses it too.

Failed maps do not reach the hook. RO and RW/NX maps do not need it. After executable leaves commit, publication is infallible and allocation-free.

All of this is local to the one active CPU. Future SMP needs remote instruction synchronization, remote translation invalidation and a migration policy. Parked secondary harts do not establish any of those guarantees.

The execution fixture makes the intended behavior concrete. A producer copies a small relocation-free leaf function into a VMO. A consumer installs a writable alias and closes its handle. The producer still cannot seal. Revoking the child's capability still cannot make sealing succeed.

The consumer explicitly unmaps and acknowledges it. The producer seals, installs RX and calls the function.

17.

An attenuated executable capability goes to the other process, which installs its own RX mapping and calls the same code. Both keep executing through retained mappings after capability closure or revocation.

The producer then prepares a second VMO containing a function that returns 42. It seals that object, unmaps the first function and installs the replacement at the same virtual address. The already-running process calls through that address again.

42.

The kernel checks execution-result messages, successful seal and mapping operations, clean exits and drained records. A warmup and three measured repetitions restore frames, capability nodes, process counts, scheduler state and backing charges.

The test would be much weaker if every execution began with a fresh process. Initial-entry synchronization could conceal a missing publication hook. Replacing code inside an already-running process exercises the boundary the new syscall actually introduces.

## The tests have to notice a defense being removed

The latest local matrix passed 41 RISC-V QEMU cases, 35 x86 UEFI cases and 80 host tests. Release ISO boots exercise the OVMF CD-ROM path. Clippy runs with warnings denied on both kernel targets and the UEFI loader.

Those counts describe different evidence. Host tests can inject allocation failures and inspect page-table publication ordering. QEMU executes the architecture paths. The physical workstation checks a different firmware and hardware environment. Adding the numbers together would obscure what each layer establishes.

The external-payload and first-init releases also distinguish full matrices from focused runs after final fixes. A final successful focused test does not retroactively mean every earlier case ran on that exact revision.

A targeted mutation test deliberately weakened permit handling in a temporary harness, allowing a writable permit to disappear too early.

The regression expected sealing to remain blocked with `-16`. The weakened implementation returned zero. The test failed.

That demonstrates sensitivity to the defense this patch depends on. A suite that stayed green after that change would be missing its central security assertion.

Additional adversarial checks exercised rights subsets, malformed creation options, map permission encodings, failed allocation, alias quotas and final-owner release. Checking the syscall contract also exposed a missing consolidated error-table entry for the new sealing failures. That documentation defect was fixed and rechecked.

On my 32 GiB x86 workstation, the sealing verification image reported 31.46 GiB of managed RAM and reached:

```text
[FERBER_TEST] memory_verification: PASS
[FERBER_TEST] vmo_sealing: PASS
[FERBER_TEST] boot_payload: PASS
```

That marker follows actual RX execution, same-address replacement, cross-process writable-alias checks and repeated reclamation. The banner still said `0.2.12` because the physical run preceded the metadata bump.

The minimal-init image has its own successful physical evidence:

```text
[FERBER_TEST] memory_verification: PASS
[FERBER_TEST] boot_payload: PASS
[FERBER_TEST] init_ready: PASS
[FERBER_TEST] init_waiting: PASS
```

These are separate boot scenarios. Init waiting does not demonstrate executable VMO publication, and the finite sealing fixture does not demonstrate a resident init launching services.

Dedicated protection-fault builds remain QEMU-validated. The sealed-RX-write case requires the exact user origin, faulting instruction, address, hardware cause and retained sealed mapping metadata before printing its marker. Its deliberate halt cannot prove reclamation.

I still have no physical RISC-V hardware. Both architecture paths run in QEMU; physical validation is x86-only. Firmware assumptions and platform behavior on actual RISC-V machines remain a contribution opportunity.

The published ISO continues to boot minimal init. The executable-memory fixture is an explicit verification build. Local test results and hosted CI status remain separate evidence.

## Init still cannot authorize a second process

The remaining distance to useful init is clearer now.

An independently delivered Rust executable can discover its bootstrap authority, complete startup and remain alive. Userspace can allocate bounded backing, fill it, share it, map it, release it and irreversibly publish executable code.

Init still has no process-creation authority. Its bootstrap endpoint connects to a bounded startup session. It cannot use that channel to create a child Job, assemble another process, delegate a service's initial capabilities or admit a new thread.

Exposing those operations is the next lifecycle problem. Failed construction must leave no runnable half-process. Failed delegation must not leak authority. Cancellation must release address spaces, stacks, capability nodes and mapping owners in an order that preserves the same guarantees established here.

A shell also needs a console path and somewhere to obtain executables. The current one-file boot payload has neither a multi-file image nor a filesystem service behind it. Those remain visible work rather than assumptions hidden inside the word `init`.

These remain Uranium-238 prereleases. Version `0.3.0` stays reserved.

Execution is still cooperative, integer-only and single-CPU with interrupts masked. Event-driven idle, preemption, SMP and hierarchical memory charging remain ahead. The new primitives make service launch possible to design against an actual consumer. They do not make that consumer exist automatically.

The repository is [here](https://github.com/notvcto/ferber). The earlier [kernel-core-to-userspace deep dive](https://notvc.to/blog/ferber-kernel-core-to-userspace) covers the scheduler, original ELF checkpoint and the work this week built on.

Closing a handle is easy. Prove that nothing can still write before you call its memory immutable.
