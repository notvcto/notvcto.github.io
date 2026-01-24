'use client';

import { useState, useRef } from 'react';
import { useSystemStore, IconState } from '@/store/system';
import clsx from 'clsx';

interface DesktopIconProps {
  iconData: IconState;
}

export const DesktopIcon = ({ iconData }: DesktopIconProps) => {
  const { id, appId, label, icon, x, y, color = 'primary', special = false } = iconData;
  const {
    spawnWindow,
    selectedIconIds,
    selectIcons,
    toggleIconSelection,
    moveIcons,
    snapIconsToGrid,
    updateIconPosition
  } = useSystemStore();

  const isSelected = selectedIconIds.includes(id);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const [hasDragged, setHasDragged] = useState(false);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Left click only
    if (e.button !== 0) return;

    e.preventDefault();
    e.stopPropagation();

    // Selection Logic
    if (e.metaKey || e.ctrlKey) {
        toggleIconSelection(id);
    } else if (!isSelected) {
        // If clicking an unselected icon without modifier, select only this one
        selectIcons([id]);
    }
    // If clicking a selected icon, keep selection as is to allow dragging group

    setIsDragging(true);
    setHasDragged(false);
    dragStart.current = { x: e.clientX, y: e.clientY };

    (e.currentTarget as Element).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;

    e.preventDefault();

    const deltaX = e.clientX - dragStart.current.x;
    const deltaY = e.clientY - dragStart.current.y;

    // We can use a ref for immediate feedback or just allow a small jump
    // Let's check against the threshold immediately
    const thresholdExceeded = hasDragged || Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2;

    if (thresholdExceeded) {
       if (!hasDragged) setHasDragged(true);

       moveIcons(deltaX, deltaY);
       // Reset dragStart to current to calculate next delta
       dragStart.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      setIsDragging(false);
      (e.currentTarget as Element).releasePointerCapture(e.pointerId);

      if (!hasDragged) {
        // Click action
        // If it was a simple click on a selection group, we might want to select just this one?
        // Standard OS behavior: click on selected icon -> select only this one (unless mousedown already handled it)
        // But we handle selection on mousedown.
        // Double click to spawn? Or single? Requirement says "Click icons" -> launch.
        // Let's assume single click launches if not modified.
        // But if we are selecting, we shouldn't launch.
        // Let's use Double Click for launch to allow selection manipulation?
        // Or check if modifier keys were used.
        if (!e.metaKey && !e.ctrlKey) {
             spawnWindow(appId);
             selectIcons([id]); // Ensure this is the only one selected
        }
      } else {
        // Drag Interaction Ended -> Snap
        // We delay slightly to ensure the final move frame has processed if needed,
        // though standard react state update batching handles it.
        snapIconsToGrid();
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
      className={clsx(
        "pointer-events-auto absolute flex flex-col items-center gap-1 group w-20 cursor-pointer select-none transition-transform duration-75",
        isSelected && "brightness-125"
      )}
      style={{ transform: `translate(${x}px, ${y}px)` }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <div className={clsx(
        "w-12 h-12 flex items-center justify-center rounded-xl border transition-colors relative",
        styles.container,
        isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-[#1e1e2e]"
      )}>
        <span className={clsx("material-icons-round text-3xl", styles.icon)}>
          {icon}
        </span>
      </div>
      <span className={clsx(
          "text-xs font-medium text-text-dark shadow-black drop-shadow-md text-center group-hover:bg-primary/20 group-hover:rounded px-1 rounded",
          isSelected ? "bg-primary/40" : "bg-black/20"
      )}>
        {label}
      </span>
    </div>
  );
};
