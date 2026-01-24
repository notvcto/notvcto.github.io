'use client';

import { useState, useRef, useEffect } from 'react';

interface HistoryItem {
  type: 'command' | 'output';
  content: React.ReactNode;
}

export const Terminal = () => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([
    { type: 'output', content: 'Welcome to Catppuccin OS v2.0.0' },
    { type: 'output', content: 'Type "help" to see available commands.' },
  ]);
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleCommand = (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    const newHistory = [...history, { type: 'command' as const, content: trimmed }];

    switch (trimmed.toLowerCase()) {
      case 'help':
        newHistory.push({ type: 'output', content:
          <div className="flex flex-col gap-1 text-subtext-dark">
            <div>Available commands:</div>
            <div className="grid grid-cols-[100px_1fr] gap-2">
              <span className="text-yellow-accent">help</span><span>Show this help message</span>
              <span className="text-yellow-accent">ls</span><span>List directory contents</span>
              <span className="text-yellow-accent">whoami</span><span>Print current user</span>
              <span className="text-yellow-accent">clear</span><span>Clear terminal history</span>
              <span className="text-yellow-accent">neofetch</span><span>System information</span>
            </div>
          </div>
        });
        break;
      case 'ls':
        newHistory.push({ type: 'output', content:
          <div className="grid grid-cols-[auto_1fr] gap-x-4 text-subtext-dark">
            <span className="text-primary">drwxr-xr-x</span> <span className="text-blue-accent">Projects/</span>
            <span className="text-primary">drwxr-xr-x</span> <span className="text-blue-accent">Documents/</span>
            <span className="text-text-dark">-rw-r--r--</span> <span>resume.pdf</span>
            <span className="text-text-dark">-rw-r--r--</span> <span>about.txt</span>
          </div>
        });
        break;
      case 'whoami':
        newHistory.push({ type: 'output', content: 'user' });
        break;
      case 'clear':
        setHistory([]);
        setInput('');
        return;
      case 'neofetch':
        newHistory.push({ type: 'output', content:
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="text-primary flex-shrink-0 select-none">
              <pre className="text-xs sm:text-sm leading-tight">
{`       /\\
      /  \\
     /    \\
    /      \\
   /   ,,   \\
  /   |  |  -\\
 /_-''    ''-_\\`}
              </pre>
            </div>
            <div className="flex-1 space-y-0.5 text-xs sm:text-sm">
              <div><span className="text-primary font-bold">user</span>@<span className="text-primary font-bold">arch</span></div>
              <div className="flex"><span className="w-20 text-primary">OS</span> <span>Arch Linux x86_64</span></div>
              <div className="flex"><span className="w-20 text-primary">WM</span> <span>Hyprland</span></div>
              <div className="flex"><span className="w-20 text-primary">Shell</span> <span>zsh 5.9</span></div>
              <div className="pt-2 flex gap-1">
                <div className="w-3 h-3 rounded-full bg-red-accent"></div>
                <div className="w-3 h-3 rounded-full bg-green-accent"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-accent"></div>
                <div className="w-3 h-3 rounded-full bg-blue-accent"></div>
                <div className="w-3 h-3 rounded-full bg-primary"></div>
              </div>
            </div>
          </div>
        });
        break;
      default:
        newHistory.push({ type: 'output', content: `command not found: ${trimmed}` });
    }

    setHistory(newHistory);
    setInput('');
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCommand(input);
    }
  };

  return (
    <div
      className="h-full bg-[#1e1e2e]/95 p-4 font-mono text-sm overflow-y-auto cursor-text"
      onClick={() => inputRef.current?.focus()}
    >
      {history.map((item, i) => (
        <div key={i} className="mb-1 break-words">
          {item.type === 'command' ? (
            <div>
              <span className="text-green-accent">user@arch</span>
              <span className="text-text-dark">:</span>
              <span className="text-blue-accent">~</span>
              <span className="text-text-dark">$ </span>
              <span>{item.content}</span>
            </div>
          ) : (
            <div className="text-text-dark">{item.content}</div>
          )}
        </div>
      ))}

      <div className="flex items-center">
        <span className="text-green-accent">user@arch</span>
        <span className="text-text-dark">:</span>
        <span className="text-blue-accent">~</span>
        <span className="text-text-dark">$ </span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          className="bg-transparent border-none outline-none flex-1 ml-2 text-text-dark w-full"
          autoFocus
          spellCheck={false}
          autoComplete="off"
        />
      </div>
      <div ref={bottomRef} />
    </div>
  );
};
