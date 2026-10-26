"use client";

import { adsConfig, type AdPlacement } from "@/lib/ads";
import { detectAdBlocking, loadAdSense, onPrivacyReady, requestedAds } from "@/lib/ads-runtime";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";

type AdState = "pending" | "ready" | "blocked" | "failed";
const dismissalKey = "blog:adblock-notice-dismissed";
let dismissedInMemory = false;
const AdsContext = createContext({ state: "pending" as AdState, dismissed: false, dismiss: () => {}, privacyReady: false });

export function BlogAdsProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<AdState>("pending");
    const [dismissed, setDismissed] = useState(dismissedInMemory);
    const [privacyReady, setPrivacyReady] = useState(false);
    useEffect(() => {
        if (!adsConfig.enabled) return;
        let active = true;
        let stopPrivacyCallback = () => {};
        try { if (localStorage.getItem(dismissalKey) === "1") setDismissed(true); } catch { /* Storage is optional. */ }
        void detectAdBlocking().then(async blocked => {
            if (!active) return;
            if (blocked) { setState("blocked"); return; }
            try {
                await loadAdSense();
                if (active) {
                    stopPrivacyCallback = onPrivacyReady(() => { if (active) setPrivacyReady(true); });
                    setState("ready");
                }
            }
            catch { if (active) setState("failed"); }
        });
        return () => { active = false; stopPrivacyCallback(); };
    }, []);
    function dismiss() {
        dismissedInMemory = true; setDismissed(true);
        try { localStorage.setItem(dismissalKey, "1"); } catch { /* Keep the in-memory preference. */ }
    }
    return <AdsContext.Provider value={{ state, dismissed, dismiss, privacyReady }}>
        {children}
        {adsConfig.enabled && <noscript><style>{"[data-ad-compartment]{display:none!important}"}</style></noscript>}
    </AdsContext.Provider>;
}

function AdUnit({ placement }: { placement: AdPlacement }) {
    const { state } = useContext(AdsContext);
    const frame = useRef<HTMLElement>(null);
    const space = useRef<HTMLDivElement>(null);
    const [unavailable, setUnavailable] = useState(false);
    const [collapsed, setCollapsed] = useState(false);
    useEffect(() => {
        const container = frame.current;
        const area = space.current;
        if (state !== "ready" || !container || !area) return;
        let active = true;
        const status = new MutationObserver(() => {
            const ad = area.querySelector<HTMLElement>("ins.adsbygoogle");
            if (!ad || ad.dataset.adStatus === "unfilled" || getComputedStyle(ad).display === "none" || getComputedStyle(ad).visibility === "hidden") setUnavailable(true);
        });
        const observer = new IntersectionObserver(entries => {
            if (!active || !entries.some(entry => entry.isIntersecting) || area.getBoundingClientRect().width <= 0 || requestedAds.has(container)) return;
            requestedAds.add(container); observer.disconnect();
            // Keep hidden/unrequested units out of Google's global processing queue.
            const element = document.createElement("ins");
            element.className = "adsbygoogle";
            Object.assign(element.style, { display: "block", width: placement === "sidebar" ? "300px" : "100%", maxWidth: placement === "sidebar" ? "300px" : "728px", height: placement === "sidebar" ? "250px" : "100px" });
            element.dataset.adClient = adsConfig.client;
            element.dataset.adSlot = adsConfig.slots[placement];
            area.append(element);
            status.observe(area, { childList: true });
            status.observe(element, { attributes: true, attributeFilter: ["class", "data-ad-status", "style"] });
            try {
                window.adsbygoogle ??= [] as Record<string, never>[];
                window.adsbygoogle.push({});
            } catch { setUnavailable(true); }
        }, { rootMargin: "300px 0px" });
        observer.observe(container);
        return () => { active = false; observer.disconnect(); status.disconnect(); };
    }, [state, placement]);
    useEffect(() => {
        if (unavailable || state === "failed") setCollapsed(true);
    }, [state, unavailable]);
    if (collapsed) return null;
    return <section ref={frame} className={`ad-compartment ad-${placement} not-prose no-print`} data-ad-compartment={placement} data-native-cursor aria-label="Advertisements">
        <span className="ad-label">Advertisements</span>
        <div ref={space} className="ad-space"/>
    </section>;
}

export function AdCompartment({ placement }: { placement: AdPlacement }) {
    const { state, dismissed, dismiss } = useContext(AdsContext);
    const pathname = usePathname();
    if (!adsConfig.enabled) return null;
    if (state === "blocked") {
        if (dismissed || (placement !== "intro" && placement !== "index")) return null;
        return <aside className="blog-support-note not-prose no-print" data-ad-blocker-notice aria-label="A note about advertising">
            <button type="button" onClick={dismiss} aria-label="Dismiss adblocker notice">×</button>
            <p>hey, looks like you&apos;re using an adblocker.</p>
            <p>that&apos;s fine. i use one too.</p>
            <p>ads help support my work, but you&apos;re under no obligation to disable yours. everything stays accessible either way.</p>
        </aside>;
    }
    return <AdUnit key={`${pathname}:${placement}`} placement={placement}/>;
}

export function BlogPrivacyLinks() {
    const { privacyReady, state } = useContext(AdsContext);
    function openSettings() {
        onPrivacyReady(() => window.googlefc?.showRevocationMessage?.());
    }
    useEffect(() => {
        if (!adsConfig.enabled || !privacyReady || window.location.hash !== "#privacy-settings") return;
        window.history.replaceState(null, "", window.location.pathname + window.location.search);
        onPrivacyReady(() => window.googlefc?.showRevocationMessage?.());
    }, [privacyReady]);
    return <footer className="blog-privacy-links no-print">
        <Link href="/privacy">Privacy</Link>
        {adsConfig.enabled && <button type="button" disabled={!privacyReady} onClick={openSettings}>Privacy and cookie settings</button>}
        {adsConfig.enabled && (state === "failed" || state === "blocked") && <span>Advertising and privacy controls could not load.</span>}
    </footer>;
}
