"use client"

import { useEffect, useState } from "react"
import { motion, useMotionValue, useSpring } from "framer-motion"

export function CustomCursor() {
  const [isHovering, setIsHovering] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [isTouchDevice, setIsTouchDevice] = useState(false)

  // Motion values bypass React's render cycle — no re-render on every mouse pixel
  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)

  const dotX = useSpring(rawX, { stiffness: 500, damping: 28, mass: 0.5 })
  const dotY = useSpring(rawY, { stiffness: 500, damping: 28, mass: 0.5 })
  const ringX = useSpring(rawX, { stiffness: 300, damping: 20, mass: 0.8 })
  const ringY = useSpring(rawY, { stiffness: 300, damping: 20, mass: 0.8 })

  useEffect(() => {
    const touchQuery = window.matchMedia("(pointer: coarse)")
    setIsTouchDevice(touchQuery.matches)
    const handleTouchChange = (e: MediaQueryListEvent) => setIsTouchDevice(e.matches)
    touchQuery.addEventListener("change", handleTouchChange)

    const handleMouseMove = (e: MouseEvent) => {
      rawX.set(e.clientX)
      rawY.set(e.clientY)
      setIsVisible(true)
    }

    const handleMouseLeave = () => setIsVisible(false)
    const handleMouseEnter = () => setIsVisible(true)

    const handleHoverStart = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest("a, button, [data-cursor-hover]")) {
        setIsHovering(true)
      }
    }

    const handleHoverEnd = (e: MouseEvent) => {
      // Only clear hover if the pointer isn't moving into another interactive element.
      // Without this check, moving between children inside a link flickers isHovering off/on.
      const leaving = (e.target as HTMLElement).closest("a, button, [data-cursor-hover]")
      const entering = (e.relatedTarget as HTMLElement | null)?.closest("a, button, [data-cursor-hover]")
      if (leaving && !entering) {
        setIsHovering(false)
      }
    }

    window.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseenter", handleMouseEnter)
    document.addEventListener("mouseleave", handleMouseLeave)
    document.addEventListener("mouseover", handleHoverStart)
    document.addEventListener("mouseout", handleHoverEnd)

    return () => {
      touchQuery.removeEventListener("change", handleTouchChange)
      window.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseenter", handleMouseEnter)
      document.removeEventListener("mouseleave", handleMouseLeave)
      document.removeEventListener("mouseover", handleHoverStart)
      document.removeEventListener("mouseout", handleHoverEnd)
    }
  }, [rawX, rawY])

  if (isTouchDevice) return null

  return (
    <>
      {/* Main cursor dot */}
      <motion.div
        className="fixed top-0 left-0 w-3 h-3 bg-white rounded-full pointer-events-none z-[10000] mix-blend-difference"
        style={{ x: dotX, y: dotY, translateX: "-6px", translateY: "-6px" }}
        animate={{ scale: isHovering ? 0 : 5, opacity: isVisible ? 1 : 0 }}
        transition={{ duration: 0.15 }}
      />
      {/* Hover ring */}
      <motion.div
        className="fixed top-0 left-0 w-12 h-12 border border-white rounded-full pointer-events-none z-[10000] mix-blend-difference"
        style={{ x: ringX, y: ringY, translateX: "-24px", translateY: "-24px" }}
        animate={{ scale: isHovering ? 1 : 0, opacity: isVisible ? 1 : 0 }}
        transition={{ duration: 0.15 }}
      />
    </>
  )
}
