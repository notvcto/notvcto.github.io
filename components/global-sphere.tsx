"use client";

import { usePathname } from "next/navigation";
import { useCallback, useLayoutEffect, useState } from "react";
import { isViewportCovered } from "@/lib/sphere-coverage";
import { SentientSphere } from "./sentient-sphere";

export function GlobalSphere() {
    const pathname = usePathname();
    const dimmed = pathname?.startsWith("/blog") || pathname?.startsWith("/resume");
    const [covered, setCovered] = useState(false);
    const [readyMode, setReadyMode] = useState<"document" | "viewport" | null>(null);
    const onFrameReady = useCallback((sliced: boolean) => {
        setReadyMode(sliced ? "document" : "viewport");
    }, []);

    useLayoutEffect(() => {
        setReadyMode(null);
    }, [dimmed]);

    useLayoutEffect(() => {
        if (pathname !== "/") {
            setCovered(false);
            return;
        }

        const update = (includeHash = false) => {
            const target = includeHash && window.location.hash
                ? document.getElementById(window.location.hash.slice(1))
                : null;
            const offset = target?.matches(".bg-background") ? target.getBoundingClientRect().top : 0;
            const rectangles = Array.from(document.querySelectorAll<HTMLElement>("section.bg-background, footer.bg-background"), element => {
                const { top, bottom, left, right } = element.getBoundingClientRect();
                return { top: top - offset, bottom: bottom - offset, left, right };
            });
            setCovered(isViewportCovered(rectangles, document.documentElement.clientWidth, window.innerHeight));
        };

        update(true);
        const onScroll = () => update();
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll);
        return () => {
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onScroll);
        };
    }, [pathname]);

    return (
        <div
            data-global-sphere
            data-sphere-ready={readyMode ?? ""}
            style={{ opacity: readyMode === "document" ? 0.2 : 1 }}
            className={`no-print fixed inset-0 z-0 ${covered ? "invisible" : ""} ${dimmed || covered ? "pointer-events-none" : ""}`}
        >
            <SentientSphere active={!covered} sliceToDocument={dimmed} onFrameReady={onFrameReady} />
        </div>
    );
}
