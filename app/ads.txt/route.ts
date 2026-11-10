export const dynamic = "force-static";

export function GET() {
    const body = process.env.ADSTERRA_ADS_TXT?.trim() || "# No authorized advertising accounts configured.";
    return new Response(body + "\n", { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
