import { create } from 'zustand'
import { getAppManifest } from '@/components/apps/registry'

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
  isMaximized: boolean
}

export interface IconState {
  id: string
  appId: AppID
  label: string
  icon: string // Material Icon name
  x: number
  y: number
  color?: string
  special?: boolean
}

interface SystemState {
  // State
  activeDesktop: number
  windows: Record<string, WindowState>
  icons: IconState[]
  selectedIconIds: string[]
  wallpaper: string // For now just storing index or class
  maxZIndex: number

  // Actions
  spawnWindow: (appId: AppID) => void
  closeWindow: (id: string) => void
  focusWindow: (id: string) => void
  updateWindowPosition: (id: string, x: number, y: number) => void
  switchDesktop: (desktopId: number) => void
  toggleMinimize: (id: string) => void
  toggleMaximize: (id: string) => void

  // Icon Actions
  updateIconPosition: (id: string, x: number, y: number) => void
  moveIcons: (deltaX: number, deltaY: number) => void // Batch move selected
  snapIconsToGrid: () => void
  selectIcons: (ids: string[]) => void
  toggleIconSelection: (id: string) => void
  deselectAllIcons: () => void

  // System Actions
  setWallpaper: (wallpaper: string) => void
}

const GRID_SIZE = 100;

// Align initial icons to new 100px grid + offsets (x:20, y:40)
// Row 0: y=40. Row 1: y=140. Row 2: y=240.
// Col Right (1280 screen): maxCols ~12.
// Let's stick to left alignment for now as that's my current implementation,
// unless I want to implement the right-side fill.
// User didn't explicitly ask for right-side fill, just "copy behavior" (interaction).
// I'll stick to Left fill but correct grid math.
// Left fill: x = 20 + col*100. y = 40 + row*100.
// Icon 1: x=20, y=40.
// Icon 2: x=20, y=140.
// Icon 3: x=20, y=240.
// Icon 4 (Resume): x=120, y=40.

const INITIAL_ICONS: IconState[] = [
  { id: '1', appId: 'projects', label: 'Projects', icon: 'folder', x: 20, y: 40, color: 'blue-accent' },
  { id: '2', appId: 'about', label: 'About Me', icon: 'person', x: 20, y: 140, color: 'primary' },
  { id: '3', appId: 'contact', label: 'Contact', icon: 'alternate_email', x: 20, y: 240, color: 'green-accent' },
  { id: '4', appId: 'resume', label: 'resume.pdf', icon: 'description', x: 120, y: 40, color: 'subtext-dark', special: true },
]

export const useSystemStore = create<SystemState>((set, get) => ({
  activeDesktop: 1,
  windows: {},
  icons: INITIAL_ICONS,
  selectedIconIds: [],
  wallpaper: 'bg-space',
  maxZIndex: 100,

  spawnWindow: (appId) => {
    const state = get()
    const manifest = getAppManifest(appId)

    if (!manifest) {
        console.error(`App manifest not found for ${appId}`)
        return
    }

    // STRICT SINGLETON FOR ALL APPS (Per reference behavior)
    // Check if any window exists with this appId
    const existingWindow = Object.values(state.windows).find(w => w.appId === appId)
    if (existingWindow) {
        // Focus existing
        state.focusWindow(existingWindow.id)
        // Switch desktop if needed
        if (existingWindow.desktopId !== state.activeDesktop) {
            set({ activeDesktop: existingWindow.desktopId })
        }
        return
    }

    const id = Math.random().toString(36).substring(7)
    const zIndex = state.maxZIndex + 1
    const desktopId = state.activeDesktop

    const offset = Object.keys(state.windows).length * 20
    const x = 100 + (offset % 200)
    const y = 100 + (offset % 200)

    const newWindow: WindowState = {
      id,
      appId,
      title: manifest.name,
      desktopId,
      x,
      y,
      width: manifest.defaultSize.width,
      height: manifest.defaultSize.height,
      zIndex,
      isFocused: true,
      isMinimized: false,
      isMaximized: false,
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
          [id]: {
            ...window,
            isMinimized: !window.isMinimized,
            isFocused: !window.isMinimized ? false : true
          },
        },
      }
    })
  },

  toggleMaximize: (id) => {
    set((state) => {
      const window = state.windows[id]
      if (!window) return {}

      return {
        windows: {
          ...state.windows,
          [id]: { ...window, isMaximized: !window.isMaximized },
        },
      }
    })
  },

  updateIconPosition: (id, x, y) => {
    set((state) => ({
      icons: state.icons.map(icon =>
        icon.id === id ? { ...icon, x, y } : icon
      ),
    }))
  },

  moveIcons: (deltaX, deltaY) => {
    set((state) => {
      // Move all selected icons
      const updatedIcons = state.icons.map(icon => {
        if (state.selectedIconIds.includes(icon.id)) {
          return { ...icon, x: icon.x + deltaX, y: icon.y + deltaY }
        }
        return icon
      })
      return { icons: updatedIcons }
    })
  },

  snapIconsToGrid: () => {
    set((state) => {
      const updatedIcons = state.icons.map(icon => {
        if (state.selectedIconIds.includes(icon.id)) {
          // Reference logic:
          // x = Math.round((x - 20) / cellW) * cellW + 20
          // y = Math.round((y - 40) / cellH) * cellH + 40

          let snappedX = Math.round((icon.x - 20) / GRID_SIZE) * GRID_SIZE + 20;
          let snappedY = Math.round((icon.y - 40) / GRID_SIZE) * GRID_SIZE + 40;

          if (snappedX < 20) snappedX = 20;
          if (snappedY < 40) snappedY = 40; // Approx top bar height

          return { ...icon, x: snappedX, y: snappedY }
        }
        return icon
      })
      return { icons: updatedIcons }
    })
  },

  selectIcons: (ids) => {
    set({ selectedIconIds: ids })
  },

  toggleIconSelection: (id) => {
    set((state) => {
      const isSelected = state.selectedIconIds.includes(id)
      if (isSelected) {
        return { selectedIconIds: state.selectedIconIds.filter(i => i !== id) }
      } else {
        return { selectedIconIds: [...state.selectedIconIds, id] }
      }
    })
  },

  deselectAllIcons: () => {
    set({ selectedIconIds: [] })
  },

  setWallpaper: (wallpaper) => {
    set({ wallpaper })
  },
}))
