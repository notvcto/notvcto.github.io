"use client"

import { useEffect } from "react"
import { motion } from "framer-motion"
import { usePathname } from "next/navigation"
import { useLenis } from "lenis/react"
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
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {children}
    </motion.div>
  )
}
