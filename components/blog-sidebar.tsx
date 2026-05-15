"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Search, BookOpen, Command } from "lucide-react"
import { motion } from "framer-motion"
import type { BlogPost } from "@/lib/blog"

interface BlogSidebarProps {
  posts: BlogPost[]
}

interface SidebarArticleLinkProps {
  post: BlogPost
  isActive: boolean
}

function SidebarArticleLink({ post, isActive }: SidebarArticleLinkProps) {
  const [isHovered, setIsHovered] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLSpanElement>(null)
  const [overflow, setOverflow] = useState(0)

  useEffect(() => {
    if (containerRef.current && textRef.current) {
      const containerWidth = containerRef.current.offsetWidth
      const textWidth = textRef.current.scrollWidth
      if (textWidth > containerWidth) {
        setOverflow(textWidth - containerWidth + 30) // Extra padding for the sweep end
      } else {
        setOverflow(0)
      }
    }
  }, [post.title, post.shortTitle])

  return (
    <Link
      href={`/blog/${post.slug}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`flex items-center gap-3 px-3 py-3 text-base font-sans rounded-xl transition-all duration-300 leading-relaxed group/link ${
        isActive
          ? "bg-white/5 text-white font-medium shadow-[inset_0_0_20px_rgba(255,255,255,0.02)]"
          : "text-muted-foreground hover:bg-white/[0.03] hover:text-foreground"
      }`}
    >
      <BookOpen className={`w-5 h-5 shrink-0 transition-opacity duration-300 ${isActive ? "text-white opacity-100" : "opacity-30 group-hover/link:opacity-70"}`} />
      
      <div 
        ref={containerRef} 
        className="flex-1 overflow-hidden relative"
        style={{
          maskImage: !isHovered && overflow > 0 
            ? "linear-gradient(to right, black calc(100% - 24px), transparent 100%)" 
            : "none",
          WebkitMaskImage: !isHovered && overflow > 0 
            ? "linear-gradient(to right, black calc(100% - 24px), transparent 100%)" 
            : "none"
        }}
      >
        <motion.span
          ref={textRef}
          className="inline-block whitespace-nowrap"
          animate={isHovered && overflow > 0 ? { x: [0, -overflow, 0] } : { x: 0 }}
          transition={isHovered && overflow > 0 ? { 
            duration: overflow * 0.04 + 1.5, 
            repeat: Infinity,
            repeatDelay: 1,
            ease: "easeInOut"
          } : { duration: 0.4 }}
        >
          {post.shortTitle || post.title}
        </motion.span>
      </div>
    </Link>
  )
}

export function BlogSidebar({ posts }: BlogSidebarProps) {
  const pathname = usePathname()
  const [searchQuery, setSearchQuery] = useState("")
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  const filteredPosts = posts.filter((post) =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.shortTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const categories = Array.from(new Set(filteredPosts.map(post => post.category)))

  return (
    <aside className="hidden md:flex w-72 lg:w-80 flex-col sticky h-[calc(100vh-8rem)] top-24 shrink-0">
      <div className="flex-1 bg-[#0a0a0a]/40 backdrop-blur-md border border-white/5 rounded-2xl flex flex-col overflow-hidden shadow-2xl">
        {/* Search Bar */}
        <div className="p-4 border-b border-white/5">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-white transition-all duration-300" />
            <input 
              ref={searchInputRef}
              type="text" 
              placeholder="Search articles..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/5 rounded-xl py-2.5 pl-10 pr-12 text-[12px] font-mono tracking-tight text-foreground focus:outline-none focus:border-white/10 focus:bg-white/[0.05] transition-all duration-300 placeholder:text-muted-foreground/50 shadow-inner"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 px-1.5 py-1 rounded border border-white/10 bg-white/5 pointer-events-none group-focus-within:border-white/20 transition-colors duration-300">
              <Command className="w-2.5 h-2.5 text-muted-foreground group-focus-within:text-white transition-colors duration-300" />
              <span className="text-[10px] font-mono text-muted-foreground leading-none group-focus-within:text-white transition-colors duration-300">K</span>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <div className="space-y-8">
            {categories.length > 0 ? (
              categories.map((category) => (
                <div key={category}>
                  <h3 className="font-mono text-[13px] tracking-[0.25em] text-muted-foreground uppercase mb-5 pl-2 opacity-70 font-semibold">
                    {category}
                  </h3>
                  <ul className="space-y-1.5">
                    {filteredPosts
                      .filter((post) => post.category === category)
                      .map((post) => (
                        <li key={post.slug}>
                          <SidebarArticleLink 
                            post={post} 
                            isActive={pathname === `/blog/${post.slug}`} 
                          />
                        </li>
                      ))}
                  </ul>
                </div>
              ))
            ) : (
              <div className="p-8 text-center space-y-2">
                <p className="text-xs font-mono text-muted-foreground opacity-50 uppercase tracking-widest">No matches found</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </aside>
  )
}
