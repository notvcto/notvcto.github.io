import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

export type FSNodeType = "file" | "dir";

export interface FSNodeBase {
  id: string;
  name: string;
  type: FSNodeType;
  parent: string | null;
  createdAt: number;
  modifiedAt: number;
  hidden?: boolean;
  metadata?: Record<string, any>;
}

export interface FileNode extends FSNodeBase {
  type: "file";
  content: string;
  executable?: boolean;
}

export interface DirNode extends FSNodeBase {
  type: "dir";
  children: string[];
}

export type FSNode = FileNode | DirNode;

interface FileSystemState {
  rootId: string;
  nodes: Record<string, FSNode>;

  // Actions
  init: () => void;
  createFile: (parentId: string, name: string, content?: string, opts?: Partial<FileNode>) => string;
  createDir: (parentId: string, name: string, opts?: Partial<DirNode>) => string;
  deleteNode: (id: string) => void;
  updateFile: (id: string, content: string) => void;
  renameNode: (id: string, newName: string) => void;
  moveNode: (id: string, newParentId: string) => void;
  updateMetadata: (id: string, metadata: Record<string, any>) => void;
}

const INITIAL_ROOT_ID = 'root';

const createDefaultState = (): { rootId: string; nodes: Record<string, FSNode> } => {
  const now = Date.now();
  const root: DirNode = {
    id: INITIAL_ROOT_ID,
    name: '',
    type: 'dir',
    parent: null,
    children: [],
    createdAt: now,
    modifiedAt: now,
  };

  const nodes: Record<string, FSNode> = { [INITIAL_ROOT_ID]: root };

  const mkdir = (parent: string, name: string): string => {
    const id = uuidv4();
    const node: DirNode = {
      id,
      name,
      type: 'dir',
      parent,
      children: [],
      createdAt: now,
      modifiedAt: now,
    };
    nodes[id] = node;
    (nodes[parent] as DirNode).children.push(id);
    return id;
  };

  const touch = (parent: string, name: string, content = '', opts: Partial<FileNode> = {}): string => {
    const id = uuidv4();
    const node: FileNode = {
      id,
      name,
      type: 'file',
      parent,
      content,
      createdAt: now,
      modifiedAt: now,
      ...opts,
    };
    nodes[id] = node;
    (nodes[parent] as DirNode).children.push(id);
    return id;
  };

  // Build Default Layout
  // /home/user/Desktop
  const home = mkdir(INITIAL_ROOT_ID, 'home');
  const user = mkdir(home, 'user');
  const desktop = mkdir(user, 'Desktop');
  const documents = mkdir(user, 'Documents');
  const downloads = mkdir(user, 'Downloads');
  const secrets = mkdir(user, '.secrets');
  (nodes[secrets] as DirNode).hidden = true;

  // Desktop Apps
  // In a real scenario, the content might be a pointer or empty for system apps
  touch(desktop, 'about-vcto.app', '', { executable: true });
  touch(desktop, 'trash.app', '', { executable: true });

  // /bin
  const bin = mkdir(INITIAL_ROOT_ID, 'bin');
  ['ls', 'cat', 'cd', 'rm', 'sudo', 'neofetch'].forEach(cmd => {
    touch(bin, cmd, '', { executable: true });
  });

  // /etc
  const etc = mkdir(INITIAL_ROOT_ID, 'etc');
  touch(etc, 'os.conf', '# System Configuration\nHOST=ubuntu\nUSER=user');

  // /trash
  mkdir(INITIAL_ROOT_ID, 'trash');

  return { rootId: INITIAL_ROOT_ID, nodes };
};

export const useFileSystemStore = create<FileSystemState>()(
  persist(
    (set, get) => ({
      ...createDefaultState(),

      init: () => {
        // Here we could validate that the loaded state is valid (e.g. root exists)
        const state = get();
        if (!state.nodes[state.rootId]) {
            console.warn("Root missing, resetting FS");
            set(createDefaultState());
        }
      },

      createFile: (parentId, name, content = '', opts = {}) => {
        const id = uuidv4();
        const now = Date.now();
        set(state => {
          const parent = state.nodes[parentId];
          if (!parent || parent.type !== 'dir') throw new Error('Invalid parent');

          const newNode: FileNode = {
            id,
            name,
            type: 'file',
            parent: parentId,
            content,
            createdAt: now,
            modifiedAt: now,
            ...opts,
          };

          return {
            nodes: {
              ...state.nodes,
              [id]: newNode,
              [parentId]: {
                ...parent,
                children: [...(parent as DirNode).children, id]
              }
            }
          };
        });
        return id;
      },

      createDir: (parentId, name, opts = {}) => {
        const id = uuidv4();
        const now = Date.now();
        set(state => {
          const parent = state.nodes[parentId];
          if (!parent || parent.type !== 'dir') throw new Error('Invalid parent');

          const newNode: DirNode = {
            id,
            name,
            type: 'dir',
            parent: parentId,
            children: [],
            createdAt: now,
            modifiedAt: now,
            ...opts,
          };

          return {
            nodes: {
              ...state.nodes,
              [id]: newNode,
              [parentId]: {
                ...parent,
                children: [...(parent as DirNode).children, id]
              }
            }
          };
        });
        return id;
      },

      deleteNode: (id) => {
        set(state => {
          const node = state.nodes[id];
          if (!node) return {};

          // Remove from parent
          let nodes = { ...state.nodes };
          if (node.parent) {
            const parent = nodes[node.parent] as DirNode;
            if (parent) {
                nodes[node.parent] = {
                    ...parent,
                    children: parent.children.filter(childId => childId !== id)
                };
            }
          }

          // Recursive delete helper (for dirs)
          const deleteRecursive = (nodeId: string) => {
             const n = nodes[nodeId];
             if(!n) return;
             if(n.type === 'dir') {
               (n as DirNode).children.forEach(deleteRecursive);
             }
             delete nodes[nodeId];
          }

          deleteRecursive(id);

          return { nodes };
        });
      },

      updateFile: (id, content) => {
        set(state => {
          const node = state.nodes[id];
          if (!node || node.type !== 'file') return {};

          return {
            nodes: {
              ...state.nodes,
              [id]: { ...node, content, modifiedAt: Date.now() }
            }
          }
        });
      },

      renameNode: (id, newName) => {
        set(state => {
           const node = state.nodes[id];
           if(!node) return {};
           return {
             nodes: {
               ...state.nodes,
               [id]: { ...node, name: newName, modifiedAt: Date.now() }
             }
           }
        });
      },

      moveNode: (id, newParentId) => {
         set(state => {
           const node = state.nodes[id];
           const newParent = state.nodes[newParentId];
           if(!node || !newParent || newParent.type !== 'dir') return {};
           if(node.parent === newParentId) return {};

           const oldParentId = node.parent;

           const newNodes = { ...state.nodes };

           // Remove from old parent
           if (oldParentId) {
              const oldParent = newNodes[oldParentId] as DirNode;
              if (oldParent) {
                  newNodes[oldParentId] = {
                    ...oldParent,
                    children: oldParent.children.filter(c => c !== id)
                  };
              }
           }

           // Add to new parent
           const targetParent = newNodes[newParentId] as DirNode;
           newNodes[newParentId] = {
             ...targetParent,
             children: [...targetParent.children, id]
           };

           // Update node
           newNodes[id] = { ...node, parent: newParentId, modifiedAt: Date.now() };

           return { nodes: newNodes };
         });
      },

      updateMetadata: (id, metadata) => {
          set(state => {
              const node = state.nodes[id];
              if (!node) return {};
              return {
                  nodes: {
                      ...state.nodes,
                      [id]: {
                          ...node,
                          metadata: { ...node.metadata, ...metadata }
                      }
                  }
              }
          })
      }
    }),
    {
      name: 'os:fs:v1',
    }
  )
);

// Helper to resolve path to ID
export const resolvePath = (path: string, nodes: Record<string, FSNode>, rootId: string): FSNode | null => {
  if (path === '/') return nodes[rootId];

  // Remove trailing slash
  if (path.length > 1 && path.endsWith('/')) {
      path = path.slice(0, -1);
  }

  const parts = path.split('/').filter(Boolean);
  let current: FSNode = nodes[rootId];

  for (const part of parts) {
    if (current.type !== 'dir') return null;
    const foundId = (current as DirNode).children.find(childId => nodes[childId]?.name === part);
    if (!foundId) return null;
    current = nodes[foundId];
  }

  return current;
};

// Helper to get absolute path from ID
export const getAbsolutePath = (id: string, nodes: Record<string, FSNode>, rootId: string): string => {
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
