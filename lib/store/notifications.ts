import { create } from 'zustand';

export interface Notification {
  id: string;
  title: string;
  body: string;
  timestamp: number; // Unix time in ms
  read: boolean;
}

interface NotificationState {
  notifications: Notification[];
  add: (notification: Notification) => void;
  remove: (id: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>()((set) => ({
  notifications: [],

  add: (notification) =>
    set((state) => ({ notifications: [notification, ...state.notifications] })),

  remove: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),

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

  clearAll: () => set({ notifications: [] }),
}));
