'use client';

import { useSystemStore, AppID } from '@/store/system';
import { getAppManifest } from '@/components/apps/registry';
import clsx from 'clsx';
import { useMemo } from 'react';

export const Dock = () => {
  const { spawnWindow, windows } = useSystemStore();

  const dockItems = useMemo(() => {
      // 1. Defined Pinned Apps
      const pinnedApps: { id: AppID, label: string, icon: string, color: string }[] = [
        { id: 'terminal', label: 'Terminal', icon: 'terminal', color: 'text-primary' },
        { id: 'projects', label: 'Files', icon: 'folder_open', color: 'text-blue-accent' },
        { id: 'about', label: 'About', icon: 'person', color: 'text-green-accent' },
        { id: 'contact', label: 'Apps', icon: 'grid_view', color: 'text-red-accent' },
      ];

      // 2. Identify Running Apps
      const runningAppIds = new Set(Object.values(windows).map(w => w.appId));

      // 3. Merge: Pinned (with status) + Unpinned Running
      const items = [...pinnedApps];

      // Add unpinned running apps
      runningAppIds.forEach(appId => {
          if (!pinnedApps.find(p => p.id === appId)) {
              const manifest = getAppManifest(appId);
              if (manifest) {
                  items.push({
                      id: appId,
                      label: manifest.name,
                      icon: manifest.icon,
                      color: 'text-text-light' // Default color
                  });
              }
          }
      });

      return items.map(item => ({
          ...item,
          isOpen: runningAppIds.has(item.id)
      }));
  }, [windows]);

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 animate-[fadeInUp_0.8s_ease-out]">
      <div className="flex items-center gap-2 px-4 py-3 bg-surface-dark/90 glass border border-white/10 rounded-2xl shadow-2xl backdrop-blur-md">
        {dockItems.map((item, index) => (
          <div key={item.id} className="flex items-center relative group">
            {/* Divider for "Apps" button if it's separate? The ref design had it separate.
                We'll keep the logic simple: if index 3 (Apps), add separator before.
                But since we might add more items dynamically, we should check if it's strictly the 'contact'/'apps' item.
            */}
            {item.id === 'contact' && index > 0 && <div className="w-px h-6 bg-white/10 mx-1"></div>}

            <button
              onClick={() => spawnWindow(item.id)}
              className={clsx(
                "p-2 rounded-xl transition-all relative hover:scale-110 duration-200",
                item.id === 'contact' ? "bg-primary/20 hover:bg-primary/30 text-primary" : "hover:bg-white/10"
              )}
            >
              <span className={clsx("material-icons-round text-2xl", item.id !== 'contact' && item.color, item.id !== 'contact' && "hover:text-white transition-colors")}>
                {item.icon}
              </span>

              {/* Tooltip */}
              <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#11111b] text-xs px-2 py-1 rounded border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                {item.label}
              </span>

              {/* Active Dot */}
              {item.isOpen && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-text-dark rounded-full"></span>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
