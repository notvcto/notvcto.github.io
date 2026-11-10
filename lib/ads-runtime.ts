let blocker: Promise<boolean> | undefined;

export function detectAdBlocking() {
    return blocker ??= new Promise<boolean>(resolve => {
        const probe = document.createElement("div");
        probe.className = "adsbox ad-banner";
        probe.style.cssText = "display:block;position:absolute;left:-9999px;width:1px;height:1px;pointer-events:none";
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
