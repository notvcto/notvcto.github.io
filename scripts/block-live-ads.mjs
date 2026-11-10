export async function blockLiveAds(page) {
    // Unrelated UI checks must not be covered by the consent panel.
    await page.evaluateOnNewDocument(() => {
        try { localStorage.setItem("blog:adsterra-consent:v1", JSON.stringify({ value: "deny", expires: Date.now() + 86400000 })); } catch { /* Storage may be unavailable. */ }
    });
    await page.setRequestInterception(true);
    page.on("request", request => {
        const host = new URL(request.url()).hostname;
        if (host === "bauval.org" || /(?:googlesyndication|doubleclick|googleadservices|fundingchoicesmessages)\./.test(host)) {
            void request.abort("blockedbyclient").catch(() => {});
        } else {
            void request.continue().catch(() => {});
        }
    });
}
