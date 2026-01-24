'use client';

import { useState, useRef, useEffect } from 'react';
import { WindowState, useSystemStore } from '@/store/system';
import clsx from 'clsx';

interface WindowFrameProps {
  window: WindowState;
  children: React.ReactNode;
}

export const WindowFrame = ({ window, children }: WindowFrameProps) => {
  const { id, title, x, y, width, height, zIndex, isFocused, isMinimized } = window;
  const { focusWindow, closeWindow, updateWindowPosition, toggleMinimize } = useSystemStore();

  // Dragging state
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    // Focus on interaction
    focusWindow(id);

    // Only start drag if left click
    if (e.button !== 0) return;

    setIsDragging(true);
    dragOffset.current = {
      x: e.clientX - x,
      y: e.clientY - y,
    };

    // Capture pointer to track movement outside the element
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;

    e.preventDefault();

    const newX = e.clientX - dragOffset.current.x;
    const newY = e.clientY - dragOffset.current.y;

    // Optional: Clamp logic could go here.
    // For now, allowing some freedom but preventing total loss.
    // Ensure at least 20px of the title bar is visible.
    const constrainedY = Math.max(0, newY); // Don't go above top bar (simplification)

    // Update store
    updateWindowPosition(id, newX, constrainedY);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      setIsDragging(false);
      (e.target as Element).releasePointerCapture(e.pointerId);
    }
  };

  if (isMinimized) {
    return null; // Or render nothing, letting the taskbar/dock handle restoration (not implemented yet, but icons work)
  }

  return (
    <div
      className={clsx(
        "absolute flex flex-col overflow-hidden rounded-lg shadow-xl transition-shadow duration-300",
        isFocused ? "shadow-glow border-primary/40 ring-1 ring-primary/20" : "border-white/10 dark:border-white/5 shadow-2xl",
        "bg-surface-light dark:bg-surface-dark border" // Base styles
      )}
      style={{
        transform: `translate(${x}px, ${y}px)`,
        width: width,
        height: height,
        zIndex: zIndex,
      }}
      onPointerDown={() => focusWindow(id)} // Focus on clicking anywhere in window
    >
      {/* Title Bar */}
      <div
        className={clsx(
          "h-8 flex items-center px-3 justify-between select-none cursor-default",
          "bg-[#11111b]/50 border-b border-white/5",
          "group-hover:bg-surface-dark transition-colors"
        )}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* Window Controls (Mac-style) */}
        <div className="flex gap-1.5 opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); closeWindow(id); }}
            className="w-2.5 h-2.5 rounded-full bg-red-accent hover:opacity-80 active:scale-90 transition-all"
          />
          <button
            onClick={(e) => { e.stopPropagation(); toggleMinimize(id); }}
            className="w-2.5 h-2.5 rounded-full bg-yellow-accent hover:opacity-80 active:scale-90 transition-all"
          />
          <button
            className="w-2.5 h-2.5 rounded-full bg-green-accent hover:opacity-80 active:scale-90 transition-all"
          />
        </div>

        {/* Title */}
        <div className="text-xs font-sans text-subtext-dark opacity-80 flex items-center gap-2 pointer-events-none">
           {/* Icon could be dynamic based on appId, passing generic for now */}
           <span className="material-icons-round text-sm">grid_view</span>
           {title}
        </div>

        {/* Right side spacers/controls (minimal for now) */}
        <div className="flex gap-2 text-subtext-dark opacity-40 w-10">
            {/* Spacer to balance the title centering if needed, or extra actions */}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 bg-[#1e1e2e] overflow-hidden relative flex flex-col">
        {children}
      </div>

      {/* Interaction Overlay for inactive windows to catch clicks */}
      {!isFocused && (
        <div className="absolute inset-0 z-50 bg-transparent" />
      )}
    </div>
  );
};
