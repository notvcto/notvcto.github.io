"use client"

import { useEffect } from "react"
import { motion } from "framer-motion"
import { usePathname } from "next/navigation"
import { useLenis } from "lenis/react"
import { EASE_IN_OUT } from "@/lib/animation"
import type React from "react"

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const lenis = useLenis()

  useEffect(() => {
    if (window.location.hash) return
    if (lenis) {
      lenis.scrollTo(0, { immediate: true })
    } else {
      window.scrollTo(0, 0)
    }
  }, [pathname, lenis])

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE_IN_OUT }}
    >
      {children}
    </motion.div>
  )
}
