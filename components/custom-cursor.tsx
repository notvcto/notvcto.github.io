"use client"

import { useEffect, useState } from "react"
import { motion, useMotionValue, useSpring } from "framer-motion"

export function CustomCursor() {
  const [isHovering, setIsHovering] = useState(false)
  const [isOverImage, setIsOverImage] = useState(false)
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
      const target = e.target
      if (!(target instanceof Element)) return
      if (target.closest("a, button, [data-cursor-hover]")) setIsHovering(true)
      setIsOverImage(target.tagName === 'IMG')
    }

    const handleHoverEnd = (e: MouseEvent) => {
      const target = e.target
      const relatedTarget = e.relatedTarget
      if (!(target instanceof Element)) return

      // Only clear hover if the pointer isn't moving into another interactive element.
      // Without this check, moving between children inside a link flickers isHovering off/on.
      const leaving = target.closest("a, button, [data-cursor-hover]")
      const entering = relatedTarget instanceof Element
        ? relatedTarget.closest("a, button, [data-cursor-hover]")
        : null
      if (leaving && !entering) setIsHovering(false)
      if (!(relatedTarget instanceof Element) || relatedTarget.tagName !== 'IMG') setIsOverImage(false)
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
      {/* Main cursor dot — hidden over images to avoid mix-blend-difference color inversion */}
      <motion.div
        className="fixed top-0 left-0 w-3 h-3 bg-white rounded-full pointer-events-none z-[10000] mix-blend-difference"
        style={{ x: dotX, y: dotY, translateX: "-6px", translateY: "-6px" }}
        animate={{ scale: isHovering || isOverImage ? 0 : 5, opacity: isVisible ? 1 : 0 }}
        transition={{ duration: 0.15 }}
      />
      {/* Hover ring — plain white (no difference blend) over images so colors aren't inverted */}
      <motion.div
        className="fixed top-0 left-0 w-12 h-12 border border-white rounded-full pointer-events-none z-[10000]"
        style={{
          x: ringX, y: ringY, translateX: "-24px", translateY: "-24px",
          mixBlendMode: isOverImage ? 'normal' : 'difference',
        }}
        animate={{ scale: isHovering || isOverImage ? 1 : 0, opacity: isVisible ? (isOverImage ? 0.5 : 1) : 0 }}
        transition={{ duration: 0.15 }}
      />
    </>
  )
}
