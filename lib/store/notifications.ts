import { create } from 'zustand';

export type Notification = {
  id: string;
  appId?: string;          // e.g. 'system', 'clock', 'filesystem', 'cdrom'
  title: string;
  body?: string;
  timestamp: number;       // Date.now()
  read: boolean;
  persistent?: boolean;    // if true, does NOT auto-dismiss
  action?: {
    label: string;
    callback: () => void;
  };
};

interface NotificationState {
  notifications: Notification[];

  // Actions
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'timestamp'>) => string;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>()((set) => ({
  notifications: [],

  addNotification: (notification) => {
    const id = crypto.randomUUID();
    const newNotification: Notification = {
      ...notification,
      id,
      timestamp: Date.now(),
      read: false,
    };

    set((state) => ({
      notifications: [newNotification, ...state.notifications],
    }));

    return id;
  },

  markAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    })),

  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    })),

  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),

  clearAll: () => set({ notifications: [] }),
}));
