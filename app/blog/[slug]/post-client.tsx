"use client"

import { useState, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import Link from "next/link"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism"
import { motion, AnimatePresence } from "framer-motion"
import { Share2, Check, ChevronRight } from "lucide-react"
import { getComplexityColor, type BlogPost, type BlogPostMeta } from "@/lib/blog"

interface BlogPostClientProps {
  post: BlogPost
  nextPost: BlogPostMeta | null
}

export function BlogPostClient({ post, nextPost }: BlogPostClientProps) {
  const [copied, setCopied] = useState(false)
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current)
    }
  }, [])

  useEffect(() => {
    if (!lightboxSrc) return
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxSrc(null)
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [lightboxSrc])

  return (
    <article className="prose prose-invert prose-quoteless max-w-none prose-headings:font-playfair prose-p:font-sans prose-p:text-muted-foreground prose-p:text-lg prose-p:leading-relaxed prose-li:text-muted-foreground prose-strong:text-white prose-pre:bg-white/[0.02] prose-pre:border prose-pre:border-white/5">
      <header className="mb-12 border-b border-white/5 pb-8 not-prose">
        <div className="flex items-center gap-6 mb-6 flex-wrap">
          <div className="flex items-center gap-2 px-2 py-0.5 border border-white/10 rounded font-mono text-[10px] tracking-widest text-muted-foreground uppercase bg-white/[0.02]">
            {post.category}
          </div>
          
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] tracking-widest text-muted-foreground/40 uppercase">Complexity:</span>
            <span className={`font-mono text-[10px] font-bold tracking-widest ${getComplexityColor(post.complexity)}`}>
              {post.complexity.toFixed(1)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] tracking-widest text-muted-foreground/40 uppercase">Read Time:</span>
            <span className="font-mono text-[10px] text-muted-foreground uppercase">{post.readingTime}</span>
          </div>
          
          <span className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase ml-auto opacity-50">{post.date.split('T')[0]}</span>
        </div>

        <h1 className="text-2xl sm:text-3xl md:text-5xl font-playfair tracking-tight mb-6 leading-tight text-white">
          {post.title}
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground font-sans leading-relaxed border-l-2 border-white/10 pl-6 italic">
          {post.description}
        </p>
      </header>

      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({node, ...props}) => <h1 className="text-3xl sm:text-4xl md:text-5xl font-playfair font-bold mb-6 text-white" {...props} />,
          h2: ({node, ...props}) => <h2 className="text-xl sm:text-2xl md:text-3xl font-playfair font-bold mt-12 mb-4 text-white" {...props} />,
          h3: ({node, ...props}) => <h3 className="text-lg sm:text-xl md:text-2xl font-playfair font-bold mt-8 mb-3 text-white" {...props} />,
          p: ({node, ...props}) => <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-6 font-sans" {...props} />,
          ul: ({node, ...props}) => <ul className="list-disc pl-6 space-y-2 mb-6 text-muted-foreground" {...props} />,
          ol: ({node, ...props}) => <ol className="list-decimal pl-6 space-y-2 mb-6 text-muted-foreground" {...props} />,
          li: ({node, ...props}) => <li className="text-lg leading-relaxed" {...props} />,
          hr: ({node, ...props}) => <hr className="my-12 border-white/5" {...props} />,
          blockquote: ({node, ...props}) => (
            <blockquote className="border-l-4 border-white/10 pl-6 py-2 my-8 italic bg-white/[0.01] rounded-r-lg" {...props} />
          ),
          table: ({node, ...props}) => (
            <div className="my-8 overflow-x-auto border border-white/10 rounded-xl bg-white/[0.01]">
              <table className="w-full border-collapse text-left m-0!" {...props} />
            </div>
          ),
          thead: ({node, ...props}) => <thead className="border-b border-white/10 bg-white/[0.02]" {...props} />,
          tbody: ({node, ...props}) => <tbody {...props} />,
          th: ({node, ...props}) => <th className="px-6 py-4 font-mono text-[10px] tracking-widest text-muted-foreground uppercase border-none!" {...props} />,
          tr: ({node, ...props}) => <tr className="border-b border-white/10 last:border-none!" {...props} />,
          td: ({node, ...props}) => <td className="px-6 py-4 text-white/80 border-none!" {...props} />,
          code: ({node, className, children, ...props}) => {
            const match = /language-(\w+)/.exec(className || '');
            const isInline = !className;
            
            return isInline ? (
              <code className="bg-white/10 px-1.5 py-0.5 rounded text-sm text-white/90 font-mono">
                {children}
              </code>
            ) : (
              <div className="my-8 rounded-xl border border-white/5 overflow-hidden shadow-2xl bg-[#0a0a0a]">
                <div className="flex items-center justify-between px-4 py-2 bg-white/[0.03] border-b border-white/5">
                  <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">{match?.[1] || 'code'}</span>
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-white/10" />
                    <div className="w-2 h-2 rounded-full bg-white/10" />
                  </div>
                </div>
                <SyntaxHighlighter
                  style={vscDarkPlus}
                  language={match?.[1] || 'text'}
                  PreTag="div"
                  customStyle={{
                    margin: 0,
                    padding: '1.5rem',
                    background: 'transparent',
                    fontSize: '0.875rem',
                    lineHeight: '1.7',
                  }}
                  codeTagProps={{
                    style: {
                      fontFamily: 'inherit',
                    }
                  }}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              </div>
            );
          },
          pre: ({node, ...props}) => <div className="not-prose">{props.children}</div>,
          img: ({src, alt}) => (
            <figure className="my-8 not-prose">
              <img
                src={src}
                alt={alt || ''}
                loading="lazy"
                onClick={() => typeof src === 'string' && setLightboxSrc(src)}
                className="rounded-xl border border-white/5 w-full object-cover cursor-zoom-in transition-opacity duration-300 hover:opacity-90"
              />
              {alt && (
                <figcaption className="mt-3 text-center font-mono text-[11px] tracking-widest text-muted-foreground uppercase">
                  {alt}
                </figcaption>
              )}
            </figure>
          ),
        }}
      >
        {post.content}
      </ReactMarkdown>

      {mounted && createPortal(
        <AnimatePresence>
          {lightboxSrc && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setLightboxSrc(null)}
              className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 md:p-8 cursor-zoom-out"
            >
              <motion.img
                initial={{ scale: 0.92, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.92, opacity: 0 }}
                transition={{ duration: 0.2 }}
                src={lightboxSrc}
                alt=""
                onClick={(e) => e.stopPropagation()}
                className="max-w-full max-h-[90vh] rounded-xl border border-white/10 object-contain cursor-default shadow-2xl"
              />
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      <footer className="mt-20 pt-12 border-t border-white/5 not-prose space-y-8">
        {nextPost && (
          <Link href={`/blog/${nextPost.slug}`} className="group block">
            <div className="relative p-8 bg-white/[0.01] border border-white/5 rounded-2xl transition-all duration-500 group-hover:bg-white/[0.03] group-hover:border-white/10 group-hover:-translate-y-1 flex items-center justify-between shadow-2xl overflow-hidden min-h-[120px]">
              <div className="absolute inset-0 bg-gradient-to-r from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative flex flex-col justify-center">
                <span className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase opacity-60 mb-2 group-hover:text-white transition-colors">Next Article</span>
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
              <span key={tag} className="font-mono text-[9px] tracking-[0.2em] text-muted-foreground border border-white/10 px-3 py-1 rounded-full uppercase bg-white/[0.02]">
                #{tag}
              </span>
            ))}
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.href)
              setCopied(true)
              if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current)
              copyTimeoutRef.current = setTimeout(() => setCopied(false), 2000)
            }}
            className="w-10 h-10 rounded-full border border-white/10 bg-white/[0.02] flex items-center justify-center shrink-0 hover:border-white/20 hover:bg-white/[0.05] transition-all duration-300"
            aria-label="Copy link"
          >
            {copied
              ? <Check className="w-4 h-4 text-accent" />
              : <Share2 className="w-4 h-4 text-muted-foreground" />
            }
          </button>
        </div>
      </footer>
    </article>
  )
}
