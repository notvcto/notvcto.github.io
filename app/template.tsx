"use client";

import { useLenis } from "lenis/react";
import { usePathname } from "next/navigation";
import type React from "react";
import { useEffect } from "react";

export default function Template({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const lenis = useLenis();

    useEffect(() => {
        if (window.location.hash) return;
        if (lenis) {
            lenis.scrollTo(0, { immediate: true });
        } else {
            window.scrollTo(0, 0);
        }
    }, [pathname, lenis]);

    return (
        <div
            key={pathname}
            className="page-enter"
            data-page-sphere={pathname.startsWith("/blog") || pathname.startsWith("/resume") ? "document" : "viewport"}
        >
            {children}
        </div>
    );
}
