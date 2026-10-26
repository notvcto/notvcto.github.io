"use client";

import type { BlogPostMeta } from "@/lib/blog";
import { formatDistanceToNow } from "date-fns";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AdCompartment } from "@/components/blog-ads";

interface BlogIndexClientProps {
    firstPost: BlogPostMeta | null;
    latestDate: string | null;
}

const MONTHS = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];

function formatDate(dateStr: string) {
    const [year, month, day] = dateStr.split("T")[0].split("-");
    return `${MONTHS[parseInt(month) - 1]} ${parseInt(day)}, ${year}`;
}

export function BlogIndexClient({ firstPost, latestDate }: BlogIndexClientProps) {
    const staticStatus = latestDate ? `Last updated ${formatDate(latestDate)}` : "No updates yet";
    const [latestStatus, setLatestStatus] = useState(staticStatus);

    useEffect(() => {
        if (!latestDate) return;
        const postDate = new Date(latestDate);
        const ageMs = Date.now() - postDate.getTime();
        const ageDays = ageMs / (1000 * 60 * 60 * 24);
        if (ageDays >= 0 && ageDays < 7) {
            setLatestStatus(`Last updated ${formatDistanceToNow(postDate)} ago`);
        }
    }, [latestDate]);

    return (
        <div className="space-y-12">
            <header className="space-y-4">
                <h1 className="text-5xl font-playfair tracking-tight text-white leading-tight">Blog</h1>
                <div className="flex items-center gap-3 font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
                    <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                    {latestStatus}
                </div>
            </header>

            {/* Terminal Block */}
            <div className="bg-[#0a0a0a] border border-white/5 rounded-xl overflow-hidden shadow-2xl">
                <div className="px-4 py-2 bg-white/5 border-b border-white/5 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500/50" />
                    <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
                    <div className="w-2 h-2 rounded-full bg-green-500/50" />
                    <span className="ml-2 font-mono text-[10px] text-muted-foreground opacity-50">zsh</span>
                </div>
                <div className="p-6 font-mono text-sm leading-relaxed">
                    <div className="flex gap-3">
                        <span className="text-accent">$</span>
                        <span className="text-white">whoami</span>
                    </div>
                    <div className="mt-4 text-muted-foreground leading-relaxed">
                        I&apos;m Vic. I build systems and look for the assumptions that break them. Most of my work
                        lives in Rust, operating systems, and security research.
                    </div>
                </div>
            </div>

            <section className="space-y-6 text-muted-foreground font-sans leading-relaxed text-lg">
                <p>
                    This is where I document the work: building Ferber, a capability-based microkernel;
                    separating signature validity from attribution in VWH; and testing how small language models
                    reason through security problems with Zero.
                </p>
                <p>
                    I write about what I tried, what broke, and what the results actually prove. Expect kernel
                    internals, cryptographic tooling, and security investigations with enough detail to check my work.
                </p>
            </section>

            {/* Next Article Card */}
            {firstPost && (
                <Link href={`/blog/${firstPost.slug}`} className="group block">
                    <div className="relative p-8 bg-white/[0.01] backdrop-blur-md border border-white/5 rounded-2xl transition-all duration-500 group-hover:bg-white/[0.03] group-hover:border-white/10 group-hover:translate-y-[-4px] flex items-center justify-between shadow-2xl overflow-hidden min-h-[140px]">
                        <div className="absolute inset-0 bg-gradient-to-r from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        <div className="relative flex flex-col justify-center">
                            <span className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase opacity-60 mb-2 group-hover:text-white transition-colors">
                                Next Article
                            </span>
                            <h3 className="text-2xl font-playfair text-white leading-tight">{firstPost.title}</h3>
                        </div>

                        <div className="relative w-11 h-11 rounded-full border border-white/10 flex items-center justify-center bg-white/5 transition-all duration-500 group-hover:border-white/20 group-hover:bg-white/10 group-hover:scale-105 shrink-0 ml-8">
                            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-white transition-all translate-x-0 group-hover:translate-x-0.5" />
                        </div>
                    </div>
                </Link>
            )}

            <AdCompartment placement="index"/>

            <footer className="pt-12 border-t border-white/5 opacity-30">
                <div className="flex items-center gap-4 font-mono text-[9px] tracking-[0.2em] text-muted-foreground uppercase">
                    <span>Powered by Next.js</span>
                    <span>•</span>
                    <span>Open Source</span>
                </div>
            </footer>
        </div>
    );
}
