"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useFS } from "@/lib/fs";
import { getIconPath } from "@/lib/utils/icons";
import { apps as appRegistry } from "@/components/apps/registry";

export default function FileManager() {
    const fs = useFS();

    // State
    const [cwd, setCwd] = useState<string>("/home/user");
    const [selected, setSelected] = useState<string | null>(null);
    const [renaming, setRenaming] = useState<string | null>(null);
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, type: 'empty' | 'item', target?: string } | null>(null);

    // Refs for rename input
    const renameInputRef = useRef<HTMLInputElement>(null);

    // Safety check: ensure CWD exists
    useEffect(() => {
        if (!fs.exists(cwd)) {
            // Fallback to home or root
            if (fs.exists("/home/user")) setCwd("/home/user");
            else setCwd("/");
        }
    }, [cwd, fs]);

    // Close context menu on click
    useEffect(() => {
        const handleClick = () => setContextMenu(null);
        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, []);

    // Focus rename input
    useEffect(() => {
        if (renaming && renameInputRef.current) {
            renameInputRef.current.focus();
            renameInputRef.current.select();
        }
    }, [renaming]);

    // Derived state
    const items = fs.list(cwd);

    // Helpers
    const resolvePath = (name: string) => {
        return cwd === '/' ? `/${name}` : `${cwd}/${name}`;
    };

    const handleContextMenu = (e: React.MouseEvent, type: 'empty' | 'item', target?: string) => {
        e.preventDefault();
        e.stopPropagation();

        // If right clicking an item that isn't selected, select it
        if (type === 'item' && target) {
            setSelected(target);
        }

        setContextMenu({
            x: e.clientX,
            y: e.clientY,
            type,
            target
        });
    };

    const getUniqueName = (base: string, isDir: boolean) => {
        let name = base;
        let counter = 1;
        while (true) {
            const path = resolvePath(name);
            if (!fs.exists(path)) return name;
            name = `${base} ${counter}`;
            counter++;
        }
    };

    const handleCreate = (type: 'folder' | 'file') => {
        const base = type === 'folder' ? 'New Folder' : 'New Text Document';
        const name = getUniqueName(base, type === 'folder');
        const path = resolvePath(name);

        if (type === 'folder') {
            fs.mkdir(path);
        } else {
            fs.write(path, "");
        }

        // Select and Start Renaming
        setSelected(path);
        setRenaming(path);
    };

    const handleRename = (newName: string) => {
        if (!renaming) return;
        if (!newName.trim()) {
            setRenaming(null); // Cancel if empty
            return;
        }

        const oldName = renaming.split('/').pop()!;
        if (newName === oldName) {
            setRenaming(null);
            return;
        }

        const newPath = resolvePath(newName);
        if (fs.exists(newPath)) {
            alert(`Name "${newName}" already exists.`);
            // Keep input open
            if (renameInputRef.current) renameInputRef.current.focus();
            return;
        }

        fs.rename(renaming, newName);
        setRenaming(null);
        setSelected(newPath); // Update selection to new path
    };

    const handleDelete = () => {
        if (selected) {
            fs.trash(selected);
            setSelected(null);
        }
    };

    // Drag and Drop
    const handleDragStart = (e: React.DragEvent, path: string) => {
        e.dataTransfer.setData("text/plain", path);
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDragOver = (e: React.DragEvent, item: any) => {
        if (item.type === 'dir') {
            e.preventDefault(); // Allow drop
            e.dataTransfer.dropEffect = "move";
        }
    };

    const handleDrop = (e: React.DragEvent, targetPath: string) => {
        e.preventDefault();
        const srcPath = e.dataTransfer.getData("text/plain");

        if (!srcPath || srcPath === targetPath) return;

        // Prevent moving into itself
        if (targetPath === srcPath || targetPath.startsWith(srcPath + '/')) {
             console.warn("Cannot move folder into itself");
             return;
        }

        fs.move(srcPath, targetPath);
    };

    return (
        <div className="flex flex-col h-full w-full bg-ub-cool-grey text-ubt-grey select-none font-ubuntu relative"
             onClick={() => setSelected(null)}
             onContextMenu={(e) => handleContextMenu(e, 'empty')}
        >
            {/* Toolbar / Breadcrumbs */}
            <div className="flex items-center h-10 px-2 bg-white bg-opacity-10 border-b border-black border-opacity-5">
                <button
                    onClick={() => {
                        const parts = cwd.split('/').filter(Boolean);
                        parts.pop();
                        const parent = '/' + parts.join('/');
                        if (fs.exists(parent)) setCwd(parent);
                    }}
                    disabled={cwd === '/'}
                    className={`p-1 rounded hover:bg-white hover:bg-opacity-10 mr-2 ${cwd === '/' ? 'opacity-30 cursor-not-allowed' : ''}`}
                >
                    ⬆️
                </button>
                <div className="flex-1 font-mono text-sm opacity-80 truncate select-text">
                    {cwd}
                </div>
            </div>

            {/* Main View */}
            <div className="flex-1 p-4 overflow-y-auto">
                <div className="grid grid-cols-[repeat(auto-fill,minmax(90px,1fr))] gap-2">
                    {items.map(item => {
                        const itemPath = resolvePath(item.name);
                        const isSelected = selected === itemPath;
                        const isRenaming = renaming === itemPath;

                        return (
                            <div
                                key={item.id}
                                className={`flex flex-col items-center p-2 rounded cursor-default border border-transparent group
                                    ${isSelected && !isRenaming ? 'bg-ub-orange bg-opacity-20 border-ub-orange border-opacity-40' : 'hover:bg-white hover:bg-opacity-5'}
                                `}
                                draggable={!isRenaming}
                                onDragStart={(e) => handleDragStart(e, itemPath)}
                                onDragOver={(e) => handleDragOver(e, item)}
                                onDrop={(e) => handleDrop(e, itemPath)}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelected(itemPath);
                                }}
                                onDoubleClick={(e) => {
                                    e.stopPropagation();
                                    if (isRenaming) return;
                                    if (item.type === 'dir') {
                                        setCwd(itemPath);
                                        setSelected(null);
                                    }
                                }}
                                onContextMenu={(e) => handleContextMenu(e, 'item', itemPath)}
                            >
                                <img
                                    src={(() => {
                                        if (item.name.endsWith('.app')) {
                                            const appName = item.name.replace('.app', '');
                                            const foundApp = Object.values(appRegistry).find(app => app.id === appName || app.name === appName);
                                            if (foundApp) return getIconPath(foundApp.icon);
                                        }
                                        if (item.type === 'dir') return getIconPath("folder");
                                        const ext = item.name.split('.').pop()?.toLowerCase();
                                        if (ext === 'txt' || ext === 'md') {
                                            return getIconPath("text-x-generic");
                                        }
                                        return getIconPath("application-x-generic");
                                    })()}
                                    className="w-12 h-12 mb-1 pointer-events-none"
                                    alt={item.name}
                                />
                                {isRenaming ? (
                                    <input
                                        ref={renameInputRef}
                                        defaultValue={item.name}
                                        className="w-full text-center text-sm bg-white text-black border border-ub-orange rounded px-1 outline-none"
                                        onClick={e => e.stopPropagation()}
                                        onKeyDown={e => {
                                            if (e.key === 'Enter') handleRename(e.currentTarget.value);
                                            if (e.key === 'Escape') setRenaming(null);
                                        }}
                                        onBlur={e => handleRename(e.target.value)}
                                    />
                                ) : (
                                    <span className={`text-sm text-center break-all line-clamp-2 leading-tight px-1 ${isSelected ? 'text-white' : ''}`}>
                                        {item.name}
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Context Menu */}
            {contextMenu && (
                <div
                    className="fixed bg-ub-grey text-white text-sm shadow-xl rounded py-1 z-50 border border-black border-opacity-20 min-w-[150px]"
                    style={{ top: contextMenu.y, left: contextMenu.x }}
                    onClick={e => e.stopPropagation()}
                >
                    {contextMenu.type === 'empty' && (
                        <>
                            <div className="px-4 py-2 hover:bg-ub-orange cursor-pointer" onClick={() => { handleCreate('folder'); setContextMenu(null); }}>New Folder</div>
                            <div className="px-4 py-2 hover:bg-ub-orange cursor-pointer" onClick={() => { handleCreate('file'); setContextMenu(null); }}>New File</div>
                        </>
                    )}
                    {contextMenu.type === 'item' && (
                        <>
                            {contextMenu.target && fs.stat(contextMenu.target)?.type === 'dir' && (
                                <div className="px-4 py-2 hover:bg-ub-orange cursor-pointer" onClick={() => {
                                    setCwd(contextMenu.target!);
                                    setSelected(null);
                                    setContextMenu(null);
                                }}>Open</div>
                            )}
                            <div className="px-4 py-2 hover:bg-ub-orange cursor-pointer" onClick={() => {
                                setRenaming(contextMenu.target!);
                                setContextMenu(null);
                            }}>Rename</div>
                            <div className="px-4 py-2 hover:bg-ub-orange cursor-pointer" onClick={() => {
                                handleDelete();
                                setContextMenu(null);
                            }}>Move to Trash</div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
