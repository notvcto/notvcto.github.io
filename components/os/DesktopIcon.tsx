'use client';

import { useState, useRef, useEffect } from 'react';
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

  // Local ref for smooth dragging (optional, but since we batch move via store for multi-select,
  // we might want to keep the current store-driven logic for multi-icon consistency OR optimize.
  // Store-driven multi-icon drag updates state for ALL icons. This is heavy.
  // Optimization:
  // 1. If single icon drag, use local ref -> update store on up.
  // 2. If multi drag, we kinda have to update store to move all of them?
  //    Or we could have a "DragOverlay" layer?
  //    For now, let's just make the threshold tiny and rely on React.
  //    Actually, let's remove the "transition-transform" during drag to avoid lag.
  //    See class logic below.

  const iconRef = useRef<HTMLDivElement>(null);

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

    // Immediate threshold check
    const thresholdExceeded = hasDragged || Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2;

    if (thresholdExceeded) {
       if (!hasDragged) setHasDragged(true);

       // Update store immediately for multi-icon support
       moveIcons(deltaX, deltaY);
       dragStart.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      setIsDragging(false);
      (e.currentTarget as Element).releasePointerCapture(e.pointerId);

      if (!hasDragged) {
        // Click action
        if (!e.metaKey && !e.ctrlKey) {
             spawnWindow(appId);
             selectIcons([id]); // Ensure this is the only one selected
        }
      } else {
        // Drag Interaction Ended -> Snap
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
      ref={iconRef}
      className={clsx(
        "pointer-events-auto absolute flex flex-col items-center gap-1 group w-20 cursor-pointer select-none",
        // Remove transition during drag to prevent "following" effect/lag
        // We use isDragging state to toggle transition class?
        // Actually, if we update store every frame, transition makes it look floaty/laggy.
        // We should DISABLE transition for position changes generally, or only enable for snapping?
        // Let's rely on 'duration-75' only when NOT dragging?
        // But we don't know if *this* icon is being dragged if it's part of a group but not the leader?
        // Actually moveIcons updates ALL icons.
        // Let's remove 'transition-transform' completely for now to feel raw/fast.
        // Or make it very fast.
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
