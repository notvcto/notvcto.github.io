"use client";
import React, { useState, useEffect } from "react";
import { useWMStore } from "@/lib/store/wm";
import { defaultApps } from "@/components/apps/registry";
import SideBarApp from "@/components/base/SideBarApp";
import { getIconPath } from "@/lib/utils/icons";
import { useBlockDevices } from "@/lib/hooks/use-block-devices";

interface SideBarProps {
    toggleShowApps: () => void;
    showAppsActive: boolean;
}

export default function SideBar({ toggleShowApps, showAppsActive }: SideBarProps) {
    const { windows, focusedWindowId, openWindow, minimizeWindow, focusWindow } = useWMStore();
    const { mount } = useBlockDevices();
    const [orderedFavIds, setOrderedFavIds] = useState<string[]>([]);
    const [draggingId, setDraggingId] = useState<string | null>(null);

    // Initialize favorites
    useEffect(() => {
        const favourites = defaultApps.filter(app => app.favourite).map(app => app.id);
        setOrderedFavIds(prev => {
            if (prev.length === 0) return favourites;
            return prev;
        });
    }, []);

    // Identify running non-favorites
    const runningAppIds = Object.values(windows).map(w => w.appId);
    const runningNonFavs = Array.from(new Set(runningAppIds.filter(id => !orderedFavIds.includes(id))));

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

    // Drag Logic (Only for favorites reordering for now)
    const handleDragStart = (e: React.DragEvent, id: string) => {
        setDraggingId(id);
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDragOver = (e: React.DragEvent, targetId: string) => {
        e.preventDefault();
        if (!draggingId || draggingId === targetId) return;
        if (!orderedFavIds.includes(targetId) || !orderedFavIds.includes(draggingId)) return; // Only reorder favorites

        const currentIndex = orderedFavIds.indexOf(draggingId);
        const targetIndex = orderedFavIds.indexOf(targetId);

        if (currentIndex !== -1 && targetIndex !== -1) {
             const newOrder = [...orderedFavIds];
             newOrder.splice(currentIndex, 1);
             newOrder.splice(targetIndex, 0, draggingId);
             setOrderedFavIds(newOrder);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDraggingId(null);
    };

    const renderAppItem = (id: string, isFav: boolean) => {
        const app = defaultApps.find(a => a.id === id);
        if (!app) return null;

        const appWindows = Object.values(windows).filter(w => w.appId === app.id);
        const isOpen = appWindows.length > 0;
        const isFocused = appWindows.some(w => w.id === focusedWindowId);

        return (
            <div
                key={app.id}
                draggable={isFav}
                onDragStart={(e) => isFav && handleDragStart(e, app.id)}
                onDragOver={(e) => isFav && handleDragOver(e, app.id)}
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
        );
    };

    return (
        <div
            className={"absolute transform duration-300 select-none z-50 left-0 top-8 h-[calc(100%-2rem)] w-auto flex flex-col justify-start items-center bg-black bg-opacity-65 backdrop-blur-3xl border-r border-white border-opacity-10 py-2"}
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
        >
            {/* Favorites */}
            {orderedFavIds.map(id => renderAppItem(id, true))}

            {/* Running Non-Favorites */}
            {runningNonFavs.map(id => renderAppItem(id, false))}

            {/* Separator between Apps and Volumes */}
            <div className="w-5 h-[1px] bg-white bg-opacity-20 my-2 rounded-full" />

            {/* Volumes (CDROM & Trash) */}
             <div className="transition-transform duration-200">
                <SideBarApp
                    id="cdrom"
                    title="CD-ROM"
                    icon={getIconPath("cdrom")}
                    isOpen={false}
                    isFocused={false}
                    openApp={() => {
                        mount('/dev/sr0');
                    }}
                />
            </div>

             <div className="transition-transform duration-200">
                <SideBarApp
                    id="trash"
                    title="Trash"
                    icon={getIconPath("user-trash")}
                    isOpen={false}
                    isFocused={false}
                    openApp={() => {
                         // TODO: Open trash
                    }}
                />
            </div>

            {/* Spacer to push Show Apps to bottom */}
            <div className="flex-grow" />

            {/* Show Apps Button */}
            <div className="transition-transform duration-200 mb-1">
                <SideBarApp
                    id="show-apps"
                    title="Show Applications"
                    icon={getIconPath("ubuntu-logo")}
                    isOpen={showAppsActive}
                    isFocused={false}
                    openApp={toggleShowApps}
                />
            </div>
        </div>
    )
}
