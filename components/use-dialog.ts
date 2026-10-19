"use client";

import { useLenis } from "lenis/react";
import { useEffect, useEffectEvent, useRef } from "react";

// Native dialogs supply background inertness and restore focus to the opener.
export function useDialog(open: boolean, onClose: () => void, mobileOnly = false) {
    const ref = useRef<HTMLDialogElement>(null);
    const lenis = useLenis();
    const close = useEffectEvent(onClose);
    useEffect(() => {
        const dialog = ref.current;
        if (!open || !dialog) return;
        const desktop = window.matchMedia("(min-width: 768px)");
        if (mobileOnly && desktop.matches) {
            close();
            return;
        }
        const previousOverflow = document.body.style.overflow;
        const cancel = (event: Event) => {
            event.preventDefault();
            close();
        };
        const tab = (event: KeyboardEvent) => {
            if (event.key !== "Tab") return;
            const controls = Array.from(dialog.querySelectorAll<HTMLElement>("button, a[href], input, select, textarea, [tabindex]"))
                .filter(element => element.tabIndex >= 0 && !element.matches(":disabled") && element.getClientRects().length);
            const first = controls[0], last = controls.at(-1);
            if (first && last && ((event.shiftKey && document.activeElement === first) || (!event.shiftKey && document.activeElement === last))) {
                event.preventDefault();
                (event.shiftKey ? last : first).focus();
            }
        };
        const resize = () => {
            if (mobileOnly && desktop.matches) close();
        };
        dialog.showModal();
        const wasStopped = lenis?.isStopped;
        lenis?.stop();
        document.body.style.overflow = "hidden";
        dialog.addEventListener("cancel", cancel);
        dialog.addEventListener("keydown", tab);
        desktop.addEventListener("change", resize);
        return () => {
            dialog.removeEventListener("cancel", cancel);
            dialog.removeEventListener("keydown", tab);
            desktop.removeEventListener("change", resize);
            dialog.close();
            if (!wasStopped) lenis?.start();
            document.body.style.overflow = previousOverflow;
        };
    }, [open, mobileOnly, lenis]);
    return ref;
}
