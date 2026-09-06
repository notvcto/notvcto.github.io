import type { Metadata } from "next";
import { WishlistClient } from "./wishlist-client";

export const metadata: Metadata = {
    title: "Wishlist",
    description: "Birthday wishlist — September 20. Tools, RF gear, storage, electronics, and hardware.",
    alternates: { canonical: "/wishlist" },
    openGraph: {
        title: "Wishlist | NOTVCTO",
        description: "Birthday wishlist — September 20. Tools, RF gear, storage, electronics, and hardware.",
        images: ["/og/portfolio.png"],
    },
};

export default function WishlistPage() {
    return <WishlistClient />;
}
