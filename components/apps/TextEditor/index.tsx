"use client";

import React, { useEffect, useState } from "react";
import { useFS } from "@/lib/fs";

interface TextEditorProps {
    filePath?: string;
}

export default function TextEditor({ filePath }: TextEditorProps) {
    const fs = useFS();
    const [content, setContent] = useState<string>("");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (filePath) {
            // Check if file exists
            if (!fs.exists(filePath)) {
                setError(`File not found: ${filePath}`);
                return;
            }

            // Read content
            const fileContent = fs.read(filePath);
            if (fileContent !== null) {
                setContent(fileContent);
                setError(null);
            } else {
                setError(`Could not read file: ${filePath}`);
            }
        } else {
            // Default empty content for new/unspecified file
            setContent("");
            setError(null);
        }
    }, [filePath, fs]); // dependency on fs is safe as it's stable from hook

    return (
        <div className="flex flex-col h-full w-full bg-ub-cool-grey text-white font-mono text-sm overflow-auto p-1 select-text">
            {error ? (
                <div className="text-red-400 font-bold p-4">
                    {error}
                </div>
            ) : (
                <textarea
                    className="w-full h-full resize-none outline-none border-none bg-transparent text-white p-2 font-mono text-sm"
                    value={content}
                    readOnly
                    spellCheck={false}
                />
            )}
        </div>
    );
}
