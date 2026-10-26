import { adsConfig } from "@/lib/ads";

export const dynamic = "force-static";

export function GET() {
    const body = /^ca-pub-\d{16}$/.test(adsConfig.client)
        ? `google.com, ${adsConfig.client.slice(3)}, DIRECT, f08c47fec0942fa0\n`
        : "# No authorized advertising accounts configured.\n";
    return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
