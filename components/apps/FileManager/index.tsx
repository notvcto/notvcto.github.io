"use client";
import React, { useState, useEffect } from "react";
import { useFileSystemStore, resolvePath, getAbsolutePath } from "@/lib/store/filesystem";
import { useWMStore } from "@/lib/store/wm";

export default function FileManager() {
    const { nodes, rootId } = useFileSystemStore();
    const { openWindow } = useWMStore();
    const [currentDirId, setCurrentDirId] = useState(rootId);

    // Init to home
    useEffect(() => {
        const home = resolvePath('/home/user', nodes, rootId);
        if (home) setCurrentDirId(home.id);
    }, [nodes, rootId]); // deps? nodes changes often.

    // Safety check
    const currentNode = nodes[currentDirId] || nodes[rootId];
    const children = currentNode && currentNode.type === 'dir' ? currentNode.children.map(id => nodes[id]).filter(Boolean) : [];

    const handleNavigate = (id: string) => {
        const node = nodes[id];
        if (node.type === 'dir') {
            setCurrentDirId(id);
        } else {
            // Open file?
        }
    }

    const shortcuts = [
        { name: 'Home', path: '/home/user', icon: './themes/MoreWaita/system/user-home.svg' },
        { name: 'Desktop', path: '/home/user/Desktop', icon: './themes/Yaru/system/user-desktop.png' },
        { name: 'Documents', path: '/home/user/Documents', icon: './themes/Yaru/system/folder-documents.png' },
        { name: 'Downloads', path: '/home/user/Downloads', icon: './themes/Yaru/system/folder-download.png' },
        { name: 'Trash', path: '/trash', icon: './themes/MoreWaita/system/user-trash-full.svg' },
    ];

    return (
        <div className="flex h-full w-full bg-ub-cool-grey text-ubt-grey select-none">
            {/* Sidebar */}
            <div className="w-1/4 bg-ub-warm-grey bg-opacity-10 border-r border-black border-opacity-10 flex flex-col pt-2 min-w-[120px]">
                {shortcuts.map(s => (
                    <div
                        key={s.name}
                        className="px-2 py-1.5 hover:bg-white hover:bg-opacity-10 cursor-pointer flex items-center gap-2"
                        onClick={() => {
                            const node = resolvePath(s.path, nodes, rootId);
                            if (node) setCurrentDirId(node.id);
                        }}
                    >
                        <img src={s.icon} className="w-5 h-5" alt="" />
                        <span className="text-sm">{s.name}</span>
                    </div>
                ))}
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Navbar */}
                <div className="h-10 border-b border-black border-opacity-10 flex items-center px-2 gap-2 bg-white bg-opacity-5">
                    <button
                        className="p-1 hover:bg-white hover:bg-opacity-10 rounded"
                        onClick={() => {
                            if (currentNode.parent) setCurrentDirId(currentNode.parent);
                        }}
                        disabled={!currentNode.parent}
                    >
                        ⬆️
                    </button>
                    <div className="text-sm opacity-70 px-2 py-1 bg-white bg-opacity-10 rounded flex-1 truncate font-mono">
                        {getAbsolutePath(currentDirId, nodes, rootId)}
                    </div>
                </div>

                {/* Grid */}
                <div className="flex-1 p-4 grid grid-cols-[repeat(auto-fill,minmax(80px,1fr))] gap-4 content-start overflow-y-auto">
                    {children.map(node => (
                        <div
                            key={node.id}
                            className="flex flex-col items-center hover:bg-ub-orange hover:bg-opacity-20 p-2 rounded cursor-pointer"
                            onDoubleClick={() => handleNavigate(node.id)}
                        >
                            <img
                                src={node.type === 'dir' ? "./themes/Yaru/system/folder.png" : "./themes/Yaru/mimetypes/text-x-generic.png"}
                                className="w-10 h-10 mb-1"
                                alt=""
                            />
                            <span className="text-xs text-center break-all line-clamp-2">{node.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
