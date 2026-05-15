"use client"

import { SentientSphere } from "@/components/sentient-sphere"

export function BlogBackground() {
  return (
    <div className="fixed inset-0 z-0 opacity-20 pointer-events-none">
      <SentientSphere interactive={false} />
    </div>
  )
}
