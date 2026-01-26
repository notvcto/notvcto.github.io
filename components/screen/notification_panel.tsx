import React from 'react';
import { useNotificationStore } from '../../lib/store/notifications';
import CalendarWidget from '../util components/calendar_widget';
import { getIconPath } from '../../lib/utils/icons';

export default function NotificationPanel() {
  const { notifications, clearAll, markAsRead } = useNotificationStore();

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    clearAll();
  };

  const handleNotificationClick = (id: string) => {
    markAsRead(id);
  };

  return (
    <div
      className="w-[700px] h-[500px] bg-ub-cool-grey rounded-lg shadow-2xl flex overflow-hidden border border-black/20 z-50 text-white"
      onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
    >
      {/* Left Column: Notifications */}
      <div className="w-1/2 flex flex-col border-r border-white/10">
        <div className="flex justify-between items-center p-4 border-b border-white/10">
          <span className="font-bold text-lg">Notifications</span>
          {notifications.length > 0 && (
            <button
              onClick={handleClear}
              className="text-xs hover:bg-white/10 px-2 py-1 rounded transition-colors text-gray-300 hover:text-white"
            >
              Clear List
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-4 opacity-50">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
              <span className="text-lg font-light">No Notifications</span>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => {
                 const iconPath = notification.appId ? getIconPath(notification.appId) : getIconPath('dialog-information');
                 return (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification.id)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-white/10 flex gap-3
                      ${notification.read ? 'opacity-60 bg-white/5' : 'bg-white/10 hover:bg-white/15'}
                    `}
                  >
                    <div className="relative w-8 h-8 flex-shrink-0 mt-1">
                        <img
                            src={iconPath}
                            alt="app icon"
                            className="w-full h-full object-contain"
                        />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <span className={`text-sm truncate pr-2 ${notification.read ? 'font-normal' : 'font-bold'}`}>
                            {notification.title}
                        </span>
                        <span className="text-xs text-gray-400 whitespace-nowrap">
                          {new Date(notification.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      {notification.body && (
                        <p className="text-xs text-gray-300 line-clamp-2 leading-tight">{notification.body}</p>
                      )}
                      {notification.action && (
                        <div className="mt-2 text-xs text-ubt-blue font-medium">
                            {notification.action.label}
                        </div>
                      )}
                    </div>
                  </div>
                 );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Calendar */}
      <div className="w-1/2 flex flex-col bg-ub-grey/50">
        <CalendarWidget />
      </div>
    </div>
  );
}
