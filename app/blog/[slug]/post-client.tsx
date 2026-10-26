/// <reference types="react-syntax-highlighter" />
"use client";

import { getComplexityColor, type BlogPost, type BlogPostMeta } from "@/lib/blog";
import { Check, ChevronRight, Share2, X } from "lucide-react";
import Link from "next/link";
import { isValidElement, useEffect, useRef, useState, type ReactNode } from "react";
import { useDialog } from "@/components/use-dialog";
import ReactMarkdown from "react-markdown";
import SyntaxHighlighter from "react-syntax-highlighter/dist/esm/prism-light";
import bash from "react-syntax-highlighter/dist/esm/languages/prism/bash";
import json from "react-syntax-highlighter/dist/esm/languages/prism/json";
import markup from "react-syntax-highlighter/dist/esm/languages/prism/markup";
import nasm from "react-syntax-highlighter/dist/esm/languages/prism/nasm";
import python from "react-syntax-highlighter/dist/esm/languages/prism/python";
import rust from "react-syntax-highlighter/dist/esm/languages/prism/rust";
import vscDarkPlus from "react-syntax-highlighter/dist/esm/styles/prism/vsc-dark-plus";
import remarkGfm from "remark-gfm";
import { AdCompartment } from "@/components/blog-ads";

for (const [name, grammar] of Object.entries({ bash, json, markup, nasm, python, rust })) {
    SyntaxHighlighter.registerLanguage(name, grammar);
}

interface BlogPostClientProps {
    post: BlogPost;
    nextPost: BlogPostMeta | null;
}

export function BlogPostClient({ post, nextPost }: BlogPostClientProps) {
    const [copied, setCopied] = useState(false);
    const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);
    const dialogRef = useDialog(!!lightbox, () => setLightbox(null));
    const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        return () => {
            if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
        };
    }, []);

    const canonicalUrl = `https://notvc.to/blog/${post.slug}`;

    return (
        <article className="prose prose-invert prose-quoteless max-w-none prose-headings:font-playfair prose-p:font-sans prose-p:text-muted-foreground prose-p:text-lg prose-p:leading-relaxed prose-li:text-muted-foreground prose-strong:text-white prose-pre:bg-white/[0.02] prose-pre:border prose-pre:border-white/5">
            <header className="mb-12 border-b border-white/5 pb-8 not-prose">
                <div className="flex items-center gap-6 mb-6 flex-wrap">
                    <div className="flex items-center gap-2 px-2 py-0.5 border border-white/10 rounded font-mono text-[10px] tracking-widest text-muted-foreground uppercase bg-white/[0.02]">
                        {post.category}
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
                            Complexity:
                        </span>
                        <span
                            className={`font-mono text-[10px] font-bold tracking-widest ${getComplexityColor(post.complexity)}`}
                        >
                            {post.complexity.toFixed(1)}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
                            Read Time:
                        </span>
                        <span className="font-mono text-[10px] text-muted-foreground uppercase">
                            {post.readingTime}
                        </span>
                    </div>

                    <span className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase ml-auto">
                        {post.date.split("T")[0]}
                    </span>
                </div>

                <h1 className="text-2xl sm:text-3xl md:text-5xl font-playfair tracking-tight mb-6 leading-tight text-white">
                    {post.title}
                </h1>
                <p className="text-lg sm:text-xl text-muted-foreground font-sans leading-relaxed border-l-2 border-white/10 pl-6 italic">
                    {post.description}
                </p>
            </header>

            <AdCompartment placement="intro"/>

            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    h1: props => (
                        <h1
                            className="text-3xl sm:text-4xl md:text-5xl font-playfair font-bold mb-6 text-white"
                            {...props}
                        />
                    ),
                    h2: props => (
                        <h2
                            className="text-xl sm:text-2xl md:text-3xl font-playfair font-bold mt-12 mb-4 text-white"
                            {...props}
                        />
                    ),
                    h3: props => (
                        <h3
                            className="text-lg sm:text-xl md:text-2xl font-playfair font-bold mt-8 mb-3 text-white"
                            {...props}
                        />
                    ),
                    p: props => (
                        <p
                            className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-6 font-sans"
                            {...props}
                        />
                    ),
                    ul: props => <ul className="list-disc pl-6 space-y-2 mb-6 text-muted-foreground" {...props} />,
                    ol: props => <ol className="list-decimal pl-6 space-y-2 mb-6 text-muted-foreground" {...props} />,
                    li: props => <li className="text-lg leading-relaxed" {...props} />,
                    hr: props => <hr className="my-12 border-white/5" {...props} />,
                    blockquote: props => (
                        <blockquote
                            className="border-l-4 border-white/10 pl-6 py-2 my-8 italic bg-white/[0.01] rounded-r-lg"
                            {...props}
                        />
                    ),
                    a: ({ href, ...props }) => {
                        const isExternal = typeof href === "string" && /^(https?:)?\/\//i.test(href);

                        return (
                            <a
                                href={href}
                                rel={isExternal ? "noreferrer" : undefined}
                                referrerPolicy={isExternal ? "no-referrer" : undefined}
                                {...props}
                            />
                        );
                    },
                    table: props => (
                        <div className="my-8 overflow-x-auto border border-white/10 rounded-xl bg-white/[0.01]">
                            <table className="w-full border-collapse text-left m-0!" {...props} />
                        </div>
                    ),
                    thead: props => <thead className="border-b border-white/10 bg-white/[0.02]" {...props} />,
                    tbody: props => <tbody {...props} />,
                    th: props => (
                        <th
                            className="px-6 py-4 font-mono text-[10px] tracking-widest text-muted-foreground uppercase border-none!"
                            {...props}
                        />
                    ),
                    tr: props => <tr className="border-b border-white/10 last:border-none!" {...props} />,
                    td: props => <td className="px-6 py-4 text-white/80 border-none!" {...props} />,
                    code: ({ children, className }) => (
                        <code className={`bg-white/10 px-1.5 py-0.5 rounded text-sm text-white/90 font-mono [overflow-wrap:anywhere] ${className || ""}`}>
                            {children}
                        </code>
                    ),
                    pre: ({ children }) => {
                        const code = isValidElement<{ className?: string; children?: ReactNode }>(children) ? children.props : null;
                        const label = /language-([\w-]+)/.exec(code?.className || "")?.[1] || "text";
                        const language = label === "asm" ? "nasm" : label === "html" ? "markup" : label;
                        return (
                            <div className="not-prose my-8 rounded-xl border border-white/5 overflow-hidden bg-[#0a0a0a]">
                                <div className="px-4 py-2 bg-white/[0.03] border-b border-white/5 font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
                                    {label}
                                </div>
                                <SyntaxHighlighter
                                    style={vscDarkPlus}
                                    language={language}
                                    PreTag="pre"
                                    customStyle={{ margin: 0, padding: "1.5rem", background: "transparent", fontSize: "0.875rem", lineHeight: "1.7" }}
                                >
                                    {String(code?.children ?? "").replace(/\n$/, "")}
                                </SyntaxHighlighter>
                            </div>
                        );
                    },
                    img: ({ src, alt }) => {
                        const safeSrc =
                            typeof src === "string" && src.startsWith("/") && !src.startsWith("//") ? src : "";
                        const fmt =
                            typeof src === "string"
                                ? src.split(".").pop()?.split("?")[0]?.toUpperCase() || "IMAGE"
                                : "IMAGE";

                        if (!safeSrc) {
                            return (
                                <span className="block my-8 not-prose rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3 font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
                                    Remote image blocked
                                </span>
                            );
                        }

                        return (
                            <span role="figure" className="block my-8 not-prose rounded-xl border border-white/5 overflow-hidden shadow-2xl bg-[#0a0a0a]">
                                <span className="flex items-center justify-between px-4 py-2 bg-white/[0.03] border-b border-white/5">
                                    <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
                                        {fmt}
                                    </span>
                                    <span className="flex gap-1.5">
                                        <span className="w-2 h-2 rounded-full bg-white/10" />
                                        <span className="w-2 h-2 rounded-full bg-white/10" />
                                    </span>
                                </span>
                                <button type="button" className="block w-full" aria-label={`Enlarge ${alt || "image"}`} onClick={() => setLightbox({ src: safeSrc, alt: alt || "" })}>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={safeSrc}
                                    alt={alt || ""}
                                    loading="lazy"
                                    referrerPolicy="no-referrer"
                                    className="w-full object-cover cursor-zoom-in transition-opacity duration-300 hover:opacity-90"
                                />
                                </button>
                                {alt && (
                                    <span className="block px-4 py-2 border-t border-white/5 text-center font-mono text-[11px] tracking-widest text-muted-foreground uppercase bg-white/[0.02]">
                                        {alt}
                                    </span>
                                )}
                            </span>
                        );
                    },
                }}
            >
                {post.content}
            </ReactMarkdown>

            <AdCompartment placement="end"/>

            <dialog
                ref={dialogRef}
                aria-label={lightbox?.alt || "Image preview"}
                onClick={event => { if (event.target === event.currentTarget) setLightbox(null); }}
                className="fixed inset-0 m-0 h-full w-full max-h-none max-w-none border-0 bg-black/90 p-4 md:p-8 text-white backdrop:bg-black/70"
            >
                {lightbox && (
                    <div className="flex h-full items-center justify-center pointer-events-none">
                        <button onClick={() => setLightbox(null)} aria-label="Close image preview" className="pointer-events-auto absolute top-4 right-4 p-3 rounded-full bg-black border border-white/20">
                            <X className="w-5 h-5" />
                        </button>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={lightbox.src} alt={lightbox.alt} referrerPolicy="no-referrer" className="pointer-events-auto max-w-full max-h-[90vh] object-contain rounded-xl" />
                    </div>
                )}
            </dialog>

            <footer className="mt-20 pt-12 border-t border-white/5 not-prose space-y-8">
                {nextPost && (
                    <Link href={`/blog/${nextPost.slug}`} className="group block">
                        <div className="relative p-8 bg-white/[0.01] border border-white/5 rounded-2xl transition-all duration-500 group-hover:bg-white/[0.03] group-hover:border-white/10 group-hover:-translate-y-1 flex items-center justify-between shadow-2xl overflow-hidden min-h-[120px]">
                            <div className="absolute inset-0 bg-gradient-to-r from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="relative flex flex-col justify-center">
                                <span className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase opacity-60 mb-2 group-hover:text-white transition-colors">
                                    Next Article
                                </span>
                                <h3 className="text-xl font-playfair text-white leading-tight">{nextPost.title}</h3>
                            </div>
                            <div className="relative w-10 h-10 rounded-full border border-white/10 flex items-center justify-center bg-white/5 transition-all duration-500 group-hover:border-white/20 group-hover:bg-white/10 group-hover:scale-105 shrink-0 ml-8">
                                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-white transition-colors" />
                            </div>
                        </div>
                    </Link>
                )}

                <div className="flex items-center justify-between gap-4">
                    <div className="flex gap-2 flex-wrap">
                        {post.tags.map(tag => (
                            <span
                                key={tag}
                                className="font-mono text-[9px] tracking-[0.2em] text-muted-foreground border border-white/10 px-3 py-1 rounded-full uppercase bg-white/[0.02]"
                            >
                                #{tag}
                            </span>
                        ))}
                    </div>
                    <button
                        onClick={() => {
                            navigator.clipboard
                                .writeText(canonicalUrl)
                                .then(() => {
                                    setCopied(true);
                                    if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
                                    copyTimeoutRef.current = setTimeout(() => setCopied(false), 2000);
                                })
                                .catch(() => setCopied(false));
                        }}
                        className="w-10 h-10 rounded-full border border-white/10 bg-white/[0.02] flex items-center justify-center shrink-0 hover:border-white/20 hover:bg-white/[0.05] transition-all duration-300"
                        aria-label="Copy link"
                    >
                        {copied ? (
                            <Check className="w-4 h-4 text-accent" />
                        ) : (
                            <Share2 className="w-4 h-4 text-muted-foreground" />
                        )}
                    </button>
                </div>
            </footer>
        </article>
    );
}
