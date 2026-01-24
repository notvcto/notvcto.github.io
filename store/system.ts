import { create } from 'zustand'

export type AppID = 'terminal' | 'about' | 'projects' | 'contact' | 'blog' | 'resume'

export interface WindowState {
  id: string
  appId: AppID
  title: string
  desktopId: number
  x: number
  y: number
  width: number
  height: number
  zIndex: number
  isFocused: boolean
  isMinimized: boolean
}

interface SystemState {
  // State
  activeDesktop: number
  windows: Record<string, WindowState>
  maxZIndex: number

  // Actions
  spawnWindow: (appId: AppID) => void
  closeWindow: (id: string) => void
  focusWindow: (id: string) => void
  updateWindowPosition: (id: string, x: number, y: number) => void
  switchDesktop: (desktopId: number) => void
  toggleMinimize: (id: string) => void
}

export const useSystemStore = create<SystemState>((set, get) => ({
  activeDesktop: 1,
  windows: {},
  maxZIndex: 100,

  spawnWindow: (appId) => {
    const state = get()
    const id = Math.random().toString(36).substring(7)
    const zIndex = state.maxZIndex + 1
    const desktopId = state.activeDesktop

    // Default window sizing and positioning
    // We can randomize position slightly to avoid perfect overlap
    const offset = Object.keys(state.windows).length * 20
    const x = 100 + (offset % 200)
    const y = 100 + (offset % 200)

    const newWindow: WindowState = {
      id,
      appId,
      title: appId.charAt(0).toUpperCase() + appId.slice(1), // Simple title gen
      desktopId,
      x,
      y,
      width: 600,
      height: 400,
      zIndex,
      isFocused: true,
      isMinimized: false,
    }

    // Unfocus all other windows
    const updatedWindows = { ...state.windows }
    Object.keys(updatedWindows).forEach((key) => {
      updatedWindows[key] = { ...updatedWindows[key], isFocused: false }
    })

    set({
      windows: { ...updatedWindows, [id]: newWindow },
      maxZIndex: zIndex,
    })
  },

  closeWindow: (id) => {
    set((state) => {
      const { [id]: _removed, ...rest } = state.windows
      return { windows: rest }
    })
  },

  focusWindow: (id) => {
    set((state) => {
      if (state.windows[id].isFocused && state.windows[id].zIndex === state.maxZIndex) {
        return {} // Already focused and on top
      }

      const newZIndex = state.maxZIndex + 1
      const updatedWindows = { ...state.windows }

      // Unfocus others
      Object.keys(updatedWindows).forEach((key) => {
        updatedWindows[key] = { ...updatedWindows[key], isFocused: false }
      })

      // Focus target
      if (updatedWindows[id]) {
        updatedWindows[id] = {
          ...updatedWindows[id],
          isFocused: true,
          zIndex: newZIndex,
          isMinimized: false // Auto restore if minimized
        }
      }

      return {
        windows: updatedWindows,
        maxZIndex: newZIndex,
      }
    })
  },

  updateWindowPosition: (id, x, y) => {
    set((state) => ({
      windows: {
        ...state.windows,
        [id]: { ...state.windows[id], x, y },
      },
    }))
  },

  switchDesktop: (desktopId) => {
    set({ activeDesktop: desktopId })
  },

  toggleMinimize: (id) => {
    set((state) => {
      const window = state.windows[id]
      if (!window) return {}

      return {
        windows: {
          ...state.windows,
          [id]: { ...window, isMinimized: !window.isMinimized, isFocused: !window.isMinimized ? false : true },
        },
      }
    })
  },
}))
