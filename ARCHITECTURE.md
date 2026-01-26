# Architecture Documentation

This document serves as the authoritative explanation of the OS implementation. It describes the current state of the architecture, design decisions, and system boundaries.

## 1. Core Philosophy

*   **Simulation, Not Emulation:** This "OS" is a React-based web application designed to simulate the *experience* of Ubuntu 22.04. It does not emulate hardware (CPU/RAM) or run a real kernel. It mimics the visual interface and behavioral patterns of the desktop environment using standard DOM elements and CSS.
*   **Web-Native:** The system is built entirely on standard web technologies (Next.js, Tailwind CSS, Zustand). It runs client-side with no backend dependency for its core OS operations.
*   **Ephemeral Runtime, Persistent Data:** The goal is to provide a persistent "disk" (Filesystem) while treating the "RAM" (Window state, Running processes) as ephemeral, resetting on reload.

## 2. Filesystem Model (Fake FS)

The filesystem is a virtual object graph managed in-memory and persisted to LocalStorage.

*   **Structure:**
    *   The FS is a flat map of **Nodes** stored in a Zustand store (`lib/store/filesystem.ts`).
    *   Each Node is identified by a UUID.
    *   **Root:** A fixed directory node with ID `root`.
*   **Node Types:**
    *   **File:** Contains `content` (string), `name`, and metadata.
    *   **Directory:** Contains `children` (list of UUIDs).
*   **Persistence:**
    *   The entire node map is persisted to the browser's `localStorage` under the key `os:fs:v1`.
    *   This ensures user-created files and folders survive page reloads.
*   **Special Handling:**
    *   **Trash:** A system directory `/trash` exists to store deleted items. `fs.trash()` moves nodes here and records their `originalParent` in metadata for restoration.
    *   **Executable Markers:** Files ending in `.app` or with `executable: true` are treated as launchable applications by the UI, though they contain no binary code.
    *   **Hidden Files:** Nodes can be marked with `hidden: true` (e.g., `.secrets`), which UI components should respect by filtering them out of views.

## 3. Desktop Model

The Desktop is a specialized view of the `/home/user/Desktop` directory, rendering files as icons on a grid.

*   **Grid System:**
    *   The desktop area is divided into a virtual grid of **100x100 pixels**.
    *   **Top Offset:** A 30px reserved area at the top accounts for the system status bar.
*   **Icon Placement:**
    *   **Manual (Pinned):** Icons with `metadata.position` ({x, y}) are placed at those exact coordinates. Dragging an icon updates this metadata.
    *   **Auto (Reflow):** Icons without position metadata are automatically arranged.
        *   **Origin:** Top-Right corner.
        *   **Flow:** Vertical (Top-to-Bottom), then Horizontal (Right-to-Left).
        *   **Algorithm:** The layout engine (`lib/utils/desktop.ts`) first places all Manual icons to reserve their slots. Then, it fills the remaining available slots with Auto icons, sorted by creation time and name.
*   **Reflow Rules:**
    *   Manual icons are clamped to the visible viewport dimensions to prevent them from becoming unreachable.
    *   Auto placement skips slots occupied by Manual icons.

## 4. Dock / Panel Model

The Sidebar (Dock) acts as the primary launcher and task switcher.

*   **Concept:** It represents the Ubuntu Dock, combining pinned "Favorites" and active "Running Apps".
*   **Visual Structure:**
    1.  **Top Section:**
        *   **Favorites:** Apps defined with `favourite: true` in the registry.
        *   **Running Apps:** Apps with open windows that are *not* favorites appear immediately after the favorites list.
    2.  **Separator:** A visual divider (`hr`-like element).
    3.  **Bottom Section (Volumes):**
        *   Contains special mount points like **CD-ROM** and **Trash**.
        *   These appear visually separated from standard apps to denote they are system volumes or devices.
    4.  **Footer:** The "Show Applications" grid trigger is always pinned to the bottom.
*   **Interaction:**
    *   Clicking an active app icon minimizes or restores its window.
    *   Clicking a closed app icon launches it.

## 5. App Lifecycle

*   **Launch:**
    *   Triggered via `wm.openWindow(appId, ...)`.
    *   The Window Manager checks if the app is a singleton. If it's already running, it focuses the existing window.
    *   Otherwise, it creates a new entry in the `windows` state map.
*   **Window Positioning:**
    *   **First Window:** Centered in the viewport.
    *   **Subsequent Windows:** Offset by `+32px` (x) and `+32px` (y) from the last spawned window.
    *   **Clamping:** Window coordinates are clamped to ensure the top-left corner is always within the viewport (non-negative).
*   **Persistence (The "RAM" Rule):**
    *   **Window state is NOT persisted.**
    *   On page refresh, the `wm` store resets to default. All windows close.
    *   **Reason:** This simplifies state management (avoiding serialization of complex UI components) and reinforces the "session" metaphor.
*   **Refresh Behavior:**
    *   The visual "Boot Screen" may appear briefly (controlled by a `booting_screen` localStorage flag).
    *   The Filesystem loads from storage (files are safe).
    *   The Desktop environment re-initializes.

## 6. Mounts & Special Devices

*   **CD-ROM:**
    *   Currently represented as a **static UI element** in the Dock.
    *   It has no corresponding representation in the `filesystem` store (no `/media/cdrom`).
    *   Clicking it triggers a console log, serving as a placeholder for future media logic.
*   **Trash:**
    *   Implemented as a hybrid:
        *   **FS:** A real directory at `/trash`.
        *   **UI:** A "Volume" icon in the Dock.
    *   **Behavior:** Deleting files via the Desktop moves them to `/trash`. The Dock icon is a shortcut to this location (or a specialized view).
*   **Mounting/Ejecting:**
    *   Concepts of "mounting" are purely visual. There is no kernel-level device management.

## 7. State Boundaries

To maintain clean architecture, strict boundaries are enforced:

*   **Filesystem Store (`lib/store/filesystem.ts`):**
    *   **Responsibility:** The absolute source of truth for file data, folder structure, and file metadata.
    *   **Knowledge:** Knows nothing about Windows, UI positions (stored as generic metadata), or Apps.
*   **Window Manager Store (`lib/store/wm.ts`):**
    *   **Responsibility:** Manages the list of open windows, z-indices, focus, and viewport size.
    *   **Knowledge:** Knows nothing about the Filesystem. It only knows `appId` and `componentProps`.
*   **Desktop / UI Components:**
    *   **Responsibility:** The "Glues" that bind FS and WM.
    *   **Example:** The `Desktop` component listens to the FS store to render icons and listens to the WM store to render windows. It handles the translation of "Double Click on Icon" (UI Event) -> "Read Metadata" (FS) -> "Open Window" (WM).
*   **Apps:**
    *   Apps (e.g., `Terminal`, `FileManager`) are consumers of these stores. They use hooks (`useFS`, `useWMStore`) to interact with the system.

## 8. Non-Goals

The following features are intentionally excluded to maintain scope and simplicity:

*   **Binary Execution:** The system will never execute real binaries (ELF, EXE). `.app` files are semantic markers, not code containers.
*   **Full Shell Emulation:** The Terminal is a command interpreter with a fixed set of hardcoded commands (`ls`, `cd`, `cat`). It is not a POSIX-compliant shell and does not support piping, redirection (`|`, `>`), or scripting.
*   **Multi-User Support:** The system is single-user (`user`). Permission bits (`chmod`) are visual or simplified.
*   **Networking:** There is no simulated network stack. `ping` or `ssh` commands would be visual simulations only.
