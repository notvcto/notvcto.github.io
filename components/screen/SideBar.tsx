"use client";
import React from "react";
import { useWMStore } from "@/lib/store/wm";
import { defaultApps } from "@/components/apps/registry";
import SideBarApp from "@/components/base/SideBarApp";

export default function SideBar() {
    const { windows, focusedWindowId, openWindow, minimizeWindow, focusWindow } = useWMStore();

    const favourites = defaultApps.filter(app => app.favourite);
    const runningAppIds = Object.values(windows).map(w => w.appId);

    const runningNonFavs = defaultApps.filter(app => !app.favourite && runningAppIds.includes(app.id));

    const sideBarApps = [...favourites, ...runningNonFavs];

    const handleAppClick = (app: any) => {
        const appWindows = Object.values(windows).filter(w => w.appId === app.id);

        if (appWindows.length > 0) {
            const focusedWin = appWindows.find(w => w.id === focusedWindowId);
            if (focusedWin) {
                minimizeWindow(focusedWin.id);
            } else {
                // Focus the most recently active one?
                // For simplicity, focus the first one found (or last if we sorted).
                focusWindow(appWindows[0].id);
            }
        } else {
            // Launch
            // For singletons, we use app.id as window ID to enforce uniqueness in store (if logic allows)
            // But store.openWindow focuses if ID exists.
            // So if we pass app.id, it works as singleton.
            // If not singleton, we generate new ID.

            // However, registry `singleton` property should dictate this.
            // If app.singleton is true, use app.id.
            // If false, use uuid.

            // Actually, Terminal is false, so we want new terminals.
            // But if I click Terminal icon while one is open, Dock behavior usually is "Show Windows" or "Focus".
            // It doesn't spawn a new one unless I right click -> New Window.
            // So default click behavior on Dock is ALWAYS Focus/Minimize.
            // Spawning new instance via Dock usually requires middle click or context menu.

            // So my logic above (if appWindows.length > 0 -> Focus/Min) handles this correctly for Dock.
            // The "Spawn" only happens if length == 0.

            // So when DO we spawn multiple terminals?
            // From Desktop Icon? Or Terminal command?

            // For now, let's assume Dock Launch spawns first instance.
            // And use uuid for non-singletons just in case we support multiple later.
            // But if I use uuid, the ID will be different each time.

            const windowId = app.singleton ? app.id : `${app.id}-${Date.now()}`;
            openWindow(windowId, app.id, app.name, app.icon);
        }
    }

    return (
        <>
            <div
                 className={"absolute transform duration-300 select-none z-40 left-0 top-1/2 -translate-y-1/2 ml-2 h-auto w-auto flex flex-col justify-start items-center rounded-xl bg-ub-cool-grey bg-opacity-40 backdrop-blur-3xl border-white border-opacity-10 shadow-2xl py-2"}
            >
                {sideBarApps.map(app => {
                    const appWindows = Object.values(windows).filter(w => w.appId === app.id);
                    const isOpen = appWindows.length > 0;
                    const isFocused = appWindows.some(w => w.id === focusedWindowId);

                    return (
                        <SideBarApp
                            key={app.id}
                            id={app.id}
                            title={app.name}
                            icon={app.icon}
                            isOpen={isOpen}
                            isFocused={isFocused}
                            openApp={() => handleAppClick(app)}
                        />
                    )
                })}
            </div>
        </>
    )
}
