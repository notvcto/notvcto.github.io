import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getPostBySlug, getAllPosts, getAllPostsMeta, isValidPostSlug } from "@/lib/blog.server"
import { BlogPostClient } from "./post-client"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  if (!isValidPostSlug(slug)) return {}

  const post = getPostBySlug(slug)

  if (!post) return {}

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.date,
      authors: [post.author],
      tags: post.tags,
      images: [
        {
          url: `/og/${slug}.png`,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: [`/og/${slug}.png`],
    },
  }
}

export async function generateStaticParams() {
  const posts = getAllPosts()
  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  if (!isValidPostSlug(slug)) {
    notFound()
  }

  const post = getPostBySlug(slug)

  if (!post) {
    notFound()
  }

  const allPosts = getAllPostsMeta()
  const currentIndex = allPosts.findIndex((p) => p.slug === slug)
  const nextPost = currentIndex !== -1 && currentIndex < allPosts.length - 1
    ? allPosts[currentIndex + 1]
    : null

  return <BlogPostClient post={post} nextPost={nextPost} />
}
