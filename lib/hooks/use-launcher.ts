import { useFS } from "@/lib/fs";
import { useWMStore } from "@/lib/store/wm";
import { getAppForFile } from "@/lib/utils/associations";

export const useLauncher = () => {
    const fs = useFS();
    const { openWindow } = useWMStore();

    const open = async (pathOrId: string) => {
        // Dynamic import to avoid circular dependency with registry -> app -> useLauncher -> registry
        const { apps: appRegistry } = await import("@/components/apps/registry");

        let path = pathOrId;
        // If not absolute path, assume it's an ID and resolve it
        if (!path.startsWith('/')) {
             path = fs.absolute(pathOrId);
        }

        if (!path || !fs.exists(path)) {
            console.error(`Cannot open: ${pathOrId}`);
            return;
        }

        const node = fs.stat(path);
        if (!node) return;

        // 1. Directory -> File Manager
        if (node.type === 'dir') {
             const fmApp = appRegistry['file-manager'];
             if (fmApp) {
                 // Open File Manager at specific path
                 // Note: FileManager needs to be updated to accept initialCwd
                 openWindow('file-manager', 'file-manager', fmApp.name, fmApp.icon, { initialCwd: path });
             }
             return;
        }

        // 2. App Bundle (.app) -> Launch App
        if (node.name.endsWith('.app')) {
             const appName = node.name.replace('.app', '');
             const foundApp = Object.values(appRegistry).find(app => app.id === appName || app.name === appName);

             if (foundApp) {
                 const windowId = foundApp.singleton ? foundApp.id : `${foundApp.id}-${Date.now()}`;
                 openWindow(windowId, foundApp.id, foundApp.name, foundApp.icon);
             } else {
                 console.warn(`App ${appName} not found`);
             }
             return;
        }

        // 3. File Association -> Launch App with File
        const appId = getAppForFile(node.name);
        if (appId) {
            const app = appRegistry[appId];
            if (app) {
                // Use path as part of ID to allow multiple files, but singleton per file
                const windowId = `${app.id}-${path}`;
                openWindow(windowId, app.id, `${app.name} - ${node.name}`, app.icon, { filePath: path });
            } else {
                console.warn(`App ${appId} not registered`);
            }
            return;
        }

        // 4. Unknown File Type
        console.warn(`No app associated with file: ${node.name}`);
    };

    return { open };
};
