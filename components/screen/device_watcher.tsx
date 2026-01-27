import { useEffect, useState } from 'react';
import { useBlockDeviceStore } from '@/lib/store/blockDevices';
import { useFileSystemStore, resolvePath } from '@/lib/store/filesystem';
import { useWMStore } from '@/lib/store/wm';

export const DeviceWatcher = () => {
    const { devices, updateDevice } = useBlockDeviceStore();
    const { deleteNode } = useFileSystemStore();
    const { windows, focusedWindowId, closeWindow } = useWMStore();

    // Track the window ID we opened for the ephemeral README
    const [readmeWindowId, setReadmeWindowId] = useState<string | null>(null);

    // Watcher for Window Open (User manually opens README)
    useEffect(() => {
        // If we are in the injected state, wait for user to open README
        if (devices.sr0.state === 'readme_injected' && !readmeWindowId) {
             const foundWin = Object.values(windows).find(w => w.title.includes('README.txt'));
             if (foundWin) {
                 setReadmeWindowId(foundWin.id);
             }
        }
    }, [windows, devices.sr0.state, readmeWindowId]);

    // Watcher for Window Close OR Lost Focus
    useEffect(() => {
        if (readmeWindowId) {
            // Check if the window is still open AND focused
            // If it is NOT focused (and another window/desktop is), OR if it's gone entirely.
            // Note: When opening, focusedWindowId might take a tick to update?
            // But we only set readmeWindowId when we find the window in 'windows'.
            // Usually openWindow sets focus.
            // If focusedWindowId is null/undefined, it means desktop is focused usually?

            const isWindowOpen = !!windows[readmeWindowId];
            const isWindowFocused = focusedWindowId === readmeWindowId;

            if (!isWindowOpen || !isWindowFocused) {
                // Window is gone or lost focus -> Cleanup

                // 1. Force close the window if it's still open (visual cleanup for "lost focus")
                if (isWindowOpen) {
                    closeWindow(readmeWindowId);
                }

                // 2. Delete file
                const desktopPath = '/home/user/Desktop';
                const fsState = useFileSystemStore.getState();
                const desktopNode = resolvePath(desktopPath, fsState.nodes, fsState.rootId);

                if (desktopNode && desktopNode.type === 'dir') {
                    const readmeId = desktopNode.children.find(childId => fsState.nodes[childId]?.name === 'README.txt');
                    if (readmeId) {
                        deleteNode(readmeId);
                    }
                }

                // 3. Update state to armed
                updateDevice('sr0', { state: 'armed' });

                // 4. Stop watching
                setReadmeWindowId(null);
            }
        }
    }, [windows, focusedWindowId, readmeWindowId, deleteNode, updateDevice, closeWindow]);

    return null; // This component renders nothing
};
