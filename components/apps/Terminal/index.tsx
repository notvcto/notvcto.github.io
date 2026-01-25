"use client";

import React, { useState, useEffect, useRef } from "react";
import { useFileSystemStore, resolvePath, getAbsolutePath } from "@/lib/store/filesystem";
import { useWMStore } from "@/lib/store/wm";

interface TerminalRow {
    id: number;
    text: React.ReactNode;
    isInput?: boolean;
    path?: string;
}

export default function TerminalApp() {
    const { nodes, rootId, createDir, createFile, deleteNode, renameNode } = useFileSystemStore();
    const { closeWindow, openWindow } = useWMStore();

    const [history, setHistory] = useState<TerminalRow[]>([]);
    const [inputVal, setInputVal] = useState("");
    const [currentDirId, setCurrentDirId] = useState<string>(rootId); // Will init to /home/user
    const [historyPointer, setHistoryPointer] = useState(0);
    const [commandHistory, setCommandHistory] = useState<string[]>([]);

    const inputRef = useRef<HTMLInputElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);

    // Init to /home/user
    useEffect(() => {
        const homeUser = resolvePath('/home/user', nodes, rootId);
        if (homeUser) {
            setCurrentDirId(homeUser.id);
        }

        // Welcome message
        setHistory([
            { id: 0, text: <div>Welcome to Ubuntu 22.04.2 LTS (GNU/Linux 5.15.0-76-generic x86_64)</div> },
            { id: 1, text: <div className="mt-2">Documentation: https://help.ubuntu.com</div> },
        ]);
    }, []);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history]);

    const focusInput = () => {
        inputRef.current?.focus();
    };

    const getPathString = (dirId: string) => {
        const path = getAbsolutePath(dirId, nodes, rootId);
        if (path.startsWith('/home/user')) {
            return path.replace('/home/user', '~');
        }
        return path;
    };

    const handleCommand = (cmdStr: string) => {
        const trimmed = cmdStr.trim();
        if (!trimmed) return;

        setCommandHistory(prev => [...prev, trimmed]);
        setHistoryPointer(commandHistory.length + 1);

        const parts = trimmed.split(/\s+/);
        const cmd = parts[0];
        const args = parts.slice(1);

        const currentPath = getPathString(currentDirId);
        const inputRow: TerminalRow = {
            id: Date.now(),
            text: (
                <div className="flex">
                    <span className="text-ubt-green">vcto@ubuntu</span>
                    <span className="text-white mx-px">:</span>
                    <span className="text-ubt-blue">{currentPath}</span>
                    <span className="text-white mx-px mr-1">$</span>
                    <span>{trimmed}</span>
                </div>
            )
        };

        let output: React.ReactNode = "";

        switch(cmd) {
            case 'help':
                output = (
                    <div className="text-cyan-400">
                        Available commands: ls, cd, pwd, mkdir, touch, rm, cat, clear, exit
                    </div>
                );
                break;

            case 'clear':
                setHistory([]);
                return; // Don't add inputRow

            case 'ls': {
                const targetId = currentDirId; // Handle args later for other dirs
                const node = nodes[targetId];
                if (node && node.type === 'dir') {
                     const children = node.children.map(id => nodes[id]).filter(Boolean);
                     // Filter hidden?
                     const showHidden = args.includes('-a') || args.includes('-la');
                     const visible = children.filter(c => showHidden || !c.name.startsWith('.'));

                     output = (
                         <div className="flex flex-wrap gap-4">
                             {visible.map(c => (
                                 <span key={c.id} className={c.type === 'dir' ? 'text-ubt-blue font-bold' : (c.executable || c.name.endsWith('.app') ? 'text-green-400 font-bold' : 'text-white')}>
                                     {c.name}
                                 </span>
                             ))}
                         </div>
                     );
                }
                break;
            }

            case 'pwd':
                output = getAbsolutePath(currentDirId, nodes, rootId);
                break;

            case 'cd': {
                const target = args[0];
                if (!target || target === '~') {
                    const home = resolvePath('/home/user', nodes, rootId);
                    if (home) setCurrentDirId(home.id);
                } else if (target === '..') {
                    const curr = nodes[currentDirId];
                    if (curr && curr.parent) setCurrentDirId(curr.parent);
                } else {
                    // Resolve path relative
                    // Needs better resolution logic for relative paths
                    // For now, check children
                    const curr = nodes[currentDirId];
                    if (curr && curr.type === 'dir') {
                        const childId = curr.children.find(id => nodes[id].name === target);
                        if (childId) {
                            if (nodes[childId].type === 'dir') {
                                setCurrentDirId(childId);
                            } else {
                                output = `cd: ${target}: Not a directory`;
                            }
                        } else {
                             output = `cd: ${target}: No such file or directory`;
                        }
                    }
                }
                break;
            }

            case 'mkdir': {
                const name = args[0];
                if (name) {
                    createDir(currentDirId, name);
                } else {
                    output = "mkdir: missing operand";
                }
                break;
            }

            case 'touch': {
                const name = args[0];
                if (name) {
                    createFile(currentDirId, name, "");
                } else {
                    output = "touch: missing operand";
                }
                break;
            }

            case 'rm': {
                 const name = args[0];
                 if (name) {
                     // Check children
                    const curr = nodes[currentDirId];
                    if (curr && curr.type === 'dir') {
                         const childId = curr.children.find(id => nodes[id].name === name);
                         if (childId) {
                             deleteNode(childId);
                         } else {
                             output = `rm: ${name}: No such file or directory`;
                         }
                    }
                 }
                 break;
            }

            case 'cat': {
                 const name = args[0];
                 if (name) {
                     const curr = nodes[currentDirId];
                    if (curr && curr.type === 'dir') {
                         const childId = curr.children.find(id => nodes[id].name === name);
                         if (childId && nodes[childId].type === 'file') {
                             output = (nodes[childId] as any).content || "";
                         } else {
                             output = `cat: ${name}: No such file or directory`;
                         }
                    }
                 }
                 break;
            }

            case 'echo':
                output = args.join(' ');
                break;

            case 'exit':
                // Close window.
                // We need window ID. TerminalApp doesn't know its window ID unless passed as prop.
                // But wait, the `Window` component doesn't pass `windowId` to `Screen` props by default in `Desktop.tsx`.
                // I passed `componentProps`. I should pass `windowId` too? Or `closeWindow` callback?
                // I'll update `Desktop.tsx` to pass `onClose` or `id`.
                // For now, I can't close it easily. I'll just clear.
                setHistory([]);
                break;

            default:
                output = `${cmd}: command not found`;
        }

        setHistory(prev => [...prev, inputRow, { id: Date.now() + 1, text: output }]);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleCommand(inputVal);
            setInputVal("");
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (historyPointer > 0) {
                setHistoryPointer(prev => prev - 1);
                setInputVal(commandHistory[historyPointer - 1] || "");
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyPointer < commandHistory.length) {
                 setHistoryPointer(prev => prev + 1);
                 setInputVal(commandHistory[historyPointer + 1] || "");
            } else {
                setHistoryPointer(commandHistory.length);
                setInputVal("");
            }
        }
    };

    const currentPath = getPathString(currentDirId);

    return (
        <div className="h-full w-full bg-ub-drk-abrgn text-white text-sm font-mono p-2 overflow-y-auto" onClick={focusInput}>
            {history.map(row => (
                <div key={row.id} className="mb-1">
                    {row.text}
                </div>
            ))}

            <div className="flex">
                 <span className="text-ubt-green">vcto@ubuntu</span>
                 <span className="text-white mx-px">:</span>
                 <span className="text-ubt-blue">{currentPath}</span>
                 <span className="text-white mx-px mr-1">$</span>
                 <div className="relative flex-grow">
                     <input
                        ref={inputRef}
                        type="text"
                        className="bg-transparent outline-none border-none text-white w-full absolute top-0 left-0"
                        value={inputVal}
                        onChange={e => setInputVal(e.target.value)}
                        onKeyDown={handleKeyDown}
                        autoFocus
                        spellCheck={false}
                        autoComplete="off"
                    />
                    {/* Fake cursor or just use input caret. Input caret is fine. */}
                    <span className="invisible whitespace-pre">{inputVal}</span>
                 </div>
            </div>
            <div ref={bottomRef} />
        </div>
    );
}
