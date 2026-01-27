"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useFS } from '@/lib/fs';

interface NanoProps {
    filePath: string;
    onExit: () => void;
}

export default function Nano({ filePath, onExit }: NanoProps) {
    const fs = useFS();
    const [content, setContent] = useState("");
    const [initialContent, setInitialContent] = useState("");
    const [mode, setMode] = useState<'edit' | 'save_confirm'>('edit');
    const [message, setMessage] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (filePath) {
            const existing = fs.read(filePath);
            if (existing !== null) {
                setContent(existing);
                setInitialContent(existing);
                setMessage(`Read ${existing.split('\n').length} lines`);
            } else {
                setMessage("New File");
            }
        }
        // Focus automatically
        setTimeout(() => textareaRef.current?.focus(), 50);
    }, [filePath, fs]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        const key = e.key.toLowerCase();

        if (mode === 'edit') {
            if (e.ctrlKey) {
                if (key === 'x') {
                    e.preventDefault();
                    if (content !== initialContent) {
                        setMode('save_confirm');
                    } else {
                        onExit();
                    }
                } else if (key === 'o') {
                    e.preventDefault();
                    fs.write(filePath, content);
                    setInitialContent(content); // Update initial so ^X won't prompt if no further changes
                    setMessage(`Wrote ${content.split('\n').length} lines`);
                }
            }
        } else if (mode === 'save_confirm') {
            e.preventDefault();
            if (key === 'y') {
                fs.write(filePath, content);
                onExit();
            } else if (key === 'n') {
                onExit();
            } else if (e.ctrlKey && key === 'c') {
                setMode('edit');
                setMessage("Cancelled");
            }
        }
    };

    const isModified = content !== initialContent;

    return (
        <div className="flex flex-col h-full w-full bg-ub-drk-abrgn text-white font-mono text-sm absolute top-0 left-0 z-50">
            {/* Header */}
            <div className="flex justify-between items-center bg-gray-300 text-black px-2 py-0.5">
                <span className="font-bold">GNU nano 6.2</span>
                <span>{filePath.split('/').pop()}</span>
                <span>{isModified ? "Modified" : ""}</span>
            </div>

            {/* Editor Body */}
            <div className="flex-grow relative">
                <textarea
                    ref={textareaRef}
                    className="w-full h-full bg-transparent resize-none outline-none p-2 font-mono text-white caret-white"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={mode !== 'edit'}
                    autoFocus
                    spellCheck={false}
                />
            </div>

            {/* Message Bar */}
            <div className="w-full bg-ub-drk-abrgn px-2 py-0.5 min-h-[1.5em] flex items-center">
                 {mode === 'save_confirm' ? (
                     <div className="bg-white text-black px-1 w-full">
                         Save modified buffer?  <span className="font-bold">Y</span> Yes <span className="font-bold">N</span> No <span className="font-bold">^C</span> Cancel
                     </div>
                 ) : (
                     <span>{message}</span>
                 )}
            </div>

            {/* Shortcuts Footer */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1 px-2 py-1 text-xs">
                <div className="flex"><span className="bg-white text-black px-0.5 mr-1">^O</span> Write Out</div>
                <div className="flex"><span className="bg-white text-black px-0.5 mr-1">^X</span> Exit</div>
            </div>
        </div>
    );
}
