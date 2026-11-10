// Standalone Worker: paste this complete file into Cloudflare's editor.
const units = {
    "4354f360f5c39181fda663c280098eaf": [468, 60],
    "8c0862c573b41551f0463efc9b7d55f8": [320, 50],
    "fd2ee69661b7afb7554a176de6756d7e": [300, 250],
};
const worker = {
    async fetch(request) {
        if (!["GET", "HEAD"].includes(request.method)) return new Response("Method not allowed", { status: 405, headers: { Allow: "GET, HEAD" } });
        const path = new URL(request.url).pathname;
        const key = /^\/ad-frame\/([a-f0-9]{32})$/.exec(path)?.[1];
        if (!key || !Object.hasOwn(units, key)) return new Response("Not found", { status: 404 });
        const [width, height] = units[key];
        const body = `<!doctype html><html><head><meta name="robots" content="noindex"><meta name="referrer" content="strict-origin-when-cross-origin"><style>html,body{margin:0;padding:0;background:#0a0a0a;overflow:hidden}</style></head><body>
<script>
const notify = status => parent.postMessage({type:'blog-ad',token:'${key}',status}, 'https://notvc.to');
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
        return new Response(request.method === "HEAD" ? null : body, {
            headers: {
                "Content-Type": "text/html; charset=utf-8",
                "Content-Security-Policy": "frame-ancestors https://notvc.to",
                "Origin-Agent-Cluster": "?1",
                "X-Content-Type-Options": "nosniff",
                "X-Robots-Tag": "noindex, nofollow",
                "Cache-Control": "public, max-age=300",
            },
        });
    },
};
export default worker;
