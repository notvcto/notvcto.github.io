import { adsConfig } from "./ads";

type MessageCallback = Record<string, () => void>;
declare global {
    interface Window {
        adsbygoogle?: { push: (command: Record<string, never>) => unknown };
        googlefc?: {
            callbackQueue: { push: (callback: MessageCallback) => unknown };
            showRevocationMessage?: () => void;
        };
    }
}

let sdk: Promise<void> | undefined;
let blocker: Promise<boolean> | undefined;
export const requestedAds = new WeakSet<HTMLElement>();

export function detectAdBlocking() {
    return blocker ??= new Promise<boolean>(resolve => {
        const probe = document.createElement("div");
        probe.className = "adsbox ad-banner";
        probe.style.cssText = "position:absolute;left:-9999px;width:1px;height:1px;pointer-events:none";
        probe.setAttribute("aria-hidden", "true");
        document.body.append(probe);
        requestAnimationFrame(() => {
            const style = getComputedStyle(probe);
            const blocked = style.display === "none" || style.visibility === "hidden" || probe.offsetHeight === 0;
            probe.remove();
            resolve(blocked);
        });
    });
}

export function loadAdSense() {
    return sdk ??= new Promise<void>((resolve, reject) => {
        const script = document.createElement("script");
        script.id = "blog-adsense";
        script.async = true;
        script.crossOrigin = "anonymous";
        script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsConfig.client}`;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("AdSense could not load"));
        document.head.append(script);
    });
}

export function onPrivacyReady(callback: () => void) {
    const api = window.googlefc ??= { callbackQueue: [] as MessageCallback[] };
    api.callbackQueue ??= [] as MessageCallback[];
    const queue = api.callbackQueue;
    const command = { CONSENT_API_READY: callback };
    queue.push(command);
    return () => {
        if (Array.isArray(queue)) {
            const index = queue.indexOf(command);
            if (index !== -1) queue.splice(index, 1);
        }
    };
}
