"use client";
import React, { useState, useEffect, useRef } from "react";
import Draggable, { DraggableData, DraggableEvent } from "react-draggable";
import { useWMStore } from "@/lib/store/wm";
import { getIconPath } from "@/lib/utils/icons";

interface WindowProps {
  id: string;
  title: string;
  minimized: boolean;
  maximized: boolean;
  focused: boolean;
  screen: React.ComponentType<any>;
  componentProps?: any;
  x?: number;
  y?: number;
}

export default function Window({
  id,
  title,
  minimized,
  maximized,
  focused,
  screen: Screen,
  componentProps,
  x = 0,
  y = 0
}: WindowProps) {
  const {
    focusWindow,
    minimizeWindow,
    toggleMaximize,
    closeWindow,
    updateWindowPosition,
  } = useWMStore();

  const [cursorType, setCursorType] = useState("cursor-default");
  const [size, setSize] = useState({ width: 60, height: 85 }); // % based
  const [closed, setClosed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const windowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
     if (typeof window !== "undefined") {
         if (window.innerWidth < 640) {
             setSize({ width: 85, height: 60 });
         }
     }
  }, []);

  const updateCSSVars = (posX: number, posY: number) => {
      if (windowRef.current) {
          windowRef.current.style.setProperty('--window-transform-x', `${posX}px`);
          windowRef.current.style.setProperty('--window-transform-y', `${posY}px`);
      }
  };

  // Initialize CSS variables on mount
  useEffect(() => {
      updateCSSVars(x, y);
  }, []);

  const handleClose = () => {
      setClosed(true);
      setTimeout(() => closeWindow(id), 200);
  };

  const handleDragStart = () => {
      focusWindow(id);
      setIsDragging(true);
      setCursorType("cursor-move");
  }

  const handleDrag = (e: DraggableEvent, data: DraggableData) => {
      updateCSSVars(data.x, data.y);
  }

  const handleDragStop = (e: DraggableEvent, data: DraggableData) => {
      setIsDragging(false);
      setCursorType("cursor-default");
      if (!maximized) {
          updateWindowPosition(id, data.x, data.y);
      }
  }

  const windowClass = `
    ${cursorType}
    ${closed ? "closed-window" : ""}
    ${maximized ? "duration-300 rounded-none w-full h-full top-0 left-0" : "rounded-xl"}
    ${minimized ? "opacity-0 invisible duration-200" : ""}
    ${focused ? "z-30 shadow-2xl" : "z-20 notFocused window-shadow"}
    overflow-hidden min-w-1/4 min-h-1/4 main-window absolute border-black border-opacity-40 border border-t-0 flex flex-col window-no-outline focus:outline-none
    ${isDragging ? "transition-none" : ""}
  `;

  const style: React.CSSProperties = maximized ? {
      width: '100%',
      height: '100%',
      transform: 'none !important',
      top: 0,
      left: 0
  } : {
      width: `${size.width}%`,
      height: `${size.height}%`,
  };

  return (
      <Draggable
        axis="both"
        handle=".bg-ub-window-title"
        grid={[1, 1]}
        scale={1}
        onStart={handleDragStart}
        onDrag={handleDrag}
        onStop={handleDragStop}
        disabled={maximized}
        defaultPosition={{ x, y }}
        position={maximized ? { x: 0, y: 0 } : undefined}
      >
        <div ref={windowRef} className={windowClass} style={style} id={id} onClick={() => focusWindow(id)}>
            <div className="relative w-full h-full overflow-hidden flex flex-col opened-window">
                <WindowTopBar title={title} />
                <WindowEditButtons
                    minimize={() => minimizeWindow(id)}
                    maximize={() => toggleMaximize(id)}
                    isMaximised={maximized}
                    close={handleClose}
                    id={id}
                />
                <div className="w-full flex-grow z-20 max-h-full overflow-y-auto windowMainScreen bg-ub-cool-grey">
                    <Screen {...componentProps} />
                </div>
            </div>
        </div>
      </Draggable>
  );
}

function WindowTopBar({ title }: { title: string }) {
  return (
    <div className="relative bg-ub-window-title border-t-2 border-white border-opacity-5 py-1.5 px-3 text-white w-full select-none rounded-b-none">
      <div className="flex justify-center text-sm font-bold">{title}</div>
    </div>
  );
}

function WindowEditButtons({ minimize, maximize, isMaximised, close, id }: any) {
    return (
        <div className="absolute select-none right-0 top-0 mt-1 mr-1 flex justify-center items-center">
             <span
                className="mx-1.5 bg-white bg-opacity-0 hover:bg-opacity-10 rounded-full flex justify-center mt-1 h-5 w-5 items-center"
                onClick={(e) => { e.stopPropagation(); minimize(); }}
            >
                <img
                src={getIconPath("window-minimize")}
                alt="minimize"
                className="h-5 w-5 inline"
                />
            </span>
            {isMaximised ? (
                <span
                className="mx-2 bg-white bg-opacity-0 hover:bg-opacity-10 rounded-full flex justify-center mt-1 h-5 w-5 items-center"
                onClick={(e) => { e.stopPropagation(); maximize(); }}
                >
                <img
                    src={getIconPath("window-restore")}
                    alt="restore"
                    className="h-5 w-5 inline"
                />
                </span>
            ) : (
                <span
                className="mx-2 bg-white bg-opacity-0 hover:bg-opacity-10 rounded-full flex justify-center mt-1 h-5 w-5 items-center"
                onClick={(e) => { e.stopPropagation(); maximize(); }}
                >
                <img
                    src={getIconPath("window-maximize")}
                    alt="maximize"
                    className="h-5 w-5 inline"
                />
                </span>
            )}
            <button
                tabIndex={-1}
                id={`close-${id}`}
                className="mx-1.5 focus:outline-none cursor-default bg-ub-orange bg-opacity-90 hover:bg-opacity-100 rounded-full flex justify-center mt-1 h-5 w-5 items-center"
                onClick={(e) => { e.stopPropagation(); close(); }}
            >
                <img
                src={getIconPath("window-close")}
                alt="close"
                className="h-5 w-5 inline"
                />
            </button>
        </div>
    )
}
