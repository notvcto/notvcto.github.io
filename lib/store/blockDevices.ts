import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface BlockDevice {
  id: string;               // e.g. "sr0"
  type: "disk" | "partition" | "cdrom";
  removable: boolean;
  mounted: boolean;
  mountPoint?: string;
  state: "idle" | "probe" | "fail_mount" | "post_fail" | "armed";
}

interface BlockDeviceState {
  devices: Record<string, BlockDevice>;
  updateDevice: (id: string, partial: Partial<BlockDevice>) => void;
}

export const useBlockDeviceStore = create<BlockDeviceState>()(
  persist(
    (set) => ({
      devices: {
        sda: {
          id: "sda",
          type: "disk",
          removable: false,
          mounted: true,
          mountPoint: "/", // logical root
          state: "idle",
        },
        sda1: {
          id: "sda1",
          type: "partition",
          removable: false,
          mounted: true,
          mountPoint: "/",
          state: "idle",
        },
        sr0: {
          id: "sr0",
          type: "cdrom",
          removable: true,
          mounted: false,
          state: "idle",
        },
      },
      updateDevice: (id, partial) =>
        set((state) => ({
          devices: {
            ...state.devices,
            [id]: { ...state.devices[id], ...partial },
          },
        })),
    }),
    {
      name: "os:blockdevices:v1",
    }
  )
);
