'use client';

import { useState, useRef } from 'react';
import { useSystemStore } from '@/store/system';
import clsx from 'clsx';
import { TopBar } from './TopBar';
import { DesktopIcon } from './DesktopIcon';
import { WindowManager } from '@/components/wm/WindowManager';
import { ContextMenu } from './ContextMenu'; // Will create in next step
import { Dock } from './Dock'; // Will create in later step

export const Desktop = () => {
  const { icons, selectedIconIds, selectIcons, deselectAllIcons, wallpaper } = useSystemStore();

  // Selection Box State
  const [selectionBox, setSelectionBox] = useState<{ start: { x: number, y: number }, current: { x: number, y: number } } | null>(null);
  const desktopRef = useRef<HTMLDivElement>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    // Only left click starts selection
    if (e.button !== 0) return;

    // In React 18 / Next 13, events bubble.
    // We want to ensure we aren't clicking on something interactive.
    // But our interactive layers (icons, windows) are siblings or children with pointer-events-auto.
    // The Desktop div is z-0.
    // If we click an icon (z-10), it stops propagation.
    // So if we get here, it SHOULD be the background.

    deselectAllIcons();
    setSelectionBox({
        start: { x: e.clientX, y: e.clientY },
        current: { x: e.clientX, y: e.clientY }
    });
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!selectionBox) return;

    const newCurrent = { x: e.clientX, y: e.clientY };
    setSelectionBox({ ...selectionBox, current: newCurrent });

    // Calculate selection intersection live
    const left = Math.min(selectionBox.start.x, newCurrent.x);
    const top = Math.min(selectionBox.start.y, newCurrent.y);
    const width = Math.abs(selectionBox.start.x - newCurrent.x);
    const height = Math.abs(selectionBox.start.y - newCurrent.y);
    const right = left + width;
    const bottom = top + height;

    const newSelectedIds: string[] = [];

    // Check each icon (simple bounding box approx since we know size is roughly 80x80 centered at x,y)
    // Icon x,y is translation (top-left usually in our CSS logic? No, check DesktopIcon)
    // DesktopIcon style: transform: translate(x,y). This is top-left.
    // Icon size approx 80x80 (w-20 = 5rem = 80px width)

    icons.forEach(icon => {
        const iconW = 80;
        const iconH = 80;
        const iconLeft = icon.x;
        const iconTop = icon.y;
        const iconRight = iconLeft + iconW;
        const iconBottom = iconTop + iconH;

        // Intersection logic
        if (
            left < iconRight &&
            right > iconLeft &&
            top < iconBottom &&
            bottom > iconTop
        ) {
            newSelectedIds.push(icon.id);
        }
    });

    selectIcons(newSelectedIds);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (selectionBox) {
        setSelectionBox(null);
        (e.currentTarget as Element).releasePointerCapture(e.pointerId);
    }
  };

  return (
    <>
      <div className="fixed inset-0 scanlines z-50 pointer-events-none opacity-20"></div>

      {/* Background & Interaction Layer */}
      <div
        ref={desktopRef}
        className={clsx(
            "fixed inset-0 z-0 bg-cover bg-center transition-all duration-500 touch-none",
            wallpaper === 'default' && "bg-gradient-to-br from-background-light to-[#dce0e8] dark:from-background-dark dark:to-[#11111b]"
        )}
        style={{
            backgroundImage: wallpaper !== 'default' ?
                (wallpaper === 'bg-space' ? "url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')" :
                 wallpaper === 'bg-forest' ? "url('https://images.unsplash.com/photo-1448375240586-dfd8f3793371?q=80&w=2070&auto=format&fit=crop')" : undefined)
                : undefined
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onContextMenu={(e) => { e.preventDefault(); /* Global listener handles it, but this stops browser menu */ }}
      >
        {wallpaper === 'default' && (
            <>
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl pointer-events-none"></div>
            </>
        )}

        {/* Selection Box */}
        {selectionBox && (
            <div
                className="absolute border border-primary/50 bg-primary/20 pointer-events-none z-50"
                style={{
                    left: Math.min(selectionBox.start.x, selectionBox.current.x),
                    top: Math.min(selectionBox.start.y, selectionBox.current.y),
                    width: Math.abs(selectionBox.start.x - selectionBox.current.x),
                    height: Math.abs(selectionBox.start.y - selectionBox.current.y),
                }}
            />
        )}
      </div>

      <TopBar />

      {/* Desktop Icons Layer */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {icons.map((icon) => (
          <DesktopIcon key={icon.id} iconData={icon} />
        ))}
      </div>

      {/* Window Manager Layer */}
      <div className="fixed inset-0 z-20 pointer-events-none">
        <WindowManager />
      </div>

      {/* Context Menu (Next Step) */}
      <ContextMenu />

      {/* Dock (Next Step) */}
      <Dock />
    </>
  );
};
