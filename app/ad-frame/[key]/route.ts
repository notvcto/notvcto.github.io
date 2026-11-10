import { adsConfig } from "@/lib/ads";
import { buildAdDocument } from "@/lib/ads-runtime";

export const dynamic = "force-static";
export const dynamicParams = false;
export function generateStaticParams() {
    return Object.values(adsConfig.units).map(unit => ({ key: unit.key }));
}
export async function GET(_request: Request, { params }: { params: Promise<{ key: string }> }) {
    const { key } = await params;
    const unit = Object.values(adsConfig.units).find(unit => unit.key === key);
    if (!unit) return new Response("Not found", { status: 404 });
    return new Response(buildAdDocument(unit.key, unit.width, unit.height, unit.key), {
        headers: { "Content-Type": "text/html; charset=utf-8" },
    });
}
