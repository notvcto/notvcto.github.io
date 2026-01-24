'use client';

import { useState, useRef } from 'react';
import { AppID, useSystemStore, IconState } from '@/store/system';
import clsx from 'clsx';

interface DesktopIconProps {
  iconData: IconState;
}

export const DesktopIcon = ({ iconData }: DesktopIconProps) => {
  const { id, appId, label, icon, x, y, color = 'primary', special = false } = iconData;
  const { spawnWindow, updateIconPosition } = useSystemStore();

  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const [hasDragged, setHasDragged] = useState(false);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    // Only start drag if left click
    if (e.button !== 0) return;

    setIsDragging(true);
    setHasDragged(false);
    dragOffset.current = {
      x: e.clientX - x,
      y: e.clientY - y,
    };

    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;

    e.preventDefault();
    setHasDragged(true);

    const newX = e.clientX - dragOffset.current.x;
    const newY = e.clientY - dragOffset.current.y;

    // Grid snapping could happen here, but free drag for now
    updateIconPosition(id, newX, newY);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      setIsDragging(false);
      (e.target as Element).releasePointerCapture(e.pointerId);

      // If we didn't drag significantly, treat as click
      if (!hasDragged) {
        spawnWindow(appId);
      }
    }
  };

  // Construct color classes dynamically
  const colorMap: Record<string, { container: string; icon: string }> = {
    'blue-accent': { container: 'bg-blue-accent/10 border-blue-accent/20 group-hover:bg-blue-accent/20', icon: 'text-blue-accent' },
    'primary': { container: 'bg-primary/10 border-primary/20 group-hover:bg-primary/20', icon: 'text-primary' },
    'green-accent': { container: 'bg-green-accent/10 border-green-accent/20 group-hover:bg-green-accent/20', icon: 'text-green-accent' },
    'subtext-dark': { container: 'bg-white/5 border-white/10 group-hover:bg-white/10', icon: 'text-subtext-dark' },
  };

  const styles = colorMap[color] || colorMap['primary'];

  return (
    <div
      className="pointer-events-auto absolute flex flex-col items-center gap-1 group w-20 cursor-pointer select-none"
      style={{ transform: `translate(${x}px, ${y}px)` }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <div className={clsx(
        "w-12 h-12 flex items-center justify-center rounded-xl border transition-colors",
        styles.container
      )}>
        <span className={clsx("material-icons-round text-3xl", styles.icon)}>
          {icon}
        </span>
      </div>
      <span className="text-xs font-medium text-text-dark shadow-black drop-shadow-md text-center group-hover:bg-primary/20 group-hover:rounded px-1 bg-black/20 rounded">
        {label}
      </span>
    </div>
  );
};
