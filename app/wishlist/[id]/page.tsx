import { items } from "@/lib/items";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ItemClient } from "./item-client";

export async function generateStaticParams() {
    return items.map(item => ({
        id: item.id,
    }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    const item = items.find(i => i.id === id);

    if (!item) {
        return {
            title: "Item Not Found",
        };
    }

    return {
        title: `${item.title.en} | Wishlist`,
        description: item.notes.en,
    };
}

export default async function ItemPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const item = items.find(i => i.id === id);

    if (!item) {
        notFound();
    }

    return <ItemClient item={item} />;
}
