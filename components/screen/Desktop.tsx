"use client";
import React, { useEffect, useState, useRef, useMemo } from "react";
import BackgroundImage from "../util components/background-image";
import Navbar from "./navbar";
import SideBar from "./SideBar";
import AllApplications from "./AllApplications";
import Window from "@/components/base/Window";
import UbuntuApp from "@/components/base/UbuntuApp";
import LockScreen from "./lock_screen";
import BootingScreen from "./booting_screen";
import DesktopMenu from "../context menus/desktop-menu";
import DefaultMenu from "../context menus/default";
import { useWMStore } from "@/lib/store/wm";
import { useSettingsStore } from "@/lib/store/settings";
import { useFS } from "@/lib/fs";
import { apps as appRegistry, defaultApps } from "@/components/apps/registry";
import Draggable, { DraggableData, DraggableEvent } from "react-draggable";
import { calculateLayout, GRID_SIZE, TOP_OFFSET } from "@/lib/utils/desktop";
import { getIconPath } from "@/lib/utils/icons";

interface DesktopProps {
    blogPosts?: any[];
    achievements?: any[];
}

export default function Desktop({ blogPosts, achievements }: DesktopProps) {
    const { windows, openWindow, focusedWindowId, isLocked, setLocked, updateViewportSize } = useWMStore();
    const { wallpaper } = useSettingsStore();
    const fs = useFS();

    const [booting, setBooting] = useState(true);
    const [showApps, setShowApps] = useState(false);
    const [contextMenu, setContextMenu] = useState<{ show: boolean; x: number; y: number; type: 'desktop' | 'default' }>({ show: false, x: 0, y: 0, type: 'default' });
    const [selectedIconIds, setSelectedIconIds] = useState<string[]>([]);
    const [selectionBox, setSelectionBox] = useState<{ start: { x: number, y: number }, current: { x: number, y: number } } | null>(null);
    const [dragPositions, setDragPositions] = useState<Record<string, {x: number, y: number}> | null>(null);
    const desktopRef = useRef<HTMLDivElement>(null);
    const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

    const desktopPath = '/home/user/Desktop';
    // Ensure desktop exists or init
    useEffect(() => {
        fs.init();
        if (!fs.exists(desktopPath)) {
            fs.mkdir(desktopPath); // Should be created by init, but safety
        }

        // Boot logic
        if (typeof window !== "undefined") {
            const hasBooted = localStorage.getItem('booting_screen');
            if (hasBooted === 'false') {
                setBooting(false);
            } else {
                // Do not set localStorage here immediately to prevent double-render issues in dev
                // Wait for the timeout
                setTimeout(() => {
                    setBooting(false);
                    localStorage.setItem('booting_screen', 'false');
                }, 2000);
            }
        }
    }, []);

    useEffect(() => {
        // Handle resize
        const updateSize = () => {
            setWindowSize({ width: window.innerWidth, height: window.innerHeight });
            updateViewportSize(window.innerWidth, window.innerHeight);
        };
        // Initial
        updateSize();

        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, []);

    // Delete Key Listener
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Delete' && selectedIconIds.length > 0) {
                selectedIconIds.forEach(id => {
                    const path = fs.absolute(id);
                    if (path) fs.trash(path);
                });
                setSelectedIconIds([]);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedIconIds]); // fs is stable from hook (usually, or I can add it)

    // Get desktop icons
    const desktopIcons = fs.exists(desktopPath) ? fs.list(desktopPath) : [];

    // Calculate Layout
    const layout = useMemo(() => {
        if (windowSize.width === 0) return {};
        return calculateLayout(windowSize.width, windowSize.height, desktopIcons);
    }, [windowSize, desktopIcons]);

    const openApp = (nodeId: string) => {
        const path = fs.absolute(nodeId);
        if (!path) return;

        const node = fs.stat(path);
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
            setShowApps(false);
        }
    }

    const addNewFolder = () => {
        // fs.mkdir takes full path.
        // We want 'New Folder'. If it exists?
        // fs.mkdir implementation doesn't return ID or handle duplication gracefully (logs error).
        // Phase 1: simple try.
        fs.mkdir(`${desktopPath}/New Folder`);
    }

    // Drag Logic
    const handleDragStart = (id: string, e: DraggableEvent) => {
        let currentSelection = selectedIconIds;
        if (!selectedIconIds.includes(id)) {
            currentSelection = [id];
            setSelectedIconIds(currentSelection);
        }

        const initialPositions: Record<string, {x: number, y: number}> = {};
        currentSelection.forEach(selId => {
            // Use layout position as visual start
            const pos = layout[selId];
            if (pos) {
                initialPositions[selId] = pos;
            }
        });
        setDragPositions(initialPositions);
    };

    const handleDrag = (id: string, e: DraggableEvent, data: DraggableData) => {
        if (!dragPositions) return;

        const { deltaX, deltaY } = data;
        const newPositions = { ...dragPositions };

        Object.keys(newPositions).forEach(key => {
            // Clamp during drag?
            // The spec says "Clamp positions to ... during drag and on window resize".
            // If we clamp here, dragging against the wall stops.

            let newX = newPositions[key].x + deltaX;
            let newY = newPositions[key].y + deltaY;

            // Note: If multiple items selected, we might want to clamp them as a group or individually.
            // Individually is safer to prevent loss.
            // But we don't want to break relative positions if one hits the wall.
            // For now, individual clamping (like Windows) or free drag but clamp on stop.
            // "Dragging must: Clamp positions to..."
            // Let's clamp individually for safety.

            newX = Math.max(0, Math.min(newX, windowSize.width - GRID_SIZE));
            newY = Math.max(TOP_OFFSET, Math.min(newY, windowSize.height - GRID_SIZE));

            newPositions[key] = { x: newX, y: newY };
        });

        setDragPositions(newPositions);
    };

    const handleDragStop = (id: string, e: DraggableEvent, data: DraggableData) => {
        if (!dragPositions) return;

        // Snap and commit
        Object.entries(dragPositions).forEach(([key, pos]) => {
            const snappedX = Math.round(pos.x / GRID_SIZE) * GRID_SIZE;
            const snappedY = Math.round((pos.y - TOP_OFFSET) / GRID_SIZE) * GRID_SIZE + TOP_OFFSET;

            // Clamp on stop (Critical)
            const clampedX = Math.max(0, Math.min(snappedX, windowSize.width - GRID_SIZE));
            const clampedY = Math.max(TOP_OFFSET, Math.min(snappedY, windowSize.height - GRID_SIZE));

            const path = fs.absolute(key);
            if (path) {
                fs.updateMetadata(path, { position: { x: clampedX, y: clampedY } });
            }
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
        if ((e.target as HTMLElement).closest('#desktop-menu')) return;
        if ((e.target as HTMLElement).closest('#default-menu')) return;

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

        desktopIcons.forEach(node => {
            const pos = layout[node.id] || { x: 0, y: 0 };
            const iconW = GRID_SIZE;
            const iconH = GRID_SIZE;

            if (
                left < pos.x + iconW &&
                right > pos.x &&
                top < pos.y + iconH &&
                bottom > pos.y
            ) {
                newSelected.push(node.id);
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
             <SideBar toggleShowApps={() => setShowApps(!showApps)} showAppsActive={showApps} />

             {showApps && (
                 <AllApplications
                    apps={defaultApps}
                    openApp={openAppById}
                 />
             )}

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
                 {desktopIcons.map(node => {
                     const nodeId = node.id;
                     // Determine position: Dragging state -> Layout -> Default (0,0)
                     const pos = dragPositions?.[nodeId] || layout[nodeId] || { x: 0, y: 0 };

                     // Debug log for first render of icon (or when pos changes)
                     // console.log(`Icon ${nodeId} at`, pos);

                     let icon = getIconPath("text-x-generic");
                     let displayName = node.name;

                     if (node.type === 'dir') {
                         icon = getIconPath("folder");
                     } else if (node.name.endsWith('.app')) {
                         const appName = node.name.replace('.app', '');
                         const foundApp = Object.values(appRegistry).find(app => app.id === appName || app.name === appName);
                         if (foundApp) {
                             icon = getIconPath(foundApp.icon);
                             displayName = foundApp.name;
                         }
                     } else if (node.name.endsWith('.txt')) {
                         icon = getIconPath("text-x-generic");
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
                        x={win.x}
                        y={win.y}
                    />
                )
             })}
        </div>
    )
}
