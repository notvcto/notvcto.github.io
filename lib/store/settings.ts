import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  wallpaper: string;
  accentColor: string;
  darkMode: boolean;
  volume: number;
  brightness: number;

  setWallpaper: (image: string) => void;
  setAccentColor: (color: string) => void;
  setDarkMode: (enabled: boolean) => void;
  setVolume: (level: number) => void;
  setBrightness: (level: number) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      wallpaper: "questing-quokka",
      accentColor: "#E95420",
      darkMode: true,
      volume: 75,
      brightness: 100,

      setWallpaper: (wallpaper) => set({ wallpaper }),
      setAccentColor: (accentColor) => set({ accentColor }),
      setDarkMode: (darkMode) => set({ darkMode }),
      setVolume: (volume) => set({ volume }),
      setBrightness: (brightness) => set({ brightness }),
    }),
    {
      name: 'os:settings:v1',
    }
  )
);
