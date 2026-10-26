"use client";

import { usePathname } from "next/navigation";

export function NoiseOverlay() {
    const pathname = usePathname();
    return <div className="noise-overlay" style={{ zIndex: pathname.startsWith("/blog") ? 5 : 9999 }}/>;
}
