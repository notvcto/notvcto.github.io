import { useFileSystemStore, FSNode, FileNode, DirNode } from './store/filesystem';

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

// Resolve path string to a Node ID
// Note: We accept nodes and rootId as arguments to keep this pure,
// or we can use the store state if we want to bind it.
// For `useFS`, we will pass the current store state.
const resolvePathToNode = (path: string, nodes: Record<string, FSNode>, rootId: string): FSNode | null => {
  if (path === '/') return nodes[rootId];

  // Remove trailing slash
  if (path.length > 1 && path.endsWith('/')) {
      path = path.slice(0, -1);
  }

  // Handle absolute paths only for now (or assume relative paths are resolved before calling this if needed)
  // But standard is absolute.
  if (!path.startsWith('/')) {
      // In a real FS, we would resolve against CWD.
      // For now, we assume absolute paths or relative from root if missing leading slash (bad practice but handleable).
      // But let's enforce absolute.
      // However, typical usage might pass relative paths if we don't track CWD here.
      // The consumers (Terminal) track CWD. They should resolve path before calling API.
      // So we assume path is absolute.
  }

  const parts = path.split('/').filter(Boolean);
  let current: FSNode = nodes[rootId];

  if (!current) return null; // Safety

  for (const part of parts) {
    if (current.type !== 'dir') return null;
    const foundId = (current as DirNode).children.find(childId => nodes[childId]?.name === part);
    if (!foundId) return null;
    current = nodes[foundId];
  }

  return current;
};

const getNodePath = (id: string, nodes: Record<string, FSNode>, rootId: string): string => {
    let current = nodes[id];
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

  const resolve = (path: string) => resolvePathToNode(path, nodes, rootId);
  const absolute = (id: string) => getNodePath(id, nodes, rootId);

  return {
    // Read
    read: (path: string) => {
        const node = resolve(path);
        if (node && node.type === 'file') return node.content;
        return null;
    },
    list: (path: string) => {
        const node = resolve(path);
        if (node && node.type === 'dir') {
            return node.children.map(id => nodes[id]).filter(Boolean);
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
            updateFile(node.id, content);
        } else {
            // Create if not exists? Standard 'write' usually overwrites or creates.
            // Split path to parent + name
            const parts = path.split('/');
            const name = parts.pop();
            const parentPath = parts.join('/') || '/';
            const parent = resolve(parentPath);
            if (parent && parent.type === 'dir' && name) {
                 createFile(parent.id, name, content);
            }
        }
    },
    mkdir: (path: string) => {
        if (resolve(path)) return; // Already exists

        // Find parent
        // For simplicity, we assume parent exists (no recursive mkdir -p yet unless we want it)
        // Let's implement non-recursive first as per store capabilities.
        // But users might expect 'mkdir /home/user/new/folder'

        let targetPath = path;
        if (targetPath.endsWith('/')) targetPath = targetPath.slice(0, -1);

        const parts = targetPath.split('/');
        const name = parts.pop();
        const parentPath = parts.join('/') || '/'; // if path was /foo, parent is /

        const parent = resolve(parentPath);
        if (parent && parent.type === 'dir' && name) {
            createDir(parent.id, name);
        } else {
            console.error(`mkdir: cannot create directory '${path}': No such file or directory`);
        }
    },

    // Lifecycle
    delete: (path: string) => {
        const node = resolve(path);
        if (node) deleteNode(node.id);
    },

    trash: (path: string) => {
        const node = resolve(path);
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
        const targetParent = resolve(toPath); // Assuming toPath is the *directory* to move into?
        // Or is toPath the new full path?
        // Standard `mv src dest` -> if dest is dir, move inside. If dest is file/newname, rename/move.

        // Let's assume toPath is the TARGET DIRECTORY for now, matching `moveNode` store signature (id, newParentId)
        // But `fs.move(from, to)` usually implies full path.

        if (node && targetParent && targetParent.type === 'dir') {
             moveNode(node.id, targetParent.id);
        }
    },

    rename: (path: string, newName: string) => {
        const node = resolve(path);
        if (node) renameNode(node.id, newName);
    },

    updateMetadata: (path: string, metadata: Record<string, any>) => {
        const node = resolve(path);
        if (node) updateMetadata(node.id, metadata);
    },

    init,

    // Utils
    resolve,
    absolute
  };
}
