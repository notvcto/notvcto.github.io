import { useCallback } from 'react';
import { useBlockDeviceStore } from '@/lib/store/blockDevices';
import { useFileSystemStore, resolvePath } from '@/lib/store/filesystem';
import { useNotificationStore } from '@/lib/store/notifications';

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
    const { addNotification } = useNotificationStore();

    const injectReadme = useCallback(async () => {
        const sr0 = useBlockDeviceStore.getState().devices.sr0;

        // Only inject if we haven't already
        if (sr0.state !== 'readme_injected' && sr0.state !== 'armed') {
             // Use fresh state
            const fsState = useFileSystemStore.getState();
            const desktopNode = resolvePath('/home/user/Desktop', fsState.nodes, fsState.rootId);

            if (desktopNode && desktopNode.type === 'dir') {
                // Check if exists first to avoid dupes/errors
                const existing = desktopNode.children.find(id => fsState.nodes[id]?.name === 'README.txt');
                if (!existing) {
                    fsState.createFile(desktopNode.id, 'README.txt', README_CONTENT);
                }
            }

            updateDevice('sr0', { state: 'readme_injected' });
        }
    }, [updateDevice]);

    const checkCuriosity = useCallback(() => {
        const sr0 = useBlockDeviceStore.getState().devices.sr0;

        // If we have failed at least once (attempts >= 1)
        // trigger the injection.
        if (sr0.mountAttempts >= 1 && sr0.state === 'probe_failed') {
            injectReadme();
        }
    }, [injectReadme]);


    const mount = (devPath: string, mountPoint?: string, source: 'ui' | 'terminal' = 'terminal'): { success: boolean; error?: string } => {
        const devName = devPath.replace('/dev/', '');
        const device = devices[devName];

        if (!device) {
             return { success: false, error: `mount: ${devPath}: No such device` };
        }

        if (devName === 'sda' || devName === 'sda1') {
             return { success: false, error: `mount: ${devPath} already mounted` };
        }

        if (devName === 'sr0') {
            if (device.mounted) return { success: true };

            if (device.state === 'armed') {
                // Logic change: If triggered from UI, deny and hint
                if (source === 'ui') {
                     addNotification({
                        title: 'Device Ready',
                        body: 'Please mount via terminal: mount /dev/sr0 /mnt/cdrom',
                        appId: 'system',
                        persistent: false,
                    });
                    return { success: false, error: 'Device ready. Use terminal to mount.' };
                }

                // If armed and terminal, proceed to mount
                if (!mountPoint) {
                    return { success: false, error: `mount: missing operand` };
                }

                // Ensure mountPoint exists or create it
                const fsState = useFileSystemStore.getState();
                const exists = resolvePath(mountPoint, fsState.nodes, fsState.rootId);

                if (!exists) {
                     // Attempt to create recursively
                     const parts = mountPoint.split('/').filter(Boolean);
                     let currentId = fsState.rootId;

                     for (const part of parts) {
                         const currentFS = useFileSystemStore.getState();
                         const parentNode = currentFS.nodes[currentId];

                         if (parentNode && parentNode.type === 'dir') {
                             const childId = parentNode.children.find(cid => currentFS.nodes[cid]?.name === part);
                             if (childId) {
                                 currentId = childId;
                             } else {
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

                updateDevice('sr0', { mounted: true, mountPoint });
                return { success: true };
            }

            // Not Armed -> Logic
            // Increment attempts
            const newAttempts = (device.mountAttempts || 0) + 1;
            updateDevice('sr0', { mountAttempts: newAttempts });

            addNotification({
                title: 'Failed to mount CD-ROM',
                body: 'mount: /dev/sr0: access denied',
                appId: 'system',
                persistent: false,
            });

            if (newAttempts === 1) {
                 updateDevice('sr0', { state: 'probe_failed' });
            } else if (newAttempts >= 2) {
                 // Trigger Injection
                 injectReadme();
            }

            return { success: false, error: `mount: ${devPath}: access denied` };
        }

        return { success: false, error: 'Unknown error' };
    };

    return { mount, checkCuriosity };
};
