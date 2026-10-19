"use client";

import { useReducedMotion } from "./motion-preferences";

import { MotionConfig } from "framer-motion";
import { ReactLenis } from "lenis/react";
import type { ReactNode } from "react";

export function SmoothScroll({ children }: { children: ReactNode }) {
    const reducedMotion = useReducedMotion();
    return (
        <MotionConfig reducedMotion={reducedMotion ? "always" : "never"}>
            <ReactLenis root options={{ lerp: 0.05, duration: 1.5, smoothWheel: !reducedMotion }} className="relative z-10">
                {children}
            </ReactLenis>
        </MotionConfig>
    );
}
