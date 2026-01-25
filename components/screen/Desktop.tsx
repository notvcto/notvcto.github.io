"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import BackgroundImage from "../util components/background-image";
import Navbar from "./navbar";
import SideBar from "./SideBar";
import Window from "@/components/base/Window";
import UbuntuApp from "@/components/base/UbuntuApp";
import LockScreen from "./lock_screen";
import BootingScreen from "./booting_screen";
import DesktopMenu from "../context menus/desktop-menu";
import DefaultMenu from "../context menus/default";
import { useWMStore } from "@/lib/store/wm";
import { useSettingsStore } from "@/lib/store/settings";
import { useFileSystemStore, resolvePath } from "@/lib/store/filesystem";
import { apps as appRegistry } from "@/components/apps/registry";
import Draggable, { DraggableData, DraggableEvent } from "react-draggable";

interface DesktopProps {
    blogPosts?: any[];
    achievements?: any[];
}

export default function Desktop({ blogPosts, achievements }: DesktopProps) {
    const { windows, openWindow, focusedWindowId, isLocked, setLocked } = useWMStore();
    const { wallpaper } = useSettingsStore();
    const { nodes, rootId, updateMetadata, init: initFS, createDir } = useFileSystemStore();
    const [booting, setBooting] = useState(true);
    const [contextMenu, setContextMenu] = useState<{ show: boolean; x: number; y: number; type: 'desktop' | 'default' }>({ show: false, x: 0, y: 0, type: 'default' });
    const [selectedIconIds, setSelectedIconIds] = useState<string[]>([]);
    const [selectionBox, setSelectionBox] = useState<{ start: { x: number, y: number }, current: { x: number, y: number } } | null>(null);
    const [dragPositions, setDragPositions] = useState<Record<string, {x: number, y: number}> | null>(null);
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

    const desktopNode = resolvePath('/home/user/Desktop', nodes, rootId);
    const desktopIconIds = desktopNode && desktopNode.type === 'dir' ? desktopNode.children : [];

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
             const foundApp = Object.values(appRegistry).find(app => app.id === appName || app.name === appName);

             if (foundApp) {
                 const windowId = foundApp.singleton ? foundApp.id : `${foundApp.id}-${Date.now()}`;
                 openWindow(windowId, foundApp.id, foundApp.name, foundApp.icon);
             } else {
                 console.warn(`App ${appName} not found`);
             }
        }
    }

    const openAppById = (appId: string) => {
        const app = appRegistry[appId];
        if (app) {
            const windowId = app.singleton ? app.id : `${app.id}-${Date.now()}`;
            openWindow(windowId, app.id, app.name, app.icon);
        }
    }

    const addNewFolder = () => {
        if (desktopNode) {
            createDir(desktopNode.id, 'New Folder');
        }
    }

    // Drag Logic
    const handleDragStart = (id: string, e: DraggableEvent) => {
        // If the item isn't selected, select it (and deselect others)
        let currentSelection = selectedIconIds;
        if (!selectedIconIds.includes(id)) {
            // Check for ctrl/shift? Usually drag overrides modifier selection logic or assumes "new selection" if not already selected.
            // For simplicity: dragging an unselected item selects it exclusively.
            currentSelection = [id];
            setSelectedIconIds(currentSelection);
        }

        const initialPositions: Record<string, {x: number, y: number}> = {};
        currentSelection.forEach(selId => {
            const node = nodes[selId];
            if (node) {
                initialPositions[selId] = node.metadata?.position || { x: 20, y: 40 };
            }
        });
        setDragPositions(initialPositions);
    };

    const handleDrag = (id: string, e: DraggableEvent, data: DraggableData) => {
        if (!dragPositions) return;

        const { deltaX, deltaY } = data;
        const newPositions = { ...dragPositions };

        Object.keys(newPositions).forEach(key => {
            newPositions[key] = {
                x: newPositions[key].x + deltaX,
                y: newPositions[key].y + deltaY
            };
        });

        setDragPositions(newPositions);
    };

    const handleDragStop = (id: string, e: DraggableEvent, data: DraggableData) => {
        if (!dragPositions) return;

        // Snap and commit
        Object.entries(dragPositions).forEach(([key, pos]) => {
            const snappedX = Math.round(pos.x / 100) * 100;
            const snappedY = Math.round(pos.y / 100) * 100;
            updateMetadata(key, { position: { x: snappedX, y: snappedY } });
        });

        setDragPositions(null);
    };

    // Context Menu Handler
    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        setContextMenu({ show: true, x: e.pageX, y: e.pageY, type: 'desktop' });
    };

    const handleClick = () => {
        if (contextMenu.show) setContextMenu({ ...contextMenu, show: false });
    };

    // Selection Box Logic
    const handlePointerDown = (e: React.PointerEvent) => {
        if (e.button !== 0) return;

        // Prevent selection box when clicking on interactive elements
        if ((e.target as HTMLElement).closest('.react-draggable')) return;

        if (!e.shiftKey && !e.ctrlKey) {
            setSelectedIconIds([]);
        }

        if (contextMenu.show) {
            setContextMenu({ ...contextMenu, show: false });
            return;
        }

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

        const left = Math.min(selectionBox.start.x, newCurrent.x);
        const top = Math.min(selectionBox.start.y, newCurrent.y);
        const right = Math.max(selectionBox.start.x, newCurrent.x);
        const bottom = Math.max(selectionBox.start.y, newCurrent.y);

        const newSelected: string[] = [];

        desktopIconIds.forEach(id => {
            const node = nodes[id];
            if (!node) return;
            const pos = node.metadata?.position || { x: 20, y: 40 };
            const iconW = 100;
            const iconH = 100;

            if (
                left < pos.x + iconW &&
                right > pos.x &&
                top < pos.y + iconH &&
                bottom > pos.y
            ) {
                newSelected.push(id);
            }
        });

        setSelectedIconIds(newSelected);
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        if (selectionBox) {
            setSelectionBox(null);
            (e.currentTarget as Element).releasePointerCapture(e.pointerId);
        }
    };

    return (
        <div
            className="h-full w-full absolute overflow-hidden bg-transparent select-none"
            id="monitor-screen"
            onContextMenu={handleContextMenu}
            onClick={handleClick}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
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
                turnOn={() => {
                    setBooting(false);
                }}
             />

             <BackgroundImage img={wallpaper} />
             <Navbar />
             <SideBar />

             {selectionBox && (
                <div
                    className="absolute border border-ub-orange bg-ub-orange bg-opacity-20 z-50 pointer-events-none"
                    style={{
                        left: Math.min(selectionBox.start.x, selectionBox.current.x),
                        top: Math.min(selectionBox.start.y, selectionBox.current.y),
                        width: Math.abs(selectionBox.start.x - selectionBox.current.x),
                        height: Math.abs(selectionBox.start.y - selectionBox.current.y),
                    }}
                />
             )}

             <DesktopMenu
                active={contextMenu.show && contextMenu.type === 'desktop'}
                openApp={openAppById}
                addNewFolder={addNewFolder}
             />
             <DefaultMenu
                active={contextMenu.show && contextMenu.type === 'default'}
             />
             {contextMenu.show && (
                 <style>{`
                    #desktop-menu, #default-menu {
                        top: ${contextMenu.y}px;
                        left: ${contextMenu.x}px;
                    }
                 `}</style>
             )}

             <div className="absolute w-full h-full top-0 left-0 z-10 pointer-events-none">
                 {desktopIconIds.map(nodeId => {
                     const node = nodes[nodeId];
                     if (!node) return null;

                     // Determine position: Dragging state -> Metadata -> Default
                     const pos = dragPositions?.[nodeId] || node.metadata?.position || { x: 20, y: 40 };

                     let icon = "./themes/Yaru/system/unknown.png";
                     let displayName = node.name;

                     if (node.type === 'dir') {
                         icon = "./themes/Yaru/system/folder.png";
                     } else if (node.name.endsWith('.app')) {
                         const appName = node.name.replace('.app', '');
                         const foundApp = Object.values(appRegistry).find(app => app.id === appName || app.name === appName);
                         if (foundApp) {
                             icon = foundApp.icon;
                             displayName = foundApp.name;
                         }
                     } else if (node.name.endsWith('.txt')) {
                         icon = "./themes/Yaru/mimetypes/text-x-generic.png";
                     }

                     const isSelected = selectedIconIds.includes(nodeId);

                     return (
                         <Draggable
                            key={nodeId}
                            position={pos}
                            onStart={(e, data) => handleDragStart(nodeId, e)}
                            onDrag={(e, data) => handleDrag(nodeId, e, data)}
                            onStop={(e, data) => handleDragStop(nodeId, e, data)}
                         >
                             <div
                                className="absolute pointer-events-auto"
                                onPointerDown={(e) => {
                                    e.stopPropagation();
                                }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (e.ctrlKey || e.shiftKey) {
                                        if (isSelected) setSelectedIconIds(ids => ids.filter(id => id !== nodeId));
                                        else setSelectedIconIds(ids => [...ids, nodeId]);
                                    } else {
                                        setSelectedIconIds([nodeId]);
                                    }
                                }}
                             >
                                 <UbuntuApp
                                    id={nodeId}
                                    name={displayName}
                                    icon={icon}
                                    openApp={() => openApp(nodeId)}
                                    selected={isSelected}
                                 />
                             </div>
                         </Draggable>
                     )
                 })}
             </div>

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
        </div>
    )
}
