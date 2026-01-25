import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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

  setLocked: (locked: boolean) => void;
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

export const useWMStore = create<WMState>()(
  persist(
    (set, get) => ({
      windows: {},
      focusedWindowId: null,
      nextZIndex: 100,
      isLocked: false, // Default unlocked, or true if we want to start locked

      setLocked: (locked) => set({ isLocked: locked }),

      openWindow: (id, appId, title, icon, componentProps = {}) => {
        const { windows, nextZIndex } = get();

        // If window exists, focus it (even if we called open, this acts as "ensure open")
        if (windows[id]) {
            get().focusWindow(id);
            return;
        }

        const newWindow: WindowState = {
          id,
          appId,
          title,
          icon,
          minimized: false,
          maximized: false,
          zIndex: nextZIndex,
          componentProps,
          // Default position/size can be handled by the Window component or explicit values here
          // We leave them undefined to let the component/default logic handle centering
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
            // Focus another window if the closed one was focused?
            // Simple logic: just null, user clicks another.
            // Better logic: find highest Z-index
            return { windows: remainingWindows, focusedWindowId: state.focusedWindowId === id ? null : state.focusedWindowId };
        });
      },

      focusWindow: (id) => {
        set((state) => {
          const window = state.windows[id];
          if (!window) return {};

          if (state.focusedWindowId === id && !window.minimized) {
              // Already focused and not minimized, do nothing (or bring to front if zIndex is low? verify)
              // We should always bump Z-index to be sure.
          }

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
        // Restore is same as focus usually, but explicit action if needed
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
                      [id]: { ...window, x, y }
                  }
              }
          })
      },

      updateWindowSize: (id, width, height) => {
           set((state) => {
              const window = state.windows[id];
              if (!window) return {};
              return {
                  windows: {
                      ...state.windows,
                      [id]: { ...window, width, height }
                  }
              }
          })
      }
    }),
    {
      name: 'os:wm:v1',
    }
  )
);
