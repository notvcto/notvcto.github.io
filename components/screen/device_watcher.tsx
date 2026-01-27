import { useEffect, useState } from 'react';
import { useBlockDeviceStore } from '@/lib/store/blockDevices';
import { useFileSystemStore, resolvePath } from '@/lib/store/filesystem';
import { useWMStore } from '@/lib/store/wm';

export const DeviceWatcher = () => {
    const { devices, updateDevice } = useBlockDeviceStore();
    const { deleteNode } = useFileSystemStore();
    const { windows } = useWMStore();

    // Track the window ID we opened for the ephemeral README
    const [readmeWindowId, setReadmeWindowId] = useState<string | null>(null);

    // Watcher for Window Open (User manually opens README)
    useEffect(() => {
        // If we are in the injected state, wait for user to open README
        if (devices.sr0.state === 'readme_injected' && !readmeWindowId) {
             const foundWin = Object.values(windows).find(w => w.title.includes('README.txt'));
             if (foundWin) {
                 // console.log("[DeviceWatcher] Found README window:", foundWin.id);
                 setReadmeWindowId(foundWin.id);
             }
        }
    }, [windows, devices.sr0.state, readmeWindowId]);

    // Watcher for Window Close
    useEffect(() => {
        if (readmeWindowId) {
            // Check if the window is still open
            if (!windows[readmeWindowId]) {
                // console.log("[DeviceWatcher] README window closed. Cleaning up.");
                // Window is gone, clean up

                // 1. Delete file
                const desktopPath = '/home/user/Desktop';
                const fsState = useFileSystemStore.getState();
                const desktopNode = resolvePath(desktopPath, fsState.nodes, fsState.rootId);

                if (desktopNode && desktopNode.type === 'dir') {
                    const readmeId = desktopNode.children.find(childId => fsState.nodes[childId]?.name === 'README.txt');
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
    }, [windows, readmeWindowId, deleteNode, updateDevice]);

    return null; // This component renders nothing
};
