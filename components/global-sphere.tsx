"use client"

import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { SentientSphere } from "./sentient-sphere"
import { EASE_OUT_EXPO } from "@/lib/animation"

export function GlobalSphere() {
  const pathname = usePathname()
  const dimmed = pathname?.startsWith("/blog") || pathname?.startsWith("/resume")

  return (
    <motion.div
      initial={false}
      animate={{
        opacity: dimmed ? 0.2 : 1,
      }}
      transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}
      className={`no-print ${dimmed ? "absolute" : "fixed"} inset-0 z-0 ${dimmed ? "pointer-events-none" : ""}`}
    >
      <SentientSphere interactive={!dimmed} />
    </motion.div>
  )
}
