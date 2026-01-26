import React, { useEffect, useState } from 'react';
import { useNotificationStore } from '@/lib/store/notifications';
import { getIconPath } from '@/lib/utils/icons';

export default function NotificationToast() {
  const notifications = useNotificationStore((state) => state.notifications);
  const markAsRead = useNotificationStore((state) => state.markAsRead);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [render, setRender] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const latest = notifications[0];

  // Watch for new notifications
  useEffect(() => {
    // If there is a new latest notification that is unread and different from the last one we showed
    if (latest && !latest.read && latest.id !== activeId) {
       setActiveId(latest.id);
       setRender(true);
       setIsClosing(false);
    }
  }, [latest, activeId]);

  // Handle auto-dismiss
  useEffect(() => {
    if (!activeId || !render || isClosing) return;

    const notification = notifications.find(n => n.id === activeId);

    // If notification was removed from store, hide toast
    if (!notification) {
        dismiss();
        return;
    }

    // If persistent, do not auto-dismiss
    if (notification.persistent) return;

    const timer = setTimeout(() => {
      dismiss();
    }, 4000);

    return () => clearTimeout(timer);
  }, [activeId, render, isClosing, notifications]);

  const dismiss = () => {
      setIsClosing(true);
  }

  const handleAnimationEnd = () => {
      if (isClosing) {
          setRender(false);
          setIsClosing(false);
      }
  }

  const currentNotification = notifications.find(n => n.id === activeId);

  // If hidden or data missing, don't render
  if (!render || !currentNotification) return null;

  const handleClick = () => {
    if (currentNotification.action) {
        currentNotification.action.callback();
    }
    markAsRead(currentNotification.id);
    dismiss();
  };

  const iconPath = currentNotification.appId
    ? getIconPath(currentNotification.appId)
    : getIconPath('dialog-information');

  return (
    <div
        className={`fixed top-12 left-1/2 z-[60] w-80 md:w-[26rem] bg-ub-cool-grey rounded-lg shadow-xl cursor-pointer text-ubt-grey hover:bg-opacity-95
        ${isClosing ? 'animate-toast-out' : 'animate-toast-in'}`}
        onClick={handleClick}
        onAnimationEnd={handleAnimationEnd}
    >
       <div className="flex items-center p-4">
          <div className="relative w-8 h-8 flex-shrink-0 mr-3">
            <img
                src={iconPath}
                alt="icon"
                className="w-full h-full object-contain"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-base font-bold truncate">{currentNotification.title}</h4>
            {currentNotification.body && (
                <p className="text-sm truncate opacity-80">{currentNotification.body}</p>
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
