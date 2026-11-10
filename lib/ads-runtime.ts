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

// Each frame has its own atOptions and document.write target.
export function buildAdDocument(key: string, width: number, height: number, token: string) {
    if (!/^[a-f0-9]{32}$/.test(key) || !/^[a-z0-9-]+$/i.test(token) || ![width, height].every(value => Number.isInteger(value) && value > 0)) {
        throw new Error("Invalid banner configuration");
    }
    return `<!doctype html><html><head><meta name="referrer" content="strict-origin-when-cross-origin"><style>html,body{margin:0;padding:0;background:#0a0a0a;overflow:hidden}</style></head><body>
<script>
const notify = status => parent.postMessage({type:'blog-ad',token:'${token}',status}, '*');
const timeout = setTimeout(() => notify('failed'), 15000);
document.addEventListener('load', event => {
    if (event.target instanceof HTMLIFrameElement || event.target instanceof HTMLImageElement) {
        clearTimeout(timeout); notify('loaded');
    }
}, true);
window.atOptions = {key:'${key}',format:'iframe',height:${height},width:${width},params:{}};
</script>
<script src="https://bauval.org/22/${key}" onerror="clearTimeout(timeout);notify('failed')"></script>
</body></html>`;
}
