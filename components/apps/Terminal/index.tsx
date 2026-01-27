"use client";

import React, { useState, useEffect, useRef } from "react";
import { useFS } from "@/lib/fs";
import { useTerminalEngine } from "./useTerminalEngine";

type TerminalLineType = "input" | "output" | "error";

interface TerminalLine {
  id: string;
  type: TerminalLineType;
  text: string;
  cwd?: string; // Only for input lines to show context
}

export default function TerminalApp() {
  const fs = useFS();
  const { execute } = useTerminalEngine();

  // We strictly own CWD.
  const [cwd, setCwd] = useState<string>("/home/user");

  // Terminal State
  const [history, setHistory] = useState<TerminalLine[]>([]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [inputVal, setInputVal] = useState("");
  const [cursorPos, setCursorPos] = useState(0);
  const [isFocused, setIsFocused] = useState(false);

  // We use textarea for input to handle multiline if needed, or just to match custom cursor easier
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Focus input on click anywhere
  const handleContainerClick = () => {
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

    console.log("Terminal Engine v2 Loaded");

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

  const executeCommand = async (cmdStr: string) => {
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

    // Execute via Engine
    const result = await execute(trimmed, cwd, setCwd);

    if (result.clear) {
        setHistory([]);
        return;
    }

    if (result.output) {
        const type = result.exitCode !== 0 ? "error" : "output";
        addToHistory({
            id: Date.now().toString() + Math.random(),
            type,
            text: result.output
        });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter") {
          e.preventDefault(); // Prevent newline in textarea
          executeCommand(inputVal);
          setInputVal("");
          setCursorPos(0);
      } else if (e.key === "ArrowUp") {
          e.preventDefault();
          if (commandHistory.length === 0) return;

          const newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
          setHistoryIndex(newIndex);
          const cmd = commandHistory[newIndex];
          setInputVal(cmd);
          setCursorPos(cmd.length);
      } else if (e.key === "ArrowDown") {
          e.preventDefault();
          if (commandHistory.length === 0 || historyIndex === -1) return;

          const newIndex = historyIndex + 1;
          if (newIndex >= commandHistory.length) {
              setHistoryIndex(-1);
              setInputVal("");
              setCursorPos(0);
          } else {
              setHistoryIndex(newIndex);
              const cmd = commandHistory[newIndex];
              setInputVal(cmd);
              setCursorPos(cmd.length);
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
        className="h-full w-full bg-ub-drk-abrgn text-white text-sm font-mono p-2 overflow-y-auto outline-none"
        onClick={handleContainerClick}
    >
      <div className="flex flex-col gap-0.5">
          {history.map(renderLine)}
      </div>

      <div className="flex mt-0.5 relative">
            <div className="flex-shrink-0">
                <span className="text-ubt-green font-bold">vcto@ubuntu</span>
                <span className="text-white mx-px">:</span>
                <span className="text-ubt-blue font-bold">{currentDisplayPath}</span>
                <span className="text-white mx-px mr-2">$</span>
            </div>

            <div className="relative flex-grow">
                 {/* Custom Cursor Display Layer */}
                 <div className="w-full h-full break-all whitespace-pre-wrap font-mono text-white pointer-events-none min-h-[1.25rem]">
                    <span>{inputVal.slice(0, cursorPos)}</span>
                    <span className={`inline-block align-bottom ${isFocused ? "animate-blink bg-gray-400 text-black" : "border border-gray-500 text-white"}`}>
                         {inputVal[cursorPos] || '\u00A0'}
                    </span>
                    <span>{inputVal.slice(cursorPos + 1)}</span>
                 </div>

                {/* Hidden Input Layer */}
                <textarea
                    ref={inputRef}
                    className="absolute top-0 left-0 w-full h-full opacity-0 resize-none overflow-hidden bg-transparent border-none outline-none p-0 m-0 font-mono"
                    value={inputVal}
                    onChange={(e) => {
                        setInputVal(e.target.value);
                        setCursorPos(e.target.selectionStart);
                    }}
                    onSelect={(e) => setCursorPos(e.currentTarget.selectionStart)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    autoFocus
                    autoComplete="off"
                    spellCheck="false"
                />
            </div>
      </div>
      <div ref={bottomRef} className="h-4" />
    </div>
  );
}
