'use client';

import { useSystemStore, AppID } from '@/store/system';
import clsx from 'clsx';

export const Dock = () => {
  const { spawnWindow } = useSystemStore();

  const dockItems: { id: AppID, label: string, icon: string, color: string }[] = [
    { id: 'terminal', label: 'Terminal', icon: 'terminal', color: 'text-primary' },
    { id: 'projects', label: 'Files', icon: 'folder_open', color: 'text-blue-accent' },
    { id: 'about', label: 'About', icon: 'person', color: 'text-green-accent' },
    { id: 'contact', label: 'Apps', icon: 'grid_view', color: 'text-red-accent' }, // Using 'contact' ID as placeholder for Apps view if needed, or just launch contact
  ];

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 animate-[fadeInUp_0.8s_ease-out]">
      <div className="flex items-center gap-2 px-4 py-3 bg-surface-dark/90 glass border border-white/10 rounded-2xl shadow-2xl backdrop-blur-md">
        {dockItems.map((item, index) => (
          <div key={item.id} className="flex items-center">
            {index === 3 && <div className="w-px h-6 bg-white/10 mx-1"></div>}

            <button
              onClick={() => spawnWindow(item.id)}
              className={clsx(
                "p-2 rounded-xl transition-all group relative hover:scale-110 duration-200",
                index === 3 ? "bg-primary/20 hover:bg-primary/30 text-primary" : "hover:bg-white/10"
              )}
            >
              <span className={clsx("material-icons-round text-2xl", index !== 3 && item.color, index !== 3 && "hover:text-white transition-colors")}>
                {item.icon}
              </span>

              {/* Tooltip */}
              <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#11111b] text-xs px-2 py-1 rounded border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                {item.label}
              </span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
