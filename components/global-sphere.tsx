"use client"

import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { SentientSphere } from "./sentient-sphere"
import { EASE_OUT_EXPO } from "@/lib/animation"

export function GlobalSphere() {
  const pathname = usePathname()
  const isBlog = pathname?.startsWith("/blog")

  return (
    <motion.div
      initial={false}
      animate={{
        opacity: isBlog ? 0.2 : 1,
      }}
      transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}
      className={`${isBlog ? "absolute" : "fixed"} inset-0 z-0 ${isBlog ? "pointer-events-none" : ""}`}
    >
      <SentientSphere interactive={!isBlog} />
    </motion.div>
  )
}
