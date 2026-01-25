"use client";
import React, { useEffect, useState } from "react";
import BackgroundImage from "../util components/background-image";
import Navbar from "./navbar";
import SideBar from "./SideBar";
import Window from "@/components/base/Window";
import UbuntuApp from "@/components/base/UbuntuApp";
import LockScreen from "./lock_screen";
import BootingScreen from "./booting_screen";
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
    const { nodes, rootId, updateMetadata, init: initFS } = useFileSystemStore();
    const [booting, setBooting] = useState(true);

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

    const handleIconDrop = (id: string, data: {x: number, y: number}) => {
         updateMetadata(id, { position: { x: data.x, y: data.y } });
    }

    const openApp = (nodeId: string) => {
        const node = nodes[nodeId];
        if (!node) return;

        if (node.type === 'dir') {
             // Open File Manager
             const fmApp = appRegistry['file-manager'];
             if (fmApp) {
                 // Pass initial path?
                 // Currently FileManager defaults to Home.
                 // Ideally passing `path` prop.
                 // But FileManager is not set up to take props yet.
                 // Just open it.
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

    return (
        <div className="h-full w-full absolute overflow-hidden bg-transparent" id="monitor-screen">
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
                    // maybe reset storage?
                }}
             />

             <BackgroundImage img={wallpaper} />
             <Navbar />
             <SideBar />

             {/* Desktop Icons */}
             <div className="absolute w-full h-full top-0 left-0 z-10">
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
                         <Draggable
                            key={nodeId}
                            defaultPosition={pos}
                            onStop={(e, data) => handleIconDrop(nodeId, data)}
                         >
                             <div className="absolute">
                                 <UbuntuApp
                                    id={nodeId}
                                    name={name}
                                    icon={icon}
                                    openApp={() => openApp(nodeId)}
                                 />
                             </div>
                         </Draggable>
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
        </div>
    )
}
