"use client";

import { adsConfig, selectAdUnit, type AdPlacement } from "@/lib/ads";
import { detectAdBlocking } from "@/lib/ads-runtime";
import { AnimatePresence, motion } from "framer-motion";
import { useReducedMotion } from "./motion-preferences";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";

type Consent = "allow" | "deny" | null;
const consentKey = "blog:adsterra-consent:v1";
const dismissalKey = "blog:adblock-notice-dismissed";
let memoryConsent: Consent = null;
let dismissedInMemory = false;
const AdsContext = createContext({ blocked: null as boolean | null, consent: null as Consent, dismissed: false, dismiss: () => {}, openSettings: () => {} });

export function BlogAdsProvider({ children }: { children: ReactNode }) {
    const reducedMotion = useReducedMotion();
    const [blocked, setBlocked] = useState<boolean | null>(null);
    const [consent, setConsent] = useState<Consent>(null);
    const [dismissed, setDismissed] = useState(dismissedInMemory);
    const [settingsOpen, setSettingsOpen] = useState(false);
    useEffect(() => {
        if (!adsConfig.enabled) return;
        let active = true;
        let stored = memoryConsent;
        try {
            const preference = JSON.parse(localStorage.getItem(consentKey) || "null");
            stored = preference?.expires > Date.now() && ["allow", "deny"].includes(preference.value) ? preference.value : null;
            if (localStorage.getItem(dismissalKey) === "1") setDismissed(true);
        } catch { /* Storage is optional. */ }
        setConsent(stored);
        setSettingsOpen(stored === null || window.location.hash === "#privacy-settings");
        if (window.location.hash === "#privacy-settings") window.history.replaceState(null, "", window.location.pathname + window.location.search);
        void detectAdBlocking().then(value => { if (active) setBlocked(value); });
        return () => { active = false; };
    }, []);
    function choose(value: Exclude<Consent, null>) {
        memoryConsent = value;
        setConsent(value);
        setSettingsOpen(false);
        try { localStorage.setItem(consentKey, JSON.stringify({ value, expires: Date.now() + 180 * 86400000 })); } catch { /* Keep the in-memory preference. */ }
    }
    function dismiss() {
        dismissedInMemory = true; setDismissed(true);
        try { localStorage.setItem(dismissalKey, "1"); } catch { /* Keep the in-memory preference. */ }
    }
    return <AdsContext.Provider value={{ blocked, consent, dismissed, dismiss, openSettings: () => setSettingsOpen(true) }}>
        {children}
        {typeof document !== "undefined" && createPortal(<AnimatePresence>
        {adsConfig.enabled && settingsOpen && <motion.aside
            initial={{ opacity: 0, y: reducedMotion ? 0 : 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reducedMotion ? 0 : 8 }}
            transition={{ duration: reducedMotion ? 0 : 0.22, ease: "easeOut" }}
            className="blog-consent no-print" aria-label="Advertising privacy choices">
            <span className="support-note-label">NOTVCTO / PRIVACY</span>
            <h2>A choice before the ads.</h2>
            <p>Allow Adsterra and its advertising partners to load ads on blog pages? They receive network information such as your IP address and browser details and may use cookies or similar storage to deliver and measure ads, including personalized ads.</p>
            <p>You can decline and keep reading, or change your choice through Privacy and cookie settings. Withdrawing stops future ad requests; it does not erase data already received by advertisers. <Link href="/privacy">Read the privacy policy</Link>.</p>
            <div className="flex flex-wrap gap-3 mt-5">
                <button type="button" onClick={() => choose("deny")}>Decline ads</button>
                <button type="button" onClick={() => choose("allow")}>Allow ads</button>
            </div>
        </motion.aside>}
        </AnimatePresence>, document.body)}
    </AdsContext.Provider>;
}

function BannerFrame({ unit, onFailure }: { unit: NonNullable<ReturnType<typeof selectAdUnit>>; onFailure: () => void }) {
    const ref = useRef<HTMLIFrameElement>(null);
    const [loaded, setLoaded] = useState(false);
    useEffect(() => {
        const token = unit.key;
        function receive(event: MessageEvent) {
            if (event.origin !== adsConfig.frameOrigin || event.source !== ref.current?.contentWindow || event.data?.type !== "blog-ad" || event.data.token !== token) return;
            if (event.data.status === "loaded") setLoaded(true);
            if (event.data.status === "failed") onFailure();
        }
        window.addEventListener("message", receive);
        // Covers requests that hang before the child document can report an error.
        const timeout = setTimeout(() => { if (ref.current?.dataset.loaded !== "true") onFailure(); }, 16000);
        return () => { window.removeEventListener("message", receive); clearTimeout(timeout); };
    }, [unit, onFailure]);
    return <iframe ref={ref} title="Advertisement" className="ad-frame" width={unit.width} height={unit.height}
        sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox" referrerPolicy="strict-origin-when-cross-origin"
        src={`${adsConfig.frameOrigin}/ad-frame/${unit.key}`} data-loaded={loaded} />;
}

function AdUnit({ placement }: { placement: AdPlacement }) {
    const available = useRef<HTMLDivElement>(null);
    const space = useRef<HTMLDivElement>(null);
    const [unit, setUnit] = useState<ReturnType<typeof selectAdUnit>>();
    const [nearby, setNearby] = useState(false);
    const [failedKey, setFailedKey] = useState<string | null>(null);
    useEffect(() => {
        const area = space.current;
        const parent = available.current;
        if (!area || !parent) return;
        const resize = new ResizeObserver(entries => setUnit(selectAdUnit(placement, entries[0].contentRect.width - 20)));
        const intersection = new IntersectionObserver(entries => setNearby(entries.some(entry => entry.isIntersecting)), { rootMargin: "300px 0px" });
        resize.observe(parent); intersection.observe(area);
        return () => { resize.disconnect(); intersection.disconnect(); };
    }, [placement]);
    const [requested, setRequested] = useState(false);
    useEffect(() => { if (nearby && unit) setRequested(true); }, [nearby, unit]);
    const fail = useCallback(() => { if (unit) setFailedKey(unit.key); }, [unit]);
    const unavailable = !unit || failedKey === unit.key;
    return <div ref={available} className="ad-placement"><section style={unit ? { width: unit.width + 20 } : undefined} className={`ad-compartment ad-${placement} not-prose no-print`} data-ad-compartment={placement} data-unavailable={unavailable} aria-label="Advertisements">
        <span className="ad-label">AD</span>
        <div ref={space} className="ad-space" style={unit ? { minHeight: unit.height + 18 } : undefined}>
            {requested && unit && !unavailable && <BannerFrame key={unit.key} unit={unit} onFailure={fail} />}
        </div>
    </section></div>;
}

export function AdCompartment({ placement }: { placement: AdPlacement }) {
    const { blocked, consent, dismissed, dismiss } = useContext(AdsContext);
    const pathname = usePathname();
    if (!adsConfig.enabled || blocked === null) return null;
    if (blocked) {
        if (dismissed || (placement !== "intro" && placement !== "index")) return null;
        return <aside className="blog-support-note not-prose no-print" data-ad-blocker-notice aria-label="A note about advertising">
            <button type="button" onClick={dismiss} aria-label="Dismiss adblocker notice">×</button>
            <span className="support-note-label"><span aria-hidden="true"/>A note about ads / 01</span>
            <h2>blocking ads? fair enough.</h2>
            <p>i use an adblocker too.</p>
            <p>ads help support my work, but you&apos;re under no obligation to disable yours. everything stays accessible either way.</p>
        </aside>;
    }
    if (consent !== "allow") return null;
    return <AdUnit key={`${pathname}:${placement}`} placement={placement}/>;
}

export function BlogPrivacyLinks() {
    const { openSettings } = useContext(AdsContext);
    return <footer className="blog-privacy-links no-print">
        <Link href="/privacy">Privacy</Link>
        {adsConfig.enabled && <button type="button" onClick={openSettings}>Privacy and cookie settings</button>}
    </footer>;
}
