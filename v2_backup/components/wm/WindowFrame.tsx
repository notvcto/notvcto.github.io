'use client';

import { useState, useRef, useEffect } from 'react';
import { WindowState, useSystemStore } from '@/store/system';
import clsx from 'clsx';

interface WindowFrameProps {
  window: WindowState;
  children: React.ReactNode;
}

export const WindowFrame = ({ window, children }: WindowFrameProps) => {
  const { id, title, x, y, width, height, zIndex, isFocused, isMinimized, isMaximized } = window;
  const { focusWindow, closeWindow, updateWindowPosition, toggleMinimize, toggleMaximize } = useSystemStore();

  // Dragging state
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const windowRef = useRef<HTMLDivElement>(null);

  // Use local ref for immediate position updates during drag to avoid re-renders
  // We sync with store on drag start (to init) and drag end (to save).
  // During drag, we manipulate the DOM directly.
  const currentPos = useRef({ x, y });

  // Sync ref with props when not dragging (in case external update happens)
  useEffect(() => {
    if (!isDragging) {
      currentPos.current = { x, y };
      if (windowRef.current) {
        windowRef.current.style.transform = isMaximized ? 'none' : `translate(${x}px, ${y}px)`;
      }
    }
  }, [x, y, isDragging, isMaximized]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    // Focus on interaction
    focusWindow(id);

    // Only start drag if left click and not maximized
    if (e.button !== 0 || isMaximized) return;

    setIsDragging(true);
    dragOffset.current = {
      x: e.clientX - currentPos.current.x,
      y: e.clientY - currentPos.current.y,
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
    const constrainedY = Math.max(0, newY); // Don't go above top bar

    // Update local ref
    currentPos.current = { x: newX, y: constrainedY };

    // Direct DOM update for performance (60fps)
    if (windowRef.current) {
        windowRef.current.style.transform = `translate(${newX}px, ${constrainedY}px)`;
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      setIsDragging(false);
      (e.target as Element).releasePointerCapture(e.pointerId);

      // Sync final position to store
      updateWindowPosition(id, currentPos.current.x, currentPos.current.y);
    }
  };

  if (isMinimized) {
    return null;
  }

  const maximizedStyles = isMaximized ? {
    top: 40, // Below top bar
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: 'calc(100% - 40px)',
    transform: 'none',
  } : {
    // Initial render style, updated by ref effect or drag logic
    transform: `translate(${x}px, ${y}px)`,
    width: width,
    height: height,
  };

  return (
    <div
      ref={windowRef}
      className={clsx(
        "absolute flex flex-col overflow-hidden shadow-xl transition-shadow duration-300 pointer-events-auto",
        isMaximized ? "rounded-none transition-all" : "rounded-lg", // Only animate on maximize toggle, drag is manual
        isFocused ? "shadow-glow border-primary/40 ring-1 ring-primary/20" : "border-white/10 dark:border-white/5 shadow-2xl",
        "bg-surface-light dark:bg-surface-dark border" // Base styles
      )}
      style={{
        zIndex: zIndex,
        ...maximizedStyles,
        // Override transform if we are dragging to prevent transition conflict?
        // We removed transition-all from base class to avoid drag lag, added back for maximize only?
        // Let's keep transition-shadow.
      }}
      onPointerDown={() => focusWindow(id)} // Focus on clicking anywhere in window
    >
      {/* Title Bar */}
      <div
        className={clsx(
          "h-8 flex items-center px-3 justify-between select-none cursor-default shrink-0",
          "bg-[#11111b]/50 border-b border-white/5",
          "group-hover:bg-surface-dark transition-colors"
        )}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onDoubleClick={() => toggleMaximize(id)}
      >
        {/* Window Controls (Mac-style) */}
        <div className="flex gap-1.5 opacity-100 transition-opacity">
          <button
            onPointerDown={(e) => { e.stopPropagation(); }} // Prevent drag start
            onClick={(e) => { e.stopPropagation(); closeWindow(id); }}
            className="w-2.5 h-2.5 rounded-full bg-red-accent hover:opacity-80 active:scale-90 transition-all"
          />
          <button
            onPointerDown={(e) => { e.stopPropagation(); }} // Prevent drag start
            onClick={(e) => { e.stopPropagation(); toggleMinimize(id); }}
            className="w-2.5 h-2.5 rounded-full bg-yellow-accent hover:opacity-80 active:scale-90 transition-all"
          />
          <button
            onPointerDown={(e) => { e.stopPropagation(); }} // Prevent drag start
            onClick={(e) => { e.stopPropagation(); toggleMaximize(id); }}
            className="w-2.5 h-2.5 rounded-full bg-green-accent hover:opacity-80 active:scale-90 transition-all"
          />
        </div>

        {/* Title */}
        <div className="text-xs font-sans text-subtext-dark opacity-80 flex items-center gap-2 pointer-events-none">
           <span className="material-icons-round text-sm">grid_view</span>
           {title}
        </div>

        {/* Right side spacers/controls (minimal for now) */}
        <div className="flex gap-2 text-subtext-dark opacity-40 w-10">
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
