"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Search, List, X, BookOpen, ChevronRight } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import type { BlogPost } from "@/lib/blog"

interface BlogMobileNavProps {
  posts: BlogPost[]
}

export function BlogMobileNav({ posts }: BlogMobileNavProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true)
  }, [])

  const filteredPosts = posts.filter((post) =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.shortTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const categories = Array.from(new Set(filteredPosts.map(post => post.category)))

  // Close when pathname changes
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  if (!mounted) return null

  return (
    <>
      {/* Mobile Trigger - Fixed Bottom Center Pill */}
      <motion.button
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] h-11 px-6 bg-[#0a0a0a]/80 backdrop-blur-2xl text-white rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex items-center gap-3 border border-white/10 active:bg-white/[0.1] transition-colors"
      >
        <List className="w-4 h-4 opacity-70" />
        <span className="font-mono text-[10px] tracking-[0.2em] uppercase pt-0.5">Investigation Log</span>
      </motion.button>

      {/* Overlay Drawer via Portal */}
      {createPortal(
        <AnimatePresence>
          {isOpen && (
            <div className="fixed inset-0 z-[9999] md:hidden">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsOpen(false)}
                className="absolute inset-0 bg-background/80 backdrop-blur-md"
              />
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="absolute inset-y-0 right-0 w-[85%] max-w-sm bg-[#0a0a0a]/60 backdrop-blur-xl border-l border-white/5 flex flex-col shadow-2xl"
              >
                {/* Header */}
                <div className="p-6 pt-12 border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                    <span className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">Investigation Log</span>
                  </div>
                  <button onClick={() => setIsOpen(false)} className="p-2 -mr-2 text-muted-foreground hover:text-white transition-colors">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Search */}
                <div className="p-4 border-b border-white/5">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search investigations..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-white/[0.03] border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-[12px] font-mono text-foreground focus:outline-none focus:border-white/10"
                    />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                  {categories.length > 0 ? (
                    categories.map((category) => (
                      <div key={category}>
                        <h3 className="font-mono text-[11px] tracking-[0.2em] text-muted-foreground uppercase mb-4 opacity-50 font-semibold">
                          {category}
                        </h3>
                        <ul className="space-y-2">
                          {filteredPosts
                            .filter((post) => post.category === category)
                            .map((post) => {
                              const isActive = pathname === `/blog/${post.slug}`
                              return (
                                <li key={post.slug}>
                                  <Link
                                    href={`/blog/${post.slug}`}
                                    className={`flex items-center justify-between p-3 rounded-xl transition-all ${
                                      isActive 
                                        ? "bg-white/5 text-white border border-white/10" 
                                        : "text-muted-foreground hover:bg-white/[0.02]"
                                    }`}
                                  >
                                    <div className="flex items-center gap-3">
                                      <BookOpen className={`w-4 h-4 ${isActive ? "text-accent" : "opacity-30"}`} />
                                      <span className="text-sm font-sans truncate max-w-[180px]">
                                        {post.shortTitle || post.title}
                                      </span>
                                    </div>
                                    <ChevronRight className={`w-4 h-4 transition-transform ${isActive ? "opacity-100" : "opacity-20"}`} />
                                  </Link>
                                </li>
                              )
                            })}
                        </ul>
                      </div>
                    ))
                  ) : (
                    <div className="py-20 text-center">
                      <p className="font-mono text-xs text-muted-foreground opacity-50 uppercase tracking-widest">No matches</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  )
}
