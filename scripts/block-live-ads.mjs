export async function blockLiveAds(page) {
    await page.setRequestInterception(true);
    page.on("request", request => {
        const host = new URL(request.url()).hostname;
        if (/(?:googlesyndication|doubleclick|googleadservices|fundingchoicesmessages)\./.test(host)) {
            void request.abort("blockedbyclient").catch(() => {});
        } else {
            void request.continue().catch(() => {});
        }
    });
}
