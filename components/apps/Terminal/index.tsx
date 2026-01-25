"use client";

import React, { useState, useEffect, useRef } from "react";
import { useFS } from "@/lib/fs";
import { useWMStore } from "@/lib/store/wm";

type TerminalLineType = "input" | "output" | "error";

interface TerminalLine {
  id: string;
  type: TerminalLineType;
  text: string;
  cwd?: string; // Only for input lines to show context
}

// --- Path Resolution Logic (Shell Owned) ---

const normalizePath = (path: string): string => {
  if (!path) return "/";
  const parts = path.split("/").filter((p) => p !== "" && p !== ".");
  const stack: string[] = [];

  for (const part of parts) {
    if (part === "..") {
      stack.pop();
    } else {
      stack.push(part);
    }
  }

  const result = "/" + stack.join("/");
  return result || "/";
};

const resolvePath = (cwd: string, target: string): string => {
  if (!target) return cwd;

  // Handle ~ (Home)
  if (target === "~" || target.startsWith("~/")) {
     target = "/home/user" + target.slice(1);
  }

  // Absolute path
  if (target.startsWith("/")) {
    return normalizePath(target);
  }

  // Relative path
  const separator = cwd === "/" ? "" : "/";
  return normalizePath(`${cwd}${separator}${target}`);
};

const getParentDir = (path: string): string => {
    if (path === '/') return '/';
    const parts = path.split('/');
    parts.pop(); // Remove file/last dir
    const parent = parts.join('/') || '/';
    return parent;
};

const getFileName = (path: string): string => {
    if (path === '/') return '';
    const parts = path.split('/');
    return parts[parts.length - 1];
}

export default function TerminalApp() {
  const fs = useFS();
  // We strictly own CWD.
  const [cwd, setCwd] = useState<string>("/home/user");

  // Terminal State
  const [history, setHistory] = useState<TerminalLine[]>([]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [inputVal, setInputVal] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Focus input on click anywhere
  const handleContainerClick = () => {
      // Don't focus if user is selecting text
      const selection = window.getSelection();
      if (!selection || selection.toString().length === 0) {
        inputRef.current?.focus();
      }
  };

  useEffect(() => {
    // Initial boot check
    if (!fs.exists(cwd)) {
      setCwd("/");
    }

    // Welcome Message
    setHistory([
        { id: "init-1", type: "output", text: "Welcome to Ubuntu 22.04.2 LTS (GNU/Linux 5.15.0-76-generic x86_64)" },
        { id: "init-2", type: "output", text: "Documentation: https://help.ubuntu.com" },
        { id: "init-3", type: "output", text: "" } // Spacer
    ]);
  }, []); // Run once

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  const addToHistory = (lines: TerminalLine | TerminalLine[]) => {
      setHistory((prev: TerminalLine[]) => [...prev, ...(Array.isArray(lines) ? lines : [lines])]);
  };

  const executeCommand = (cmdStr: string) => {
    const trimmed = cmdStr.trim();
    if (!trimmed) {
        addToHistory({ id: Date.now().toString(), type: "input", text: "", cwd });
        return;
    }

    // Add to input history
    addToHistory({ id: Date.now().toString(), type: "input", text: trimmed, cwd });

    // Add to command history
    setCommandHistory((prev: string[]) => [...prev, trimmed]);
    setHistoryIndex(-1); // Reset history pointer

    const parts = trimmed.split(/\s+/);
    const cmd = parts[0];
    const args = parts.slice(1);

    // Helper for adding output
    const out = (text: string) => ({ id: Date.now().toString() + Math.random(), type: "output" as const, text });
    const err = (text: string) => ({ id: Date.now().toString() + Math.random(), type: "error" as const, text });

    try {
        switch (cmd) {
            case "help":
                addToHistory(out("Available commands: ls, cd, pwd, mkdir, touch, rm, cat, mv, clear, exit"));
                break;

            case "clear":
                setHistory([]);
                break;

            case "pwd":
                addToHistory(out(cwd));
                break;

            case "cd": {
                const target = args[0] || "/home/user";
                const absolutePath = resolvePath(cwd, target);

                if (!fs.exists(absolutePath)) {
                    addToHistory(err(`cd: ${target}: No such file or directory`));
                } else {
                    const stat = fs.stat(absolutePath);
                    if (stat?.type === "dir") {
                        setCwd(absolutePath);
                    } else {
                        addToHistory(err(`cd: ${target}: Not a directory`));
                    }
                }
                break;
            }

            case "ls": {
                const target = args[0] || ".";
                const absolutePath = resolvePath(cwd, target);

                if (!fs.exists(absolutePath)) {
                    addToHistory(err(`ls: cannot access '${target}': No such file or directory`));
                } else {
                    const stat = fs.stat(absolutePath);
                    if (stat?.type === "dir") {
                        const children = fs.list(absolutePath);
                        // Sort: directories first, then alphabetical
                        children.sort((a, b) => {
                            if (a.type === b.type) return a.name.localeCompare(b.name);
                            return a.type === 'dir' ? -1 : 1;
                        });

                        const names = children.map(c => c.type === 'dir' ? c.name + '/' : c.name).join("  ");
                        if (names) addToHistory(out(names));
                    } else {
                        // Is a file
                        addToHistory(out(args[0] || getFileName(absolutePath)));
                    }
                }
                break;
            }

            case "mkdir": {
                if (!args[0]) {
                    addToHistory(err("mkdir: missing operand"));
                    break;
                }
                const target = resolvePath(cwd, args[0]);
                if (fs.exists(target)) {
                    addToHistory(err(`mkdir: cannot create directory '${args[0]}': File exists`));
                } else {
                    // Check parent exists
                    const parent = getParentDir(target);
                    if (!fs.exists(parent)) {
                         addToHistory(err(`mkdir: cannot create directory '${args[0]}': No such file or directory`));
                    } else {
                        fs.mkdir(target);
                    }
                }
                break;
            }

            case "touch": {
                if (!args[0]) {
                    addToHistory(err("touch: missing operand"));
                    break;
                }
                const target = resolvePath(cwd, args[0]);
                if (!fs.exists(target)) {
                    const parent = getParentDir(target);
                     if (!fs.exists(parent)) {
                         addToHistory(err(`touch: cannot touch '${args[0]}': No such file or directory`));
                    } else {
                        fs.write(target, "");
                    }
                }
                // If exists, strictly touch should update timestamp, but our FS might not support that explicitly yet.
                // We'll treat 'exists' as success.
                break;
            }

            case "rm": {
                if (!args[0]) {
                    addToHistory(err("rm: missing operand"));
                    break;
                }
                const target = resolvePath(cwd, args[0]);
                if (!fs.exists(target)) {
                    addToHistory(err(`rm: cannot remove '${args[0]}': No such file or directory`));
                } else {
                    const stat = fs.stat(target);
                    if (stat?.type === 'dir') {
                         addToHistory(err(`rm: cannot remove '${args[0]}': Is a directory`));
                    } else {
                        fs.trash(target);
                    }
                }
                break;
            }

            case "cat": {
                if (!args[0]) {
                    addToHistory(err("cat: missing operand"));
                    break;
                }
                const target = resolvePath(cwd, args[0]);
                if (!fs.exists(target)) {
                    addToHistory(err(`cat: ${args[0]}: No such file or directory`));
                } else {
                    const stat = fs.stat(target);
                    if (stat?.type === 'dir') {
                        addToHistory(err(`cat: ${args[0]}: Is a directory`));
                    } else {
                        const content = fs.read(target);
                        if (content !== null) addToHistory(out(content));
                    }
                }
                break;
            }

            case "mv": {
                if (args.length < 2) {
                    addToHistory(err("mv: missing file operand"));
                    break;
                }
                const srcArg = args[0];
                const destArg = args[1];

                const srcPath = resolvePath(cwd, srcArg);
                const destPath = resolvePath(cwd, destArg);

                if (!fs.exists(srcPath)) {
                    addToHistory(err(`mv: cannot stat '${srcArg}': No such file or directory`));
                    break;
                }

                // Case 1: Destination exists
                if (fs.exists(destPath)) {
                    const destStat = fs.stat(destPath);
                    if (destStat?.type === 'dir') {
                        // Move into directory
                        fs.move(srcPath, destPath);
                    } else {
                        // Destination is a file. Overwrite is unsupported per strict requirements.
                        addToHistory(err(`mv: '${destArg}' exists. Overwriting not supported.`));
                    }
                    break;
                }

                // Case 2: Destination does not exist (Rename or Move+Rename)
                const destParentPath = getParentDir(destPath);
                const destName = getFileName(destPath);

                if (!fs.exists(destParentPath)) {
                     addToHistory(err(`mv: cannot move '${srcArg}' to '${destArg}': No such file or directory`));
                     break;
                }

                const destParentStat = fs.stat(destParentPath);
                if (destParentStat?.type !== 'dir') {
                    addToHistory(err(`mv: cannot move '${srcArg}' to '${destArg}': Not a directory`));
                    break;
                }

                // Parent exists.
                const srcParentPath = getParentDir(srcPath);

                if (srcParentPath === destParentPath) {
                    // Simple Rename
                    fs.rename(srcPath, destName);
                } else {
                    // Move + Rename
                    // 1. Move to new parent
                    fs.move(srcPath, destParentPath);

                    // 2. Rename
                    // After move, the file is at destParentPath + / + srcName
                    const srcName = getFileName(srcPath);
                    // We need to reconstruct the intermediate path
                    const intermediatePath = resolvePath(destParentPath, srcName);

                    // We need to be careful with async/state updates?
                    // useFS is synchronous-ish (state updates).
                    // Rename expects the path to the node.

                    // Since zustand updates might be batched or immediate, let's assume immediate for these simple actions.
                    // However, we might need to resolve the node again if we didn't have the ID.
                    // fs.rename uses resolve() internally.

                    fs.rename(intermediatePath, destName);
                }
                break;
            }

            case "exit":
                // In a real OS this closes the window.
                // We can't easily close window from here without WM store access.
                // But requirements said "Terminal owns shell state".
                // I'll leave it blank or clear.
                setHistory([]);
                break;

            case "echo":
                addToHistory(out(args.join(" ")));
                break;

            default:
                addToHistory(err(`${cmd}: command not found`));
        }

    } catch (e: any) {
        addToHistory(err(`Internal Error: ${e.message}`));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
          executeCommand(inputVal);
          setInputVal("");
      } else if (e.key === "ArrowUp") {
          e.preventDefault();
          if (commandHistory.length === 0) return;

          const newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
          setHistoryIndex(newIndex);
          setInputVal(commandHistory[newIndex]);
      } else if (e.key === "ArrowDown") {
          e.preventDefault();
          if (commandHistory.length === 0 || historyIndex === -1) return;

          const newIndex = historyIndex + 1;
          if (newIndex >= commandHistory.length) {
              setHistoryIndex(-1);
              setInputVal("");
          } else {
              setHistoryIndex(newIndex);
              setInputVal(commandHistory[newIndex]);
          }
      }
  };

  // Rendering Helpers
  const renderLine = (line: TerminalLine) => {
      if (line.type === "input") {
          const displayPath = line.cwd?.startsWith("/home/user")
            ? line.cwd.replace("/home/user", "~")
            : line.cwd;

          return (
             <div key={line.id} className="flex flex-wrap">
                <span className="text-ubt-green font-bold">vcto@ubuntu</span>
                <span className="text-white mx-px">:</span>
                <span className="text-ubt-blue font-bold">{displayPath}</span>
                <span className="text-white mx-px mr-2">$</span>
                <span className="whitespace-pre-wrap break-all">{line.text}</span>
             </div>
          );
      }
      if (line.type === "error") {
          return <div key={line.id} className="text-red-400 whitespace-pre-wrap break-all">{line.text}</div>;
      }
      // Output
      return <div key={line.id} className="text-white whitespace-pre-wrap break-all">{line.text}</div>;
  };

  const currentDisplayPath = cwd.startsWith("/home/user") ? cwd.replace("/home/user", "~") : cwd;

  return (
    <div
        ref={containerRef}
        className="h-full w-full bg-ub-drk-abrgn text-white text-sm font-mono p-2 overflow-y-auto"
        onClick={handleContainerClick}
    >
      <div className="flex flex-col gap-0.5">
          {history.map(renderLine)}
      </div>

      <div className="flex mt-0.5">
            <span className="text-ubt-green font-bold">vcto@ubuntu</span>
            <span className="text-white mx-px">:</span>
            <span className="text-ubt-blue font-bold">{currentDisplayPath}</span>
            <span className="text-white mx-px mr-2">$</span>
            <div className="relative flex-grow">
                <input
                    ref={inputRef}
                    type="text"
                    className="bg-transparent outline-none border-none text-white w-full absolute top-0 left-0 p-0 m-0 font-mono"
                    value={inputVal}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputVal(e.target.value)}
                    onKeyDown={handleKeyDown}
                    autoFocus
                    autoComplete="off"
                    spellCheck="false"
                />
                {/* Invisible span to maintain height/width flow if needed, but absolute works for overlay */}
                <span className="opacity-0 whitespace-pre-wrap break-all pointer-events-none">{inputVal}</span>
            </div>
      </div>
      <div ref={bottomRef} className="h-4" />
    </div>
  );
}
