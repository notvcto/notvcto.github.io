'use client';

import { useState, useEffect, useRef } from 'react';
import { useSystemStore } from '@/store/system';
import clsx from 'clsx';

export const ContextMenu = () => {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const menuRef = useRef<HTMLDivElement>(null);

  const { setWallpaper } = useSystemStore();

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      // If clicking on the desktop background (which we can infer if not stopped propagation)
      // Actually, Desktop.tsx handles interaction, but standard contextmenu event bubbles.
      // We can attach a listener to window, but we only want to show if target is not an app/window?
      // Or just override everywhere? Usually interaction layers handle their own.
      // Let's rely on the parent Desktop component passing the event or blocking it?
      // Better: Attach global listener and check target, OR Desktop.tsx calls us.
      // But we are a component INSIDE Desktop.tsx.
      // Let's use a custom event or just local state in Desktop?
      // For cleaner code, let's just listen globally and check if we should close.
    };

    const handleClick = () => setVisible(false);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  // We need to hook into the Desktop's context menu event.
  // Ideally, Desktop.tsx should manage the open state or pass the event here.
  // But to keep ContextMenu self-contained, let's export a hook or listen to a custom event.
  // SIMPLER: Move state to Desktop.tsx? No, bloated.
  // Let's just use window event listener for 'contextmenu' and check if it wasn't prevented?

  useEffect(() => {
      const onContextMenu = (e: MouseEvent) => {
          e.preventDefault(); // Always prevent default browser menu
          setVisible(true);
          setPosition({ x: e.clientX, y: e.clientY });
      };

      // We only want this on the desktop background.
      // The Desktop interaction layer in Desktop.tsx has `onContextMenu={(e) => e.preventDefault()}`.
      // We can change that to dispatch a custom event or we can just bind this logic in Desktop.tsx
      // Let's allow Desktop.tsx to control this component via props?
      // Actually, standard pattern: Global listener that checks targets.
      // But we want to avoid showing it when right clicking a window (unless window has its own).
      // Let's bind to document for now and assume if it wasn't stopped, it's for us.

      document.addEventListener('contextmenu', onContextMenu);
      return () => document.removeEventListener('contextmenu', onContextMenu);
  }, []);

  if (!visible) return null;

  const wallpapers = [
      { name: 'Default (Gradient)', id: 'default' },
      { name: 'Deep Space', id: 'bg-space' }, // We'll need to handle these IDs in Desktop.tsx
      { name: 'Forest', id: 'bg-forest' },
  ];

  return (
    <div
      ref={menuRef}
      className="fixed z-50 w-48 bg-surface-dark/90 glass border border-white/10 rounded-lg shadow-xl py-1 backdrop-blur-md animate-[fadeIn_0.1s_ease-out]"
      style={{ left: position.x, top: position.y }}
    >
      <div className="px-3 py-2 text-xs font-bold text-subtext-dark uppercase tracking-wider border-b border-white/5 mb-1">
        Desktop Actions
      </div>

      <button
        className="w-full text-left px-4 py-2 text-sm text-text-dark hover:bg-primary/20 hover:text-primary transition-colors flex items-center gap-2"
        onClick={() => alert("Arrange coming soon")}
      >
        <span className="material-icons-round text-base">grid_view</span>
        Arrange Icons
      </button>

      <div className="my-1 border-t border-white/5"></div>

      <div className="px-4 py-1 text-xs text-subtext-dark/50">Wallpapers</div>
      {wallpapers.map(wp => (
          <button
            key={wp.id}
            className="w-full text-left px-4 py-2 text-sm text-text-dark hover:bg-primary/20 hover:text-primary transition-colors flex items-center gap-2"
            onClick={() => setWallpaper(wp.id)}
          >
            <span className="material-icons-round text-base">wallpaper</span>
            {wp.name}
          </button>
      ))}

      <div className="my-1 border-t border-white/5"></div>

      <button
        className="w-full text-left px-4 py-2 text-sm text-red-accent hover:bg-red-accent/10 transition-colors flex items-center gap-2"
        onClick={() => window.location.reload()}
      >
        <span className="material-icons-round text-base">refresh</span>
        Restart System
      </button>
    </div>
  );
};
