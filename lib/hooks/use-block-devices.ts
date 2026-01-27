import { useEffect, useState, useCallback } from 'react';
import { useBlockDeviceStore } from '@/lib/store/blockDevices';
import { useFileSystemStore, resolvePath } from '@/lib/store/filesystem';
import { useWMStore } from '@/lib/store/wm';
import { useNotificationStore } from '@/lib/store/notifications';

const EPHEMERAL_README_PATH = '/home/user/Desktop/README.txt';
const README_CONTENT = `Welcome.

Something tried to mount.
It didn’t.

Devices don’t always announce themselves.
Some wait.

Hint:
  lsblk
  dmesg | grep -i cd
  mount
`;

export const useBlockDevices = () => {
    const { devices, updateDevice } = useBlockDeviceStore();
    const { createFile, createDir, deleteNode, nodes, rootId, init: initFS } = useFileSystemStore();
    const { openWindow, windows } = useWMStore();
    const { addNotification } = useNotificationStore();

    // Track the window ID we opened for the ephemeral README
    const [readmeWindowId, setReadmeWindowId] = useState<string | null>(null);

    // Watcher for Window Close
    useEffect(() => {
        if (readmeWindowId) {
            // Check if the window is still open
            if (!windows[readmeWindowId]) {
                // Window is gone, clean up

                // 1. Delete file
                // We need to find the node ID.
                // We resolve the parent (Desktop) first.
                const desktopPath = '/home/user/Desktop';
                const desktopNode = resolvePath(desktopPath, nodes, rootId);

                if (desktopNode && desktopNode.type === 'dir') {
                    const readmeId = desktopNode.children.find(childId => nodes[childId]?.name === 'README.txt');
                    if (readmeId) {
                        deleteNode(readmeId);
                    }
                }

                // 2. Update state to armed
                updateDevice('sr0', { state: 'armed' });

                // 3. Stop watching
                setReadmeWindowId(null);
            }
        }
    }, [windows, readmeWindowId, nodes, rootId, deleteNode, updateDevice]);

    // Recovery on Load: If we are in 'post_fail' but no window is tracked (reload happened), clean up.
    useEffect(() => {
        // We defer this slightly to ensure stores are hydrated/initialized
        const timer = setTimeout(() => {
             if (devices.sr0.state === 'post_fail' && !readmeWindowId) {
                // Ensure file is gone
                const desktopNode = resolvePath('/home/user/Desktop', nodes, rootId);
                if (desktopNode && desktopNode.type === 'dir') {
                    const readmeId = desktopNode.children.find(childId => nodes[childId]?.name === 'README.txt');
                    if (readmeId) {
                        deleteNode(readmeId);
                    }
                }
                updateDevice('sr0', { state: 'armed' });
            }
        }, 100);
        return () => clearTimeout(timer);
    }, [devices.sr0.state, readmeWindowId, nodes, rootId, deleteNode, updateDevice]);

    const checkCuriosity = useCallback(async () => {
        const sr0 = useBlockDeviceStore.getState().devices.sr0;

        if (sr0.state === 'probe_failed') {
            // Transition immediately to prevent double trigger
            updateDevice('sr0', { state: 'curiosity_detected' });

            // Wait for dramatic pause
            await new Promise(resolve => setTimeout(resolve, 800));

            // Create README and Open Window
            // Use fresh state to ensure we find Desktop correctly
            const fsState = useFileSystemStore.getState();
            const desktopNode = resolvePath('/home/user/Desktop', fsState.nodes, fsState.rootId);

            if (desktopNode && desktopNode.type === 'dir') {
                fsState.createFile(desktopNode.id, 'README.txt', README_CONTENT);
            }

            const winId = `readme-ephemeral-${Date.now()}`;
            openWindow(winId, 'text-editor', 'README.txt', 'accessories-text-editor', { filePath: EPHEMERAL_README_PATH });

            setReadmeWindowId(winId);
            updateDevice('sr0', { state: 'post_fail' });
        }
    }, [openWindow, updateDevice]);


    const mount = (devPath: string, mountPoint?: string): { success: boolean; error?: string } => {
        const devName = devPath.replace('/dev/', '');
        const device = devices[devName];

        if (!device) {
             return { success: false, error: `mount: ${devPath}: No such device` };
        }

        if (devName === 'sda' || devName === 'sda1') {
             return { success: false, error: `mount: ${devPath} already mounted` };
        }

        if (devName === 'sr0') {
            if (device.state === 'idle') {
                // --- Phase 1: Silent Failure ---
                updateDevice('sr0', { state: 'probe_failed' });

                addNotification({
                    title: 'Mount failed: /dev/sr0',
                    appId: 'system',
                    persistent: false,
                });

                // NO README here. It happens later via checkCuriosity.
                return { success: false, error: `mount: ${devPath}: access denied` };
            }

            if (device.state === 'probe_failed') {
                // If they try to mount AGAIN, that counts as curiosity.
                // We return failure, but trigger the flow.
                checkCuriosity();
                return { success: false, error: `mount: ${devPath}: access denied` };
            }

            if (device.state === 'curiosity_detected' || device.state === 'fail_mount' || device.state === 'post_fail') {
                 return { success: false, error: `mount: ${devPath}: access denied` };
            }

            if (device.state === 'armed') {
                if (!mountPoint) {
                     // Auto-mount attempt (no mountpoint)
                     return { success: false, error: `mount: missing operand` };
                }

                // Ensure mountPoint exists or create it
                // We use fresh state here to avoid stale closures during recursive creation
                const fsState = useFileSystemStore.getState();
                const exists = resolvePath(mountPoint, fsState.nodes, fsState.rootId);

                if (!exists) {
                     // Attempt to create recursively
                     const parts = mountPoint.split('/').filter(Boolean);
                     let currentId = fsState.rootId;

                     for (const part of parts) {
                         // Get fresh state in each iteration
                         const currentFS = useFileSystemStore.getState();
                         const parentNode = currentFS.nodes[currentId];

                         if (parentNode && parentNode.type === 'dir') {
                             const childId = parentNode.children.find(cid => currentFS.nodes[cid]?.name === part);
                             if (childId) {
                                 currentId = childId;
                             } else {
                                 // Create directory
                                 const newId = currentFS.createDir(currentId, part);
                                 currentId = newId;
                             }
                         } else {
                             return { success: false, error: `mount: failed to resolve path for creation` };
                         }
                     }
                } else {
                     if (exists.type !== 'dir') {
                          return { success: false, error: `mount: mount point ${mountPoint} is not a directory` };
                     }
                }

                // Valid manual mount
                updateDevice('sr0', { mounted: true, mountPoint });
                return { success: true };
            }

            // Fallback for fail_mount or other transient states
             return { success: false, error: `mount: ${devPath}: access denied` };
        }

        return { success: false, error: 'Unknown error' };
    };

    return { mount, checkCuriosity };
};
