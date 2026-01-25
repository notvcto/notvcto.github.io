"use client";

import React, { useState, useEffect, useRef } from "react";
import { useFS, resolveRelativePath } from "@/lib/fs";
import { useWMStore } from "@/lib/store/wm";

interface TerminalRow {
    id: number;
    text: React.ReactNode;
    isInput?: boolean;
    path?: string;
}

export default function TerminalApp() {
    const fs = useFS();
    const { closeWindow, openWindow } = useWMStore();

    const [history, setHistory] = useState<TerminalRow[]>([]);
    const [inputVal, setInputVal] = useState("");
    // We store currentDirId to track CWD, but we should use path strings with new API.
    // However, unique IDs are still useful for tracking state if paths change (rename).
    // But standard shells track PWD as string.
    // Let's switch to tracking path string to align with canonical API.
    const [currentPath, setCurrentPath] = useState<string>("/home/user");

    const [historyPointer, setHistoryPointer] = useState(0);
    const [commandHistory, setCommandHistory] = useState<string[]>([]);

    const inputRef = useRef<HTMLInputElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);

    // Init check
    useEffect(() => {
        if (!fs.exists(currentPath)) {
            setCurrentPath("/");
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

    const getDisplayPath = (path: string) => {
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

        const displayPath = getDisplayPath(currentPath);
        const inputRow: TerminalRow = {
            id: Date.now(),
            text: (
                <div className="flex">
                    <span className="text-ubt-green">vcto@ubuntu</span>
                    <span className="text-white mx-px">:</span>
                    <span className="text-ubt-blue">{displayPath}</span>
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
                // Handle args for path?
                // ls [path]
                let targetPath = currentPath;
                let showHidden = false;

                // Simple arg parsing
                args.forEach(arg => {
                    if (arg.startsWith('-')) {
                        if (arg.includes('a')) showHidden = true;
                    } else {
                        targetPath = resolveRelativePath(currentPath, arg);
                    }
                });

                if (fs.exists(targetPath)) {
                     const stat = fs.stat(targetPath);
                     if (stat && stat.type === 'dir') {
                         const children = fs.list(targetPath);
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
                     } else {
                         output = `ls: ${targetPath}: Not a directory`; // Or print file
                     }
                } else {
                     output = `ls: cannot access '${targetPath}': No such file or directory`;
                }
                break;
            }

            case 'pwd':
                output = currentPath;
                break;

            case 'cd': {
                const target = args[0];
                let newPath = currentPath;

                if (!target) {
                    newPath = '/home/user';
                } else {
                    newPath = resolveRelativePath(currentPath, target);
                }

                if (fs.exists(newPath)) {
                    const stat = fs.stat(newPath);
                    if (stat && stat.type === 'dir') {
                        setCurrentPath(newPath);
                    } else {
                        output = `cd: ${target}: Not a directory`;
                    }
                } else {
                     output = `cd: ${target}: No such file or directory`;
                }
                break;
            }

            case 'mkdir': {
                const name = args[0];
                if (name) {
                    const target = resolveRelativePath(currentPath, name);
                    fs.mkdir(target);
                } else {
                    output = "mkdir: missing operand";
                }
                break;
            }

            case 'touch': {
                const name = args[0];
                if (name) {
                    const target = resolveRelativePath(currentPath, name);
                    fs.write(target, "");
                } else {
                    output = "touch: missing operand";
                }
                break;
            }

            case 'rm': {
                 const name = args[0];
                 if (name) {
                     const target = resolveRelativePath(currentPath, name);
                     if (fs.exists(target)) {
                         fs.trash(target);
                     } else {
                         output = `rm: cannot remove '${name}': No such file or directory`;
                     }
                 }
                 break;
            }

            case 'cat': {
                 const name = args[0];
                 if (name) {
                     const target = resolveRelativePath(currentPath, name);
                     if (fs.exists(target)) {
                         const content = fs.read(target);
                         if (content !== null) {
                             output = content;
                         } else {
                             output = `cat: ${name}: Is a directory`;
                         }
                     } else {
                         output = `cat: ${name}: No such file or directory`;
                     }
                 }
                 break;
            }

            case 'echo':
                output = args.join(' ');
                break;

            case 'exit':
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

    const displayPath = getDisplayPath(currentPath);

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
                 <span className="text-ubt-blue">{displayPath}</span>
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
                    <span className="invisible whitespace-pre">{inputVal}</span>
                 </div>
            </div>
            <div ref={bottomRef} />
        </div>
    );
}
