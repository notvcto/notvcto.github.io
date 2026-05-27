"use client"

import { motion } from "framer-motion"
import { usePathname } from "next/navigation"
import type React from "react"

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const sectionKey = pathname?.startsWith("/blog") ? "blog" : "home"

  return (
    <motion.div
      key={sectionKey}
      initial={{ opacity: 0, filter: "blur(10px)", y: 20 }}
      animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
      onAnimationComplete={(definition) => {
        // Remove filter after animation to avoid breaking fixed/sticky positioning
        if (typeof definition === "object" && "filter" in definition) {
          (document.querySelector("[data-template-wrapper]") as HTMLElement)?.style.setProperty("filter", "none")
        }
      }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      data-template-wrapper
    >
      {children}
    </motion.div>
  )
}
