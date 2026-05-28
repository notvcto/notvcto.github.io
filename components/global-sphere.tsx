"use client"

import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { SentientSphere } from "./sentient-sphere"

export function GlobalSphere() {
  const pathname = usePathname()
  const isBlog = pathname?.startsWith("/blog")

  return (
    <motion.div
      initial={false}
      animate={{
        opacity: isBlog ? 0.2 : 1,
      }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`${isBlog ? "absolute" : "fixed"} inset-0 z-0 ${isBlog ? "pointer-events-none" : ""}`}
    >
      <SentientSphere interactive={!isBlog} />
    </motion.div>
  )
}
