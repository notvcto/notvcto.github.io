"use client";

import React, { useState, useEffect, useRef } from "react";
import { useFS } from "@/lib/fs";
import { getIconPath } from "@/lib/utils/icons";
import { apps as appRegistry } from "@/components/apps/registry";
import { useLauncher } from "@/lib/hooks/use-launcher";
import { useBlockDevices } from "@/lib/hooks/use-block-devices";
import { useBlockDeviceStore } from "@/lib/store/blockDevices";

interface FileManagerProps {
    initialCwd?: string;
}

export default function FileManager({ initialCwd }: FileManagerProps) {
    const fs = useFS();
    const { open } = useLauncher();
    const { mount } = useBlockDevices();
    const { devices } = useBlockDeviceStore();

    // State
    const [cwd, setCwd] = useState<string>(initialCwd || "/home/user");
    const [selected, setSelected] = useState<string | null>(null);
    const [renaming, setRenaming] = useState<string | null>(null);
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, type: 'empty' | 'item', target?: string } | null>(null);

    const renameInputRef = useRef<HTMLInputElement>(null);

    // Sync initialCwd
    useEffect(() => {
        if (initialCwd && fs.exists(initialCwd)) {
            setCwd(initialCwd);
        }
    }, [initialCwd, fs]);

    // Safety check CWD
    useEffect(() => {
        // Special handling: if we are at a mountpoint that got unmounted (not implemented yet, but good practice)
        // or just invalid path.
        // Also support virtual paths if FS supports them (FS list handles /dev)
        // But fs.exists might return false for virtual?
        // fs.exists('/dev') is true.
        if (!fs.exists(cwd)) {
            // If cwd was valid but now isn't (e.g. unmounted), fallback
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

    // Focus rename
    useEffect(() => {
        if (renaming && renameInputRef.current) {
            renameInputRef.current.focus();
            renameInputRef.current.select();
        }
    }, [renaming]);

    // --- Helpers ---

    const resolvePath = (name: string) => {
        return cwd === '/' ? `/${name}` : `${cwd}/${name}`;
    };

    const navigate = (path: string) => {
        if (fs.exists(path)) {
            setCwd(path);
            setSelected(null);
        }
    };

    const handleDeviceClick = (name: string) => {
        const device = devices[name];
        if (!device) return;

        if (name === 'sr0') {
             if (device.mounted && device.mountPoint) {
                 navigate(device.mountPoint);
             } else {
                 // Try to mount
                 // We MUST provide a mountpoint because logic requires it for FileManager auto-mount
                 const result = mount('/dev/sr0', '/mnt/cdrom', 'ui');
                 if (result.success) {
                     navigate('/mnt/cdrom');
                 }
                 // If failed, notification is shown by mount() hook.
                 // We stay where we are.
             }
        } else if (name === 'sda' || name === 'sda1') {
            navigate('/');
        }
    };

    // --- Sidebar ---
    const SidebarItem = ({ icon, label, path, onClick, active, isDevice, deviceName }: any) => (
        <div
            className={`flex items-center px-2 py-1.5 cursor-pointer rounded-md mx-2 mb-1 transition-colors
                ${active ? 'bg-ub-orange bg-opacity-20 text-white' : 'hover:bg-white hover:bg-opacity-5 text-gray-300'}
            `}
            onClick={() => {
                if (onClick) onClick();
                else if (path) navigate(path);
                else if (isDevice && deviceName) handleDeviceClick(deviceName);
            }}
        >
            <img src={getIconPath(icon)} className="w-5 h-5 mr-3" alt="" />
            <span className="text-sm truncate">{label}</span>
            {isDevice && deviceName && devices[deviceName]?.mounted && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-ub-orange opacity-75"></div>
            )}
        </div>
    );

    // --- Main View ---
    const items = fs.list(cwd);

    // Icon resolution
    const getItemIcon = (item: any) => {
        // Special case: we are inside /dev
        if (cwd === '/dev' || cwd === '/dev/') {
            if (item.name === 'sr0') return getIconPath('cdrom');
            if (item.name.startsWith('sda')) return getIconPath('drive-harddisk');
        }

        if (item.name.endsWith('.app')) {
            const appName = item.name.replace('.app', '');
            const foundApp = Object.values(appRegistry).find(app => app.id === appName || app.name === appName);
            if (foundApp) return getIconPath(foundApp.icon);
        }
        if (item.type === 'dir') return getIconPath("folder");

        const ext = item.name.split('.').pop()?.toLowerCase();
        if (ext === 'txt' || ext === 'md') return getIconPath("text-x-generic");

        return getIconPath("application-x-generic");
    };

    const handleItemDoubleClick = (item: any) => {
        const itemPath = resolvePath(item.name);

        if (renaming) return;

        // Special handling for devices in /dev view
        if (cwd === '/dev' || cwd === '/dev/') {
             handleDeviceClick(item.name);
             return;
        }

        if (item.type === 'dir') {
            navigate(itemPath);
        } else {
            open(itemPath);
        }
    };

    // --- Toolbar ---
    const getBreadcrumbs = () => {
        const parts = cwd.split('/').filter(Boolean);
        // Map common paths to names
        // / -> Computer (or /)
        // /home/user -> Home

        const breadcrumbs = [];

        // Root
        breadcrumbs.push({ name: '', path: '/', label: 'Computer' }); // First item usually icon or "Home" if in home

        let currentPath = '';
        for (let i = 0; i < parts.length; i++) {
            currentPath += '/' + parts[i];

            // Rewrite Home
            if (currentPath === '/home/user') {
                // Clear previous (root, home, user) and just show Home
                // But standard breadcrumb shows full path usually?
                // GNOME: Home > Desktop
                // If I am in /home/user, it shows "Home".
                // If I am in /etc, it shows "Computer > etc".
                if (breadcrumbs.length > 0 && breadcrumbs[0].path === '/') {
                     // Replace root with Home?
                     breadcrumbs.length = 0; // Clear
                     breadcrumbs.push({ name: 'user', path: currentPath, label: 'Home' });
                }
            } else if (currentPath === '/home') {
                 // skip
            } else {
                 breadcrumbs.push({ name: parts[i], path: currentPath, label: parts[i] });
            }
        }

        if (cwd === '/') return [{ name: '', path: '/', label: '/' }]; // Special case for root

        return breadcrumbs;
    };

    // --- Context Menu Logic ---
    const handleContextMenu = (e: React.MouseEvent, type: 'empty' | 'item', target?: string) => {
        e.preventDefault();
        e.stopPropagation();
        if (type === 'item' && target) setSelected(target);
        setContextMenu({ x: e.clientX, y: e.clientY, type, target });
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
        if (type === 'folder') fs.mkdir(path);
        else fs.write(path, "");
        setSelected(path);
        setRenaming(path);
    };

    const handleRename = (newName: string) => {
        if (!renaming) return;
        if (!newName.trim()) { setRenaming(null); return; }
        const oldName = renaming.split('/').pop()!;
        if (newName === oldName) { setRenaming(null); return; }
        const newPath = resolvePath(newName);
        if (fs.exists(newPath)) { alert(`Name "${newName}" already exists.`); return; }
        fs.rename(renaming, newName);
        setRenaming(null);
        setSelected(newPath);
    };

    const handleDelete = () => {
        if (selected) {
            fs.trash(selected);
            setSelected(null);
        }
    };


    return (
        <div className="flex h-full w-full bg-ub-cool-grey text-ubt-grey select-none font-ubuntu overflow-hidden"
             onClick={() => setSelected(null)}
             onContextMenu={(e) => handleContextMenu(e, 'empty')}
        >
            {/* Sidebar */}
            <div className="w-48 flex-shrink-0 bg-[#2C2C2C] flex flex-col pt-4 border-r border-black border-opacity-20 text-gray-300">

                {/* Places */}
                <div className="mb-4">
                    <SidebarItem
                        icon="user-home"
                        label="Home"
                        path="/home/user"
                        active={cwd === '/home/user'}
                    />
                    <SidebarItem
                        icon="folder"
                        label="Desktop"
                        path="/home/user/Desktop"
                        active={cwd === '/home/user/Desktop'}
                    />
                    <SidebarItem
                        icon="user-trash"
                        label="Trash"
                        path="/trash"
                        active={cwd === '/trash'}
                    />
                </div>

                <div className="border-t border-white border-opacity-5 mx-4 mb-4"></div>

                {/* Devices */}
                <div className="mb-2 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Locations
                </div>

                <SidebarItem
                    icon="drive-harddisk"
                    label="256 GB Volume"
                    isDevice={true}
                    deviceName="sda"
                    active={cwd === '/'}
                />
                 {/* Only showing sda (root) and sr0 (cdrom) in sidebar usually. sda1 is partition. */}

                <SidebarItem
                    icon="cdrom"
                    label="CD-ROM"
                    isDevice={true}
                    deviceName="sr0"
                    active={cwd === '/mnt/cdrom' || (devices.sr0.mounted && devices.sr0.mountPoint === cwd)}
                />

            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 bg-[#1E1E1E]">

                {/* Toolbar */}
                <div className="h-12 flex items-center px-4 bg-[#2C2C2C] border-b border-black border-opacity-20 shadow-sm">
                    {/* Navigation Arrows */}
                    <div className="flex space-x-2 mr-4 text-gray-400">
                        <button
                            className={`p-1 hover:bg-white hover:bg-opacity-5 rounded ${cwd === '/' ? 'opacity-30' : ''}`}
                            onClick={() => {
                                // Up one level
                                const parts = cwd.split('/').filter(Boolean);
                                parts.pop();
                                const parent = '/' + parts.join('/');
                                if (fs.exists(parent)) setCwd(parent);
                            }}
                        >
                            ⬆
                        </button>
                    </div>

                    {/* Breadcrumbs */}
                    <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar mask-linear-fade flex-1">
                        {getBreadcrumbs().map((b, i, arr) => (
                            <React.Fragment key={b.path}>
                                <button
                                    className={`
                                        px-3 py-1.5 rounded text-sm font-medium transition-colors whitespace-nowrap
                                        ${i === arr.length - 1
                                            ? 'bg-ub-cool-grey text-white shadow-sm'
                                            : 'text-gray-400 hover:bg-white hover:bg-opacity-5 hover:text-gray-200'
                                        }
                                    `}
                                    onClick={() => navigate(b.path)}
                                >
                                    {b.label}
                                </button>
                                {i < arr.length - 1 && <span className="text-gray-600 text-sm">›</span>}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                {/* Grid View */}
                <div className="flex-1 overflow-y-auto p-4" onClick={() => setSelected(null)}>
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-4">
                        {items.map(item => {
                            const itemPath = resolvePath(item.name);
                            const isSelected = selected === itemPath;
                            const isRenaming = renaming === itemPath;

                            return (
                                <div
                                    key={item.id}
                                    className={`
                                        group flex flex-col items-center p-2 rounded-lg cursor-default border border-transparent
                                        ${isSelected && !isRenaming ? 'bg-ub-orange bg-opacity-20 border-ub-orange border-opacity-30' : 'hover:bg-white hover:bg-opacity-5'}
                                    `}
                                    onClick={(e) => { e.stopPropagation(); setSelected(itemPath); }}
                                    onDoubleClick={(e) => { e.stopPropagation(); handleItemDoubleClick(item); }}
                                    onContextMenu={(e) => handleContextMenu(e, 'item', itemPath)}
                                >
                                    <img
                                        src={getItemIcon(item)}
                                        className="w-12 h-12 mb-2 drop-shadow-md"
                                        alt=""
                                    />
                                    {isRenaming ? (
                                        <input
                                            ref={renameInputRef}
                                            defaultValue={item.name}
                                            className="w-full text-center text-sm bg-[#3E3E3E] text-white border border-ub-orange rounded px-1 outline-none shadow-lg"
                                            onClick={e => e.stopPropagation()}
                                            onKeyDown={e => {
                                                if (e.key === 'Enter') handleRename(e.currentTarget.value);
                                                if (e.key === 'Escape') setRenaming(null);
                                            }}
                                            onBlur={e => handleRename(e.target.value)}
                                        />
                                    ) : (
                                        <span className={`text-sm text-center break-words w-full line-clamp-2 px-1 ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                                            {item.name}
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Context Menu */}
            {contextMenu && (
                <div
                    className="fixed bg-[#333333] text-gray-200 text-sm shadow-2xl rounded-lg py-1 z-50 border border-black border-opacity-40 min-w-[160px]"
                    style={{ top: contextMenu.y, left: contextMenu.x }}
                    onClick={e => e.stopPropagation()}
                >
                    {contextMenu.type === 'empty' && (
                        <>
                            <div className="px-4 py-1.5 hover:bg-ub-orange hover:text-white cursor-pointer" onClick={() => { handleCreate('folder'); setContextMenu(null); }}>New Folder</div>
                            <div className="px-4 py-1.5 hover:bg-ub-orange hover:text-white cursor-pointer" onClick={() => { handleCreate('file'); setContextMenu(null); }}>New Text File</div>
                        </>
                    )}
                    {contextMenu.type === 'item' && (
                        <>
                            <div className="px-4 py-1.5 hover:bg-ub-orange hover:text-white cursor-pointer" onClick={() => {
                                handleItemDoubleClick(fs.stat(selected!)!);
                                setContextMenu(null);
                            }}>Open</div>
                            <div className="px-4 py-1.5 hover:bg-ub-orange hover:text-white cursor-pointer" onClick={() => {
                                setRenaming(selected!);
                                setContextMenu(null);
                            }}>Rename</div>
                            <div className="border-t border-white border-opacity-10 my-1"></div>
                            <div className="px-4 py-1.5 hover:bg-red-500 hover:text-white cursor-pointer" onClick={() => {
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
