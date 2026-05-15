"use client"

import { motion } from "framer-motion"
import type React from "react"

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, filter: "blur(10px)" }}
      animate={{ opacity: 1, filter: "blur(0px)" }}
      onAnimationComplete={(definition) => {
        // Remove filter after animation to avoid breaking fixed/sticky positioning
        if (typeof definition === "object" && "filter" in definition) {
          (document.querySelector("[data-template-wrapper]") as HTMLElement)?.style.setProperty("filter", "none")
        }
      }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      data-template-wrapper
    >
      {children}
    </motion.div>
  )
}
