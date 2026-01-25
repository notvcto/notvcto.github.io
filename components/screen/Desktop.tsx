"use client";
import React, { useEffect, useState, useRef } from "react";
import BackgroundImage from "../util components/background-image";
import Navbar from "./navbar";
import SideBar from "./SideBar";
import Window from "@/components/base/Window";
import UbuntuApp from "@/components/base/UbuntuApp";
import LockScreen from "./lock_screen";
import BootingScreen from "./booting_screen";
import DesktopMenu from "@/components/context menus/DesktopMenu";
import DefaultMenu from "@/components/context menus/DefaultMenu";
import { useWMStore } from "@/lib/store/wm";
import { useSettingsStore } from "@/lib/store/settings";
import { useFileSystemStore, resolvePath } from "@/lib/store/filesystem";
import { apps as appRegistry } from "@/components/apps/registry";
import Draggable from "react-draggable";

interface DesktopProps {
    blogPosts?: any[];
    achievements?: any[];
}

export default function Desktop({ blogPosts, achievements }: DesktopProps) {
    const { windows, openWindow, focusedWindowId, isLocked, setLocked } = useWMStore();
    const { wallpaper } = useSettingsStore();
    const { nodes, rootId, updateMetadata, init: initFS, createDir } = useFileSystemStore();
    const [booting, setBooting] = useState(true);

    // Context Menu State
    const [contextMenu, setContextMenu] = useState({
        type: 'none' as 'none' | 'desktop' | 'default',
        x: 0,
        y: 0
    });

    // Selection State
    const [selection, setSelection] = useState<{
        active: boolean,
        startX: number,
        startY: number,
        currX: number,
        currY: number
    } | null>(null);
    const [selectedIconIds, setSelectedIconIds] = useState<string[]>([]);
    const desktopRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        initFS();

        // Boot logic
        if (typeof window !== "undefined") {
            const hasBooted = localStorage.getItem('booting_screen');
            if (hasBooted === 'false') {
                setBooting(false);
            } else {
                localStorage.setItem('booting_screen', 'false');
                setTimeout(() => setBooting(false), 2000);
            }
        }
    }, [initFS]);

    // Close context menu on click
    useEffect(() => {
        const handleClick = () => setContextMenu({ type: 'none', x: 0, y: 0 });
        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, []);

    const desktopNode = resolvePath('/home/user/Desktop', nodes, rootId);
    const desktopIconIds = desktopNode && desktopNode.type === 'dir' ? desktopNode.children : [];

    const snapToGrid = (x: number, y: number) => {
        const cellW = 100;
        const cellH = 100;

        // Snapping logic:
        // Original logic: x = Math.round((x - 20) / cellW) * cellW + 20;
        // y = Math.round((y - 40) / cellH) * cellH + 40;

        let snX = Math.round((x - 20) / cellW) * cellW + 20;
        let snY = Math.round((y - 40) / cellH) * cellH + 40;

        if (snX < 0) snX = 20;
        if (snY < 0) snY = 40;

        return { x: snX, y: snY };
    }

    const handleIconDrop = (id: string, data: {x: number, y: number}) => {
         const snapped = snapToGrid(data.x, data.y);
         updateMetadata(id, { position: snapped });

         // If multiple selected, move them all?
         // For now, simplify to single icon drag updates.
    }

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        // Determine if clicked on desktop or app?
        // Actually, if we click on an app, propagation stops?
        // Let's rely on event target.

        // Desktop Area
        setContextMenu({
            type: 'desktop',
            x: e.clientX,
            y: e.clientY
        });
    }

    const openApp = (nodeId: string) => {
        const node = nodes[nodeId];
        if (!node) return;

        if (node.type === 'dir') {
             const fmApp = appRegistry['file-manager'];
             if (fmApp) {
                 openWindow('file-manager', 'file-manager', fmApp.name, fmApp.icon);
             }
             return;
        }

        if (node.name.endsWith('.app')) {
             const appName = node.name.replace('.app', '');
             const foundApp = Object.values(appRegistry).find(app => app.name === appName);

             if (foundApp) {
                 const windowId = foundApp.singleton ? foundApp.id : `${foundApp.id}-${Date.now()}`;
                 openWindow(windowId, foundApp.id, foundApp.name, foundApp.icon);
             } else {
                 console.warn(`App ${appName} not found`);
             }
        }
    }

    // --- Selection Logic ---
    const handleMouseDown = (e: React.MouseEvent) => {
        if (e.button !== 0) return; // Only left click
        if ((e.target as HTMLElement).id !== "monitor-screen") return; // Only on background

        setSelection({
            active: true,
            startX: e.clientX,
            startY: e.clientY,
            currX: e.clientX,
            currY: e.clientY
        });
        setSelectedIconIds([]);
    }

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!selection || !selection.active) return;

        setSelection(prev => prev ? ({ ...prev, currX: e.clientX, currY: e.clientY }) : null);

        // Calculate intersection with icons
        // Need refs for icons? Or assume positions from store?
        // Use store metadata positions + standard size (100x100)

        const selLeft = Math.min(selection.startX, e.clientX);
        const selTop = Math.min(selection.startY, e.clientY);
        const selRight = Math.max(selection.startX, e.clientX);
        const selBottom = Math.max(selection.startY, e.clientY);

        const newSelectedIds: string[] = [];

        desktopIconIds.forEach(id => {
            const node = nodes[id];
            const pos = node.metadata?.position || { x: 20, y: 40 };
            const iconW = 90; // Approx
            const iconH = 90;

            // Intersection test
            if (selLeft < pos.x + iconW && selRight > pos.x &&
                selTop < pos.y + iconH && selBottom > pos.y) {
                newSelectedIds.push(id);
            }
        });

        setSelectedIconIds(newSelectedIds);
    }

    const handleMouseUp = () => {
        if (selection) {
            setSelection(null);
        }
    }

    const addNewFolder = () => {
        if (desktopNode) {
            createDir(desktopNode.id, 'New Folder');
        }
    }

    return (
        <div
            className="h-full w-full absolute overflow-hidden bg-transparent select-none"
            id="monitor-screen"
            onContextMenu={handleContextMenu}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            ref={desktopRef}
        >
             <LockScreen
                isLocked={isLocked}
                bgImgName={wallpaper}
                unLockScreen={() => setLocked(false)}
             />
             <BootingScreen
                visible={booting}
                isShutDown={false}
                turnOn={() => setBooting(false)}
             />

             <BackgroundImage img={wallpaper} />
             <Navbar />
             <SideBar />

             {/* Selection Box */}
             {selection && selection.active && (
                 <div
                    className="absolute border border-ub-orange bg-ub-orange bg-opacity-20 z-50"
                    style={{
                        left: Math.min(selection.startX, selection.currX),
                        top: Math.min(selection.startY, selection.currY),
                        width: Math.abs(selection.currX - selection.startX),
                        height: Math.abs(selection.currY - selection.startY)
                    }}
                 />
             )}

             {/* Desktop Icons */}
             <div className="absolute w-full h-full top-0 left-0 z-10 pointer-events-none">
                 {desktopIconIds.map(nodeId => {
                     const node = nodes[nodeId];
                     if (!node) return null;

                     const pos = node.metadata?.position || { x: 20, y: 40 };

                     let icon = "./themes/Yaru/system/unknown.png";
                     let name = node.name;

                     if (node.type === 'dir') {
                         icon = "./themes/Yaru/system/folder.png";
                     } else if (name.endsWith('.app')) {
                         const appName = name.replace('.app', '');
                         const foundApp = Object.values(appRegistry).find(app => app.name === appName);
                         if (foundApp) icon = foundApp.icon;
                     } else if (name.endsWith('.txt')) {
                         icon = "./themes/Yaru/mimetypes/text-x-generic.png";
                     }

                     return (
                         <div key={nodeId} className="pointer-events-auto">
                            <Draggable
                                defaultPosition={pos}
                                position={pos} // Controlled position for snapping visualization? No, use default for drag.
                                // Actually, if we want snap-on-drop, we let it drag freely then update store.
                                // But if we select multiple...
                                onStop={(e, data) => handleIconDrop(nodeId, data)}
                                onStart={(e) => {
                                    e.stopPropagation();
                                    if (!selectedIconIds.includes(nodeId)) {
                                        setSelectedIconIds([nodeId]);
                                    }
                                }}
                            >
                                <div className="absolute">
                                    <UbuntuApp
                                        id={nodeId}
                                        name={name}
                                        icon={icon}
                                        openApp={() => openApp(nodeId)}
                                        selected={selectedIconIds.includes(nodeId)}
                                    />
                                </div>
                            </Draggable>
                         </div>
                     )
                 })}
             </div>

             {/* Windows */}
             {Object.values(windows).map(win => {
                const app = appRegistry[win.appId];
                if (!app) return null;

                let extraProps = {};
                if (win.appId === 'blog') extraProps = { blogPosts };
                if (win.appId === 'achievements') extraProps = { achievements };

                return (
                    <Window
                        key={win.id}
                        id={win.id}
                        title={win.title}
                        minimized={win.minimized}
                        maximized={win.maximized}
                        focused={win.id === focusedWindowId}
                        screen={app.entry}
                        componentProps={{ ...win.componentProps, ...extraProps }}
                    />
                )
             })}

             <DesktopMenu
                active={contextMenu.type === 'desktop'}
                position={{ x: contextMenu.x, y: contextMenu.y }}
                addNewFolder={addNewFolder}
                openSettings={() => openWindow('settings', 'settings', 'Settings', './themes/MoreWaita/apps/settings.svg')}
             />

             <DefaultMenu
                active={contextMenu.type === 'default'}
                position={{ x: contextMenu.x, y: contextMenu.y }}
             />
        </div>
    )
}
