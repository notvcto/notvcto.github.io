# 📁 Filesystem Audit & Integration Strategy

**Date:** October 26, 2023
**Role:** Systems Engineer
**Subject:** Formalization of Browser-Based Virtual Filesystem

---

## 1. Current Filesystem Explanation

### Storage Layer
*   **Mechanism:** In-memory state management using **Zustand** (`lib/store/filesystem.ts`).
*   **Persistence:** `localStorage` via Zustand's `persist` middleware.
*   **Key:** `os:fs:v1`.
*   **Source of Truth:** The `nodes` object within the Zustand store is the single source of truth. Changes here reactively update the UI.

### Data Model
The filesystem uses a **flat normalized structure** where every node (file or directory) is stored in a dictionary keyed by UUID.

**Structure:**
```ts
interface FSNode {
  id: string;       // UUID
  parent: string | null; // UUID of parent directory
  children: string[];    // Array of child UUIDs (if directory)
  type: "file" | "dir";
  name: string;
  content?: string;      // Only for files
  metadata?: {
    position?: { x: number, y: number }; // For Desktop icons
    [key: string]: any;
  };
  createdAt: number;
  modifiedAt: number;
}
```

*   **Paths:** Paths are not stored directly. They are derived by traversing `parent` pointers up to the `rootId`.
*   **Metadata:** Supports extensible metadata, currently used primarily for preserving Desktop icon positions (`position: {x, y}`).

### Lifecycle
*   **Initialization:** On app load, `useFileSystemStore` rehydrates from `localStorage`.
*   **Boot Check:** An `init()` action checks if the `root` node exists. If missing or corrupted, it resets the FS to a default factory state (creating `/home/user`, `/bin`, `/etc`, etc.).
*   **Reloads:** State is fully persisted. Reloading the browser restores the exact state of the filesystem (files, folders, positions).

---

## 2. Current Integration Map

| Component | Interaction Method | Status | Notes |
| :--- | :--- | :--- | :--- |
| **Terminal** | **Direct Store Access** | ⚠️ **Direct Coupling** | Imports `useFileSystemStore`. Implements `ls`, `cd`, `mkdir`, `touch`, `rm`, `cat` by calling store actions directly. Path resolution logic is partly duplicated/handled via helper `resolvePath`. |
| **File Manager** | **Direct Store Access** | ⚠️ **Direct Coupling** | Reads `nodes` directly. Handles navigation (`cd`) locally. Supports **Read-only** navigation currently (no create/delete/move UI implemented yet). |
| **Desktop** | **Direct Store Access** | ⚠️ **Direct Coupling** | Renders icons based on `nodes`. Writes back icon positions to `node.metadata` after drag operations. Handles selection logic. |
| **Trash** | **Fake Implementation** | 🛑 **CRITICAL FAILURE** | Completely disconnected from the FS. Uses a hardcoded list of "fake" items in `components/apps/trash.js`. Uses a separate `localStorage` key (`trash-empty`) for state. **Does not reflect actual deleted files.** |
| **Gedit** | **Fake Implementation** | ℹ️ **Intentional Mismatch** | Opens a "Contact Me" form instead of a text editor. Does not read/write files. This is a known/accepted portfolio behavior for now. |

---

## 3. Canonical Filesystem Contract

To resolve the tight coupling and inconsistencies, we define a **Canonical Filesystem API**. All components must transition to using this abstraction instead of accessing the Zustand store directly.

**Module:** `lib/fs.ts` (Proposed)

### The API Surface

```ts
/**
 * Canonical Filesystem Interface
 * All paths are absolute strings (e.g., "/home/user/docs/file.txt")
 */
interface FileSystemAPI {
  // Read Operations
  read(path: string): string;
  list(path: string): FSNode[];
  exists(path: string): boolean;
  stat(path: string): FSNodeMetadata;

  // Write Operations
  write(path: string, content: string): void;
  mkdir(path: string): void;

  // Lifecycle Operations
  delete(path: string): void;       // Permanent delete
  trash(path: string): void;        // Soft delete (move to /trash)
  restore(path: string): void;      // Restore from trash

  // Management
  move(fromPath: string, toPath: string): void;
  rename(path: string, newName: string): void;
}
```

### OS Invariants (Non-Negotiable)
1.  **Single Reality:** There is exactly one filesystem. No app may maintain a shadow copy.
2.  **Universal Consistency:** `Terminal rm file.txt` == `File Manager delete` == `Desktop move to trash`.
3.  **Persistence:** All FS mutations persist across reloads.
4.  **Reversibility:** Destructive actions (user-facing) must go to Trash first, unless explicitly bypassed (e.g., `rm -f` or Shift+Delete).
5.  **State Recovery:** Reloading restores files, directories, and icon positions.

---

## 4. Problems Identified

### 🛑 Critical Inconsistency: Trash
*   **Issue:** The Trash app is a visual mock-up. It does not display files deleted from the system.
*   **Impact:** Users cannot restore files. "Deleting" a file in Terminal currently destroys it forever (via `deleteNode`), while the Trash app shows unrelated fake data.
*   **Violation:** Breaks "Single Reality" and "Reversibility" invariants.

### ⚠️ Direct Store Coupling
*   **Issue:** Components (`Terminal`, `Desktop`, `FileManager`) import `useFileSystemStore` and manipulate `nodes` directly.
*   **Impact:** Logic for path resolution and error handling is scattered. Refactoring the store shape would break all apps.

### ℹ️ Intentional UX Mismatch: Gedit
*   **Issue:** Gedit is registered as a text editor but opens a Contact Form.
*   **Status:** **Accepted**. This is a portfolio-specific design choice. It will be documented but not fixed in this audit.

### ⚠️ Missing Features in File Manager
*   **Issue:** File Manager is effectively a "File Viewer". It lacks UI for creating folders, deleting items, or moving files (drag & drop).

---

## 5. Recommended Changes

### Step A: Implement Canonical API Wrapper
Create `lib/fs.ts` (or `hooks/useFS.ts`) that wraps `useFileSystemStore`.
*   Implement `resolvePath` logic centrally.
*   Expose standard POSIX-like methods (`read`, `write`, `mkdir`, `rm`).

### Step B: Refactor Trash (Priority High)
1.  **Backend:** Ensure a `/trash` directory exists in the FS root.
2.  **Action:** Update the API's `trash(path)` method to **move** the node to `/trash` and store its `originalParent` in metadata.
3.  **App:** Rewrite `components/apps/trash.js` to read children of `/trash` from the real FS.
4.  **Cleanup:** Remove the hardcoded `trashItems` array and the `trash-empty` localStorage key.

### Step C: Update Consumers
1.  **Terminal:** Update `rm` command to use `fs.trash()` by default (or `fs.delete` if forced).
2.  **Desktop:** Update icon deletion to use `fs.trash()`.
3.  **File Manager:** (Future) Add Context Menu with "Move to Trash".

---

**Audit Status:** COMPLETE
**Next Action:** Approval to begin Step A (API Implementation).
