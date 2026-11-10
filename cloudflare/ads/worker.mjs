// Serve only the generated banner wrappers, on an origin separate from the portfolio.
const worker = {
    async fetch(request) {
        const url = new URL(request.url);
        if (!["GET", "HEAD"].includes(request.method)) return new Response("Method not allowed", { status: 405, headers: { Allow: "GET, HEAD" } });
        if (!/^\/ad-frame\/[a-f0-9]{32}$/.test(url.pathname)) return new Response("Not found", { status: 404 });
        let upstream;
        try { upstream = await fetch(`https://notvc.to${url.pathname}`, { redirect: "error" }); }
        catch { return new Response("Banner wrapper unavailable", { status: 502 }); }
        if (!upstream.ok) return new Response("Banner wrapper unavailable", { status: 502 });
        return new Response(request.method === "HEAD" ? null : upstream.body, {
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
