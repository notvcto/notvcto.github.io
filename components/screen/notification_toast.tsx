import React, { useEffect, useState } from 'react';
import { useNotificationStore } from '@/lib/store/notifications';
import { getIconPath } from '@/lib/utils/icons';

export default function NotificationToast() {
  const notifications = useNotificationStore((state) => state.notifications);
  const markAsRead = useNotificationStore((state) => state.markAsRead);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  const latest = notifications[0];

  // Watch for new notifications
  useEffect(() => {
    // If there is a new latest notification that is unread and different from the last one we showed
    if (latest && !latest.read && latest.id !== activeId) {
       setActiveId(latest.id);
       setVisible(true);
    }
  }, [latest, activeId]);

  // Handle auto-dismiss
  useEffect(() => {
    if (!activeId || !visible) return;

    const notification = notifications.find(n => n.id === activeId);

    // If notification was removed from store, hide toast
    if (!notification) {
        setVisible(false);
        return;
    }

    // If persistent, do not auto-dismiss
    if (notification.persistent) return;

    const timer = setTimeout(() => {
      setVisible(false);
      // We do not clear activeId here, to prevent the effect above from re-triggering
      // for the same notification ID immediately.
    }, 4000);

    return () => clearTimeout(timer);
  }, [activeId, visible, notifications]);

  const currentNotification = notifications.find(n => n.id === activeId);

  // If hidden or data missing, don't render
  if (!visible || !currentNotification) return null;

  const handleClick = () => {
    if (currentNotification.action) {
        currentNotification.action.callback();
    }
    markAsRead(currentNotification.id);
    setVisible(false);
  };

  const iconPath = currentNotification.appId
    ? getIconPath(currentNotification.appId)
    : getIconPath('dialog-information');

  return (
    <div
        className="fixed top-12 left-1/2 transform -translate-x-1/2 z-[60] w-72 md:w-96 bg-ub-grey border border-ub-orange border-opacity-50 rounded-lg shadow-xl cursor-pointer text-ubt-grey hover:bg-opacity-95 transition-all duration-200"
        onClick={handleClick}
    >
       <div className="flex items-center p-3">
          <div className="relative w-8 h-8 flex-shrink-0 mr-3">
            <img
                src={iconPath}
                alt="icon"
                className="w-full h-full object-contain"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold truncate">{currentNotification.title}</h4>
            {currentNotification.body && (
                <p className="text-xs truncate opacity-80">{currentNotification.body}</p>
            )}
          </div>
          {currentNotification.action && (
            <div className="ml-2 text-xs text-ubt-blue font-medium whitespace-nowrap">
                {currentNotification.action.label}
            </div>
          )}
       </div>
    </div>
  );
}
