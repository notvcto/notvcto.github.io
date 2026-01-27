import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface BlockDevice {
  name: string;        // sda, sda1, sr0
  majMin: string;     // e.g. "8:0", "11:0"
  removable: boolean; // RM
  size: string;       // e.g. "238G", "4.3G"
  readOnly: boolean;  // RO
  type: "disk" | "part" | "rom";
  mounted: boolean;
  mountPoint?: string;

  // Puzzle State
  state: "idle" | "probe_failed" | "readme_injected" | "armed";
  mountAttempts: number;
}

interface BlockDeviceState {
  devices: Record<string, BlockDevice>;
  updateDevice: (name: string, partial: Partial<BlockDevice>) => void;
}

export const useBlockDeviceStore = create<BlockDeviceState>()(
  persist(
    (set) => ({
      devices: {
        sda: {
          name: "sda",
          majMin: "8:0",
          removable: false,
          size: "256G",
          readOnly: false,
          type: "disk",
          mounted: true,
          mountPoint: "/",
          state: "idle",
          mountAttempts: 0,
        },
        sda1: {
          name: "sda1",
          majMin: "8:1",
          removable: false,
          size: "255G",
          readOnly: false,
          type: "part",
          mounted: true,
          mountPoint: "/",
          state: "idle",
          mountAttempts: 0,
        },
        sr0: {
          name: "sr0",
          majMin: "11:0",
          removable: true,
          size: "1024M",
          readOnly: true,
          type: "rom",
          mounted: false,
          state: "idle",
          mountAttempts: 0,
        },
      },
      updateDevice: (name, partial) =>
        set((state) => ({
          devices: {
            ...state.devices,
            [name]: { ...state.devices[name], ...partial },
          },
        })),
    }),
    {
      name: "os:blockdevices:v2",
    }
  )
);
