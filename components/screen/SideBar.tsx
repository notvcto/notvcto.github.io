"use client";
import React, { useState, useEffect } from "react";
import { useWMStore } from "@/lib/store/wm";
import { defaultApps } from "@/components/apps/registry";
import SideBarApp from "@/components/base/SideBarApp";

export default function SideBar() {
    const { windows, focusedWindowId, openWindow, minimizeWindow, focusWindow } = useWMStore();
    const [orderedAppIds, setOrderedAppIds] = useState<string[]>([]);
    const [draggingId, setDraggingId] = useState<string | null>(null);

    // Initialize ordered apps from defaultApps
    useEffect(() => {
        // Only init if empty (on mount), but we also want to respect running non-favs appearing.
        // So we need to merge the persisted/default order with any new running apps.

        const favourites = defaultApps.filter(app => app.favourite).map(app => app.id);
        setOrderedAppIds(prev => {
            if (prev.length === 0) return favourites;
            return prev;
        });
    }, []);

    // Merge running apps into the view
    const runningAppIds = Object.values(windows).map(w => w.appId);
    const runningNonFavs = defaultApps.filter(app => !app.favourite && runningAppIds.includes(app.id)).map(a => a.id);

    // Combine ordered known apps + new running apps
    // We want to keep the user's custom order for the ones they have.
    // And append any new running apps that aren't in the list yet.
    const allAppsToRender = [...orderedAppIds];
    runningNonFavs.forEach(id => {
        if (!allAppsToRender.includes(id)) {
            allAppsToRender.push(id);
        }
    });

    // Remove duplicates if any (though logic above tries to avoid)
    const uniqueApps = Array.from(new Set(allAppsToRender));

    // We should filter out any IDs that shouldn't be there?
    // E.g. if a non-fav app is closed, it should disappear from dock.
    // orderedAppIds currently keeps favourites.

    const finalDisplayList = uniqueApps.filter(id => {
        const app = defaultApps.find(a => a.id === id);
        if (!app) return false;
        if (app.favourite) return true;
        // If not favourite, only show if running
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
        // Ghost image usually handled by browser, but we can set it if needed.
    };

    const handleDragOver = (e: React.DragEvent, targetId: string) => {
        e.preventDefault(); // Necessary to allow dropping
        if (!draggingId || draggingId === targetId) return;

        // Simple reorder: swap draggingId to the position of targetId
        // But we want to reorder in `orderedAppIds`.
        // Be careful not to cause too many re-renders.
        // Maybe only do it on Drop? Or do it live? Live is better for UX.

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
            className={"absolute transform duration-300 select-none z-50 left-0 top-[30px] h-[calc(100%-30px)] w-auto flex flex-col justify-start items-center bg-ub-grey bg-opacity-90 border-r border-white border-opacity-10 py-2"}
            onPointerDown={(e) => e.stopPropagation()} // Stop clickthrough to Desktop
            onMouseDown={(e) => e.stopPropagation()} // Stop clickthrough to Desktop
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
                            icon={app.icon}
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
