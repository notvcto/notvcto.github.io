# Verification Checklist

## Core Systems
- [x] **Window Manager**:
    - Windows are objects in Zustand store.
    - Dragging works via `WindowFrame` pointer events.
    - Focus brings to front (z-index).
    - Close and Minimize buttons updates state.
- [x] **Virtual Desktops**:
    - `activeDesktop` in store.
    - `switchDesktop` action.
    - TopBar indicators reflect state.
    - `WindowManager` filters by desktop.
- [x] **Desktop**:
    - Icons render and spawn windows.
    - Layout matches reference.
- [x] **Apps**:
    - Registry maps IDs to components.
    - Terminal: functional input/history.
    - About/Projects: static content implemented.

## Tech Stack & Config
- [x] Next.js App Router used.
- [x] TypeScript enabled and strict.
- [x] Tailwind CSS configured with Catppuccin tokens.
- [x] `output: 'export'` for GitHub Pages.
- [x] No `pages/` directory.

## Visuals
- [x] Dark mode only.
- [x] No glassmorphism (except where specified in reference, e.g. topbar transparency).
- [x] Material Icons via CDN.
