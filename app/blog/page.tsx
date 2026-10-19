import { getAllPostsMeta } from "@/lib/blog.server";
import type { Metadata } from "next";
import { BlogIndexClient } from "./blog-index-client";

export const metadata: Metadata = {
    title: "Blog",
    description: "Kernel development, cryptographic tooling, and security investigations by Vic Soto. What I tried, what broke, and what the results prove.",
    alternates: { canonical: "/blog" },
    openGraph: {
        title: "Blog | NOTVCTO",
        description: "Systems programming and security research, with enough detail to check the work.",
        url: "/blog",
        images: ["/og/portfolio.png"],
    },
    twitter: {
        card: "summary_large_image",
        title: "Blog | NOTVCTO",
        description: "Kernel development, cryptographic tooling, and security investigations.",
        images: ["/og/portfolio.png"],
    },
};

export default async function BlogIndexPage() {
    const posts = getAllPostsMeta();
    const firstPost = posts[0] || null;

    return <BlogIndexClient firstPost={firstPost} latestDate={firstPost?.date ?? null} />;
}
