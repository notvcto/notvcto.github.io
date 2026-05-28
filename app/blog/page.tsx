import { getAllPosts } from "@/lib/blog.server"
import { BlogIndexClient } from "./blog-index-client"

export default async function BlogIndexPage() {
  const posts = getAllPosts()
  const firstPost = posts[0] || null

  return <BlogIndexClient firstPost={firstPost} latestDate={firstPost?.date ?? null} />
}
