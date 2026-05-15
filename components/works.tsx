"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { motion, useMotionValue, useSpring } from "framer-motion"

const projects = [
  {
    title: "vwh",
    tags: ["Rust", "Cryptography", "CLI"],
    image: "https://socialify.git.ci/notvcto/vwh/image?theme=Dark&font=Inter&description=1&owner=1&name=1&stargazers=1&forks=1&issues=1&language=1",
    year: "2026",
    github: "https://github.com/notvcto/vwh",
  },
  {
    title: "vsh",
    tags: ["Rust", "Systems", "Shell"],
    image: "https://socialify.git.ci/notvcto/vsh/image?theme=Dark&font=Inter&description=1&owner=1&name=1&stargazers=1&forks=1&issues=1&language=1",
    year: "2026",
    github: "https://github.com/notvcto/vsh",
  },
  {
    title: "dusky-asahi",
    tags: ["Linux", "Wayland", "Asahi"],
    image: "https://socialify.git.ci/notvcto/dusky-asahi/image?theme=Dark&font=Inter&description=1&owner=1&name=1&stargazers=1&forks=1&issues=1&language=1",
    year: "2026",
    github: "https://github.com/notvcto/dusky-asahi",
  },
  {
    title: "rscapt",
    tags: ["Rust", "FFmpeg", "Performance"],
    image: "https://socialify.git.ci/notvcto/rscapt/image?theme=Dark&font=Inter&description=1&owner=1&name=1&stargazers=1&forks=1&issues=1&language=1",
    year: "2026",
    github: "https://github.com/notvcto/rscapt",
  },
  {
    title: "compress-video",
    tags: ["Shell", "Automation", "Video"],
    image: "https://socialify.git.ci/notvcto/compress-video/image?theme=Dark&font=Inter&description=1&owner=1&name=1&stargazers=1&forks=1&issues=1&language=1",
    year: "2026",
    github: "https://github.com/notvcto/compress-video",
  },
]

export function Works() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isTouchDevice, setIsTouchDevice] = useState(false)

  useEffect(() => {
    setIsTouchDevice(window.matchMedia("(pointer: coarse)").matches)
  }, [])

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const springX = useSpring(mouseX, { stiffness: 150, damping: 20 })
  const springY = useSpring(mouseY, { stiffness: 150, damping: 20 })

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isTouchDevice) return
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      mouseX.set(e.clientX - rect.left)
      mouseY.set(e.clientY - rect.top)
    }
  }

  return (
    <section id="works" className="relative py-8 px-6 md:px-12 md:py-16">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="mb-6 md:mb-12"
      >
        <p className="font-mono text-[10px] md:text-xs tracking-[0.3em] text-muted-foreground mb-4">04 — SELECTED WORKS</p>
        <h2 className="font-sans text-3xl md:text-5xl font-light italic">Proof of Execution</h2>
      </motion.div>

      {/* Projects List */}
      <div ref={containerRef} onMouseMove={handleMouseMove} className="relative">
        {projects.map((project, index) => (
          <motion.div
            key={project.title}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: index * 0.1 }}
            className="relative border-t border-white/10 py-4 md:py-8"
            onMouseEnter={() => !isTouchDevice && setHoveredIndex(index)}
            onMouseLeave={() => !isTouchDevice && setHoveredIndex(null)}
          >
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor-hover
              className="group flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="flex flex-col gap-4 flex-1">
                <div className="flex items-center gap-4">
                  <span className="font-mono text-[10px] md:text-xs text-muted-foreground tracking-widest">
                    {project.year}
                  </span>
                  <div className="flex gap-2 flex-wrap">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="font-mono text-[9px] md:text-[10px] tracking-wider px-2 py-0.5 border border-white/10 rounded-full text-muted-foreground/60"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <motion.h3
                  className="font-sans text-4xl md:text-6xl lg:text-7xl font-light tracking-tight group-hover:text-white/70 transition-colors duration-300"
                  animate={{
                    x: !isTouchDevice && hoveredIndex === index ? 20 : 0,
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  {project.title}
                </motion.h3>
              </div>

              {/* Mobile/Touch Image Preview */}
              {isTouchDevice && (
                <div className="w-full aspect-video overflow-hidden rounded-xl border border-white/10 shadow-xl">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover grayscale-[20%] contrast-[1.1]"
                  />
                </div>
              )}
            </a>
          </motion.div>
        ))}

        {/* Floating Image (Desktop Only) */}
        {!isTouchDevice && (
          <motion.div
            className="absolute top-0 left-0 pointer-events-none z-50 w-[400px] md:w-[600px] aspect-video overflow-hidden rounded-lg shadow-2xl"
            style={{
              x: springX,
              y: springY,
              translateX: "20px",
              translateY: "20px",
            }}
            animate={{
              opacity: hoveredIndex !== null ? 1 : 0,
              scale: hoveredIndex !== null ? 1 : 0.8,
            }}
            transition={{ duration: 0.2 }}
          >
            {hoveredIndex !== null && (
              <motion.img
                src={projects[hoveredIndex].image}
                alt={projects[hoveredIndex].title}
                className="w-full h-full object-cover"
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.4 }}
                style={{
                  filter: "grayscale(20%) contrast(1.1)",
                }}
              />
            )}
            {/* Glitch overlay */}
            <div className="absolute inset-0 bg-[#2563eb]/10 mix-blend-overlay" />
          </motion.div>
        )}
      </div>

      {/* Bottom Border */}
      <div className="border-t border-white/10" />
    </section>
  )
}
