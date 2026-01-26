"use client";
import React, { useState, useEffect } from "react";
import { useWMStore } from "@/lib/store/wm";
import { defaultApps } from "@/components/apps/registry";
import SideBarApp from "@/components/base/SideBarApp";
import { getIconPath } from "@/lib/utils/icons";

export default function SideBar() {
    const { windows, focusedWindowId, openWindow, minimizeWindow, focusWindow } = useWMStore();
    const [orderedAppIds, setOrderedAppIds] = useState<string[]>([]);
    const [draggingId, setDraggingId] = useState<string | null>(null);

    // Initialize ordered apps from defaultApps
    useEffect(() => {
        const favourites = defaultApps.filter(app => app.favourite).map(app => app.id);
        setOrderedAppIds(prev => {
            if (prev.length === 0) return favourites;
            return prev;
        });
    }, []);

    // Merge running apps into the view
    const runningAppIds = Object.values(windows).map(w => w.appId);
    const runningNonFavs = defaultApps.filter(app => !app.favourite && runningAppIds.includes(app.id)).map(a => a.id);

    const allAppsToRender = [...orderedAppIds];
    runningNonFavs.forEach(id => {
        if (!allAppsToRender.includes(id)) {
            allAppsToRender.push(id);
        }
    });

    const uniqueApps = Array.from(new Set(allAppsToRender));

    const finalDisplayList = uniqueApps.filter(id => {
        const app = defaultApps.find(a => a.id === id);
        if (!app) return false;
        if (app.favourite) return true;
        return runningAppIds.includes(id);
    });

    const handleAppClick = (appId: string) => {
        const app = defaultApps.find(a => a.id === appId);
        if (!app) return;

        const appWindows = Object.values(windows).filter(w => w.appId === appId);

        if (appWindows.length > 0) {
            const focusedWin = appWindows.find(w => w.id === focusedWindowId);
            if (focusedWin) {
                minimizeWindow(focusedWin.id);
            } else {
                focusWindow(appWindows[0].id);
            }
        } else {
            const windowId = app.singleton ? app.id : `${app.id}-${Date.now()}`;
            openWindow(windowId, app.id, app.name, app.icon);
        }
    }

    // Drag Logic
    const handleDragStart = (e: React.DragEvent, id: string) => {
        setDraggingId(id);
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDragOver = (e: React.DragEvent, targetId: string) => {
        e.preventDefault();
        if (!draggingId || draggingId === targetId) return;

        const currentIndex = orderedAppIds.indexOf(draggingId);
        const targetIndex = orderedAppIds.indexOf(targetId);

        if (currentIndex !== -1 && targetIndex !== -1) {
             const newOrder = [...orderedAppIds];
             newOrder.splice(currentIndex, 1);
             newOrder.splice(targetIndex, 0, draggingId);
             setOrderedAppIds(newOrder);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDraggingId(null);
    };

    return (
        <div
            className={"absolute transform duration-300 select-none z-50 left-0 top-8 h-[calc(100%-2rem)] w-auto flex flex-col justify-start items-center bg-black bg-opacity-95 border-r border-white border-opacity-5 py-2"}
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
        >
            {finalDisplayList.map(id => {
                const app = defaultApps.find(a => a.id === id);
                if (!app) return null;

                const appWindows = Object.values(windows).filter(w => w.appId === app.id);
                const isOpen = appWindows.length > 0;
                const isFocused = appWindows.some(w => w.id === focusedWindowId);

                return (
                    <div
                        key={app.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, app.id)}
                        onDragOver={(e) => handleDragOver(e, app.id)}
                        onDrop={handleDrop}
                        className="transition-transform duration-200"
                    >
                        <SideBarApp
                            id={app.id}
                            title={app.name}
                            icon={getIconPath(app.icon)}
                            isOpen={isOpen}
                            isFocused={isFocused}
                            openApp={() => handleAppClick(app.id)}
                        />
                    </div>
                )
            })}
        </div>
    )
}
