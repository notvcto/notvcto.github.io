"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import type { BlogPost } from "@/lib/blog"

interface BlogIndexClientProps {
  firstPost: BlogPost | null
  latestStatus: string
}

export function BlogIndexClient({ firstPost, latestStatus }: BlogIndexClientProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-12"
    >
      <header className="space-y-4">
        <h1 className="text-5xl font-playfair tracking-tight text-white leading-tight">
          Blog
        </h1>
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
            I'm a System Architect and Interface Designer obsessed with building intelligent digital experiences. 
            This blog serves as a log for my technical investigations, architectural patterns, and design philosophies.
          </div>
        </div>
      </div>

      <section className="space-y-6 text-muted-foreground font-sans leading-relaxed text-lg">
        <p>
          The goal of this site is to document the techniques, steps, and thought processes I use while solving 
          complex engineering challenges. It also serves as a place for me to track my progress and hopefully 
          help others learn alongside me.
        </p>
        <p>
          Each entry here is a deep dive into a specific problem space, ranging from low-level systems 
          optimization to the aesthetics of human-computer interaction.
        </p>
      </section>

      {/* Next Article Card - Refined Centering */}
      {firstPost && (
        <Link href={`/blog/${firstPost.slug}`} className="group block">
          <div className="relative p-8 bg-white/[0.01] backdrop-blur-md border border-white/5 rounded-2xl transition-all duration-500 group-hover:bg-white/[0.03] group-hover:border-white/10 group-hover:translate-y-[-4px] flex items-center justify-between shadow-2xl overflow-hidden min-h-[140px]">
            {/* Subtle Neutral Glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative flex flex-col justify-center">
              <span className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase opacity-60 mb-2 group-hover:text-white transition-colors">Next Article</span>
              <h3 className="text-2xl font-playfair text-white leading-tight">{firstPost.title}</h3>
            </div>
            
            <div className="relative w-11 h-11 rounded-full border border-white/10 flex items-center justify-center bg-white/5 transition-all duration-500 group-hover:border-white/20 group-hover:bg-white/10 group-hover:scale-105 shrink-0 ml-8">
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-white transition-all translate-x-0 group-hover:translate-x-0.5" />
            </div>
          </div>
        </Link>
      )}

      <footer className="pt-12 border-t border-white/5 opacity-30">
        <div className="flex items-center gap-4 font-mono text-[9px] tracking-[0.2em] text-muted-foreground uppercase">
          <span>Powered by Next.js</span>
          <span>•</span>
          <span>Open Source</span>
        </div>
      </footer>
    </motion.div>
  )
}
