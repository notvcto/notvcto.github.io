import { useFileSystemStore, FSNode, FileNode, DirNode, resolvePath as resolvePathFromStore } from './store/filesystem';
import { useBlockDeviceStore } from './store/blockDevices';

// --- Helper Functions (Internal) ---

// Helper to resolve relative paths
export const resolveRelativePath = (cwd: string, target: string): string => {
    if (target.startsWith('/')) return target;
    if (target === '~') return '/home/user';

    // Clean cwd
    let base = cwd;
    if (base.endsWith('/')) base = base.slice(0, -1);

    const parts = base.split('/').filter(Boolean);
    const targetParts = target.split('/').filter(Boolean);

    for (const part of targetParts) {
        if (part === '.') continue;
        if (part === '..') {
            parts.pop();
        } else {
            parts.push(part);
        }
    }

    const result = '/' + parts.join('/');
    return result || '/';
};

// Internal resolver using the store's helper but injecting virtual nodes
const resolveNode = (path: string, nodes: Record<string, FSNode>, rootId: string, devices: Record<string, any>): FSNode | null => {
    // 1. Virtual /dev
    if (path === '/dev' || path === '/dev/') {
        return {
            id: 'virtual-dev',
            name: 'dev',
            type: 'dir',
            parent: rootId,
            children: ['dev-sda', 'dev-sda1', 'dev-sr0'],
            createdAt: 0,
            modifiedAt: 0,
        } as DirNode;
    }
    if (path === '/dev/sda') return { id: 'dev-sda', name: 'sda', type: 'file', parent: 'virtual-dev', content: '', createdAt: 0, modifiedAt: 0 } as FileNode;
    if (path === '/dev/sda1') return { id: 'dev-sda1', name: 'sda1', type: 'file', parent: 'virtual-dev', content: '', createdAt: 0, modifiedAt: 0 } as FileNode;
    if (path === '/dev/sr0') return { id: 'dev-sr0', name: 'sr0', type: 'file', parent: 'virtual-dev', content: '', createdAt: 0, modifiedAt: 0 } as FileNode;

    // 2. Virtual CDROM content
    // We assume devices.sr0 exists
    if (devices.sr0 && devices.sr0.mounted && devices.sr0.mountPoint) {
         let mp = devices.sr0.mountPoint; // e.g. /mnt/cdrom
         if (mp.endsWith('/') && mp.length > 1) mp = mp.slice(0, -1);

         if (path === `${mp}/README.txt`) {
             return {
                id: 'virtual-cdrom-readme',
                name: 'README.txt',
                type: 'file',
                parent: 'virtual-cdrom-root', // Placeholder
                content: 'File is encrypted.',
                createdAt: 0,
                modifiedAt: 0
             } as FileNode;
         }
    }

    // 3. Fallback to real store
    return resolvePathFromStore(path, nodes, rootId);
};

const getNodePath = (id: string, nodes: Record<string, FSNode>, rootId: string): string => {
    let current = nodes[id];

    // Handle virtual IDs
    if (id === 'virtual-dev') return '/dev';
    if (id === 'dev-sda') return '/dev/sda';
    if (id === 'dev-sda1') return '/dev/sda1';
    if (id === 'dev-sr0') return '/dev/sr0';
    if (id === 'virtual-cdrom-readme') return '/mnt/cdrom/README.txt'; // Assuming mountpoint /mnt/cdrom

    if (!current) return '';
    if (id === rootId) return '/';

    const parts = [];
    while (current && current.id !== rootId) {
        parts.unshift(current.name);
        if (current.parent) {
            current = nodes[current.parent];
        } else {
            break;
        }
    }
    return '/' + parts.join('/');
}


// --- Canonical FS API ---

export interface FileSystemAPI {
  // Read
  read: (path: string) => string | null;
  list: (path: string) => FSNode[];
  exists: (path: string) => boolean;
  stat: (path: string) => FSNode | null;

  // Write
  write: (path: string, content: string) => void;
  mkdir: (path: string) => void;

  // Lifecycle
  delete: (path: string) => void;
  trash: (path: string) => void;
  restore: (path: string) => void;

  // Management
  move: (fromPath: string, toPath: string) => void;
  rename: (path: string, newName: string) => void;
  updateMetadata: (path: string, metadata: Record<string, any>) => void;

  // Lifecycle
  init: () => void;

  // Utils
  resolve: (path: string) => FSNode | null; // Expose if consumers need node ID
  absolute: (id: string) => string;
}

export function useFS(): FileSystemAPI {
  const {
      nodes,
      rootId,
      init,
      createDir,
      createFile,
      updateFile,
      deleteNode,
      renameNode,
      moveNode,
      updateMetadata
  } = useFileSystemStore();

  const { devices } = useBlockDeviceStore();

  const resolve = (path: string) => resolveNode(path, nodes, rootId, devices);
  const absolute = (id: string) => getNodePath(id, nodes, rootId);

  return {
    // Read
    read: (path: string) => {
        const node = resolve(path);
        if (node && node.type === 'file') return node.content;
        return null;
    },
    list: (path: string) => {
        // Special case for /dev
        if (path === '/dev' || path === '/dev/') {
             return [
                 resolve('/dev/sda'),
                 resolve('/dev/sda1'),
                 resolve('/dev/sr0')
             ].filter(Boolean) as FSNode[];
        }

        // Special case for mounted CDROM
        if (devices.sr0.mounted && devices.sr0.mountPoint) {
            // Remove trailing slash for comparison
            const normalizedPath = path.endsWith('/') && path.length > 1 ? path.slice(0, -1) : path;
            const normalizedMount = devices.sr0.mountPoint.endsWith('/') && devices.sr0.mountPoint.length > 1 ? devices.sr0.mountPoint.slice(0, -1) : devices.sr0.mountPoint;

            if (normalizedPath === normalizedMount) {
                 return [
                     resolve(`${normalizedMount}/README.txt`)
                 ].filter(Boolean) as FSNode[];
            }
        }

        const node = resolve(path);
        if (node && node.type === 'dir') {
            const children = node.children.map(id => nodes[id]).filter(Boolean);

            // Inject /dev if we are at root
            const isRoot = path === '/' || path === '' || node.id === rootId;
            if (isRoot) {
                 if (!children.find(c => c.name === 'dev')) {
                     const devNode = resolve('/dev');
                     if (devNode) children.push(devNode);
                 }
            }
            return children;
        }
        return [];
    },
    exists: (path: string) => {
        return !!resolve(path);
    },
    stat: (path: string) => {
        return resolve(path);
    },

    // Write
    write: (path: string, content: string) => {
        const node = resolve(path);
        if (node && node.type === 'file') {
            // Prevent writing to virtual files
            if (node.id.startsWith('dev-') || node.id.startsWith('virtual-')) return;
            updateFile(node.id, content);
        } else {
            // Create if not exists
            const parts = path.split('/');
            const name = parts.pop();
            const parentPath = parts.join('/') || '/';
            const parent = resolve(parentPath);
            // Prevent creating in virtual dirs (except maybe real subdirs if we mixed them, but /dev is purely virtual)
            if (parent && parent.id.startsWith('virtual-')) return;

            if (parent && parent.type === 'dir' && name) {
                 createFile(parent.id, name, content);
            }
        }
    },
    mkdir: (path: string) => {
        if (resolve(path)) return; // Already exists

        let targetPath = path;
        if (targetPath.endsWith('/')) targetPath = targetPath.slice(0, -1);

        const parts = targetPath.split('/');
        const name = parts.pop();
        const parentPath = parts.join('/') || '/';

        const parent = resolve(parentPath);
        if (parent && parent.id.startsWith('virtual-')) return; // Block virtual

        if (parent && parent.type === 'dir' && name) {
            createDir(parent.id, name);
        } else {
            console.error(`mkdir: cannot create directory '${path}': No such file or directory`);
        }
    },

    // Lifecycle
    delete: (path: string) => {
        const node = resolve(path);
        if (node && !node.id.startsWith('dev-') && !node.id.startsWith('virtual-')) {
             deleteNode(node.id);
        }
    },

    trash: (path: string) => {
        const node = resolve(path);
        if (node && (node.id.startsWith('dev-') || node.id.startsWith('virtual-'))) return; // Can't trash virtual

        const trashDir = resolve('/trash');
        if (node && trashDir && trashDir.type === 'dir') {
            updateMetadata(node.id, { originalParent: node.parent });
            moveNode(node.id, trashDir.id);
        }
    },

    restore: (path: string) => {
        const node = resolve(path);
        if (node) {
            const originalParentId = node.metadata?.originalParent;
            if (originalParentId && nodes[originalParentId] && nodes[originalParentId].type === 'dir') {
                moveNode(node.id, originalParentId);
            } else {
                // Fallback to home
                const home = resolve('/home/user');
                if (home) moveNode(node.id, home.id);
            }
        }
    },

    // Management
    move: (fromPath: string, toPath: string) => {
        const node = resolve(fromPath);
        if (node && (node.id.startsWith('dev-') || node.id.startsWith('virtual-'))) return;

        const targetParent = resolve(toPath);
        if (targetParent && targetParent.id.startsWith('virtual-')) return;

        if (node && targetParent && targetParent.type === 'dir') {
             moveNode(node.id, targetParent.id);
        }
    },

    rename: (path: string, newName: string) => {
        const node = resolve(path);
        if (node && !node.id.startsWith('dev-') && !node.id.startsWith('virtual-')) {
             renameNode(node.id, newName);
        }
    },

    updateMetadata: (path: string, metadata: Record<string, any>) => {
        const node = resolve(path);
        if (node && !node.id.startsWith('dev-') && !node.id.startsWith('virtual-')) {
             updateMetadata(node.id, metadata);
        }
    },

    init,

    // Utils
    resolve,
    absolute
  };
}
