"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform, useSpring } from "framer-motion"

const statements = [
  "Every layer of abstraction hides flaws.",
  "Performance is a byproduct of precision.",
  "Unused logic is an unpatched exploit.",
  "Memory safety is an absolute baseline.",
  "Architect for execution; audit for certainty.",
]

export function About() {
  const containerRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  })

  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-100%"])
  const smoothX = useSpring(x, { stiffness: 100, damping: 30 })

  return (
    <section id="about" ref={containerRef} className="relative py-8 md:py-0 overflow-hidden bg-background">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="px-8 md:px-12 mb-0 py-6 md:py-12"
      >
        <p className="font-mono text-xs tracking-[0.3em] text-muted-foreground mb-4">03 — PHILOSOPHY</p>
        <h2 className="font-sans text-3xl md:text-5xl font-light italic">Execution Directives</h2>
        </motion.div>

        {/* Horizontal Scroll Container */}
        <div className="relative flex items-center overflow-hidden py-0 gap-0 h-24 md:h-32">
        <motion.div style={{ x: smoothX }} className="flex gap-8 md:gap-24 px-6 md:px-12 whitespace-nowrap">
          {statements.map((statement, index) => (
            <motion.p
              key={index}
              className="text-2xl sm:text-4xl md:text-6xl lg:text-7xl font-sans font-light tracking-tight text-white/90"
              style={{
                WebkitTextStroke: index % 2 === 0 ? "none" : "1px rgba(255,255,255,0.3)",
                color: index % 2 === 0 ? "inherit" : "transparent",
              }}
            >
              {statement}
            </motion.p>
          ))}
        </motion.div>
      </div>

      {/* Decorative Line */}
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="mt-10 mx-8 md:mx-12 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent origin-left"
      />
    </section>
  )
}
