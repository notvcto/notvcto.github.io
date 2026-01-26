import { create } from 'zustand';

export interface WindowState {
  id: string;
  appId: string;
  title: string;
  icon: string;
  minimized: boolean;
  maximized: boolean;
  zIndex: number;
  componentProps?: Record<string, any>;
  width?: number;
  height?: number;
  x?: number;
  y?: number;
}

interface WMState {
  windows: Record<string, WindowState>;
  focusedWindowId: string | null;
  nextZIndex: number;
  isLocked: boolean;
  viewportSize: { width: number; height: number };
  lastSpawnPosition: { x: number; y: number } | null;

  setLocked: (locked: boolean) => void;
  updateViewportSize: (width: number, height: number) => void;
  openWindow: (
    id: string,
    appId: string,
    title: string,
    icon: string,
    componentProps?: Record<string, any>
  ) => void;
  closeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  restoreWindow: (id: string) => void;
  toggleMaximize: (id: string) => void;
  updateWindowPosition: (id: string, x: number, y: number) => void;
  updateWindowSize: (id: string, width: number, height: number) => void;
}

export const useWMStore = create<WMState>()((set, get) => ({
  windows: {},
  focusedWindowId: null,
  nextZIndex: 100,
  isLocked: false,
  viewportSize: { width: 0, height: 0 },
  lastSpawnPosition: null,

  setLocked: (locked) => set({ isLocked: locked }),

  updateViewportSize: (width, height) => set({ viewportSize: { width, height } }),

  openWindow: (id, appId, title, icon, componentProps = {}) => {
    const { windows, nextZIndex, viewportSize, lastSpawnPosition } = get();

    // If window exists, focus it
    if (windows[id]) {
      get().focusWindow(id);
      return;
    }

    // Calculate Position
    let x = 0;
    let y = 0;

    const vpW = viewportSize.width || 1024; // Fallback if 0
    const vpH = viewportSize.height || 768;

    // Use logic matching Window.tsx defaults to estimate size
    const isMobile = vpW < 640;
    const widthPct = isMobile ? 0.85 : 0.60;
    const heightPct = isMobile ? 0.60 : 0.85;

    const winW = vpW * widthPct;
    const winH = vpH * heightPct;

    const hasWindows = Object.keys(windows).length > 0;

    if (lastSpawnPosition && hasWindows) {
      // Offset logic
      x = lastSpawnPosition.x + 32;
      y = lastSpawnPosition.y + 32;

      // Check constraints (ensure not pushing off-screen)
      // We check if the Top-Left + Size > Viewport
      if (x + winW > vpW || y + winH > vpH) {
        // Reset to center
        x = (vpW - winW) / 2;
        y = (vpH - winH) / 2;
      }
    } else {
      // Center logic (First window or reset)
      x = (vpW - winW) / 2;
      y = (vpH - winH) / 2;
    }

    // Hard clamp to ensure top-left is never negative
    x = Math.max(0, x);
    y = Math.max(0, y);

    // Update last spawn position
    set({ lastSpawnPosition: { x, y } });

    const newWindow: WindowState = {
      id,
      appId,
      title,
      icon,
      minimized: false,
      maximized: false,
      zIndex: nextZIndex,
      componentProps,
      width: winW,
      height: winH,
      x,
      y,
    };

    set({
      windows: { ...windows, [id]: newWindow },
      focusedWindowId: id,
      nextZIndex: nextZIndex + 1,
    });
  },

  closeWindow: (id) => {
    set((state) => {
      const { [id]: _, ...remainingWindows } = state.windows;

      const remainingCount = Object.keys(remainingWindows).length;

      return {
        windows: remainingWindows,
        focusedWindowId: state.focusedWindowId === id ? null : state.focusedWindowId,
        // Reset offset tracker if all windows are closed
        lastSpawnPosition: remainingCount === 0 ? null : state.lastSpawnPosition
      };
    });
  },

  focusWindow: (id) => {
    set((state) => {
      const window = state.windows[id];
      if (!window) return {};

      return {
        focusedWindowId: id,
        nextZIndex: state.nextZIndex + 1,
        windows: {
          ...state.windows,
          [id]: { ...window, zIndex: state.nextZIndex, minimized: false },
        },
      };
    });
  },

  minimizeWindow: (id) => {
    set((state) => {
      const window = state.windows[id];
      if (!window) return {};
      return {
        focusedWindowId: state.focusedWindowId === id ? null : state.focusedWindowId,
        windows: {
          ...state.windows,
          [id]: { ...window, minimized: true },
        },
      };
    });
  },

  restoreWindow: (id) => {
    get().focusWindow(id);
  },

  toggleMaximize: (id) => {
    set((state) => {
      const window = state.windows[id];
      if (!window) return {};
      return {
        windows: {
          ...state.windows,
          [id]: { ...window, maximized: !window.maximized },
        },
      };
    });
  },

  updateWindowPosition: (id, x, y) => {
    set((state) => {
      const window = state.windows[id];
      if (!window) return {};
      return {
        windows: {
          ...state.windows,
          [id]: { ...window, x, y },
        },
      };
    });
  },

  updateWindowSize: (id, width, height) => {
    set((state) => {
      const window = state.windows[id];
      if (!window) return {};
      return {
        windows: {
          ...state.windows,
          [id]: { ...window, width, height },
        },
      };
    });
  },
}));
