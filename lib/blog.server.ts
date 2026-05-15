import fs from "fs"
import path from "path"
import matter from "gray-matter"
import { formatDistanceToNow } from "date-fns"
import { type BlogPost } from "./blog"

const contentDirectory = path.join(process.cwd(), "content/blog")

export function getAllPosts(): BlogPost[] {
  if (!fs.existsSync(contentDirectory)) {
    return []
  }

  const fileNames = fs.readdirSync(contentDirectory)
  const allPostsData = fileNames
    .filter((fileName) => fileName.endsWith(".md"))
    .map((fileName) => {
      const slug = fileName.replace(/\.md$/, "")
      const fullPath = path.join(contentDirectory, fileName)
      const fileContents = fs.readFileSync(fullPath, "utf8")
      const { data, content } = matter(fileContents)

      return {
        slug,
        content,
        ...(data as Omit<BlogPost, "slug" | "content">),
      }
    })

  // Sort posts by date
  return allPostsData.sort((a, b) => (a.date < b.date ? 1 : -1))
}

export function getPostBySlug(slug: string): BlogPost | null {
  try {
    const fullPath = path.join(contentDirectory, `${slug}.md`)
    const fileContents = fs.readFileSync(fullPath, "utf8")
    const { data, content } = matter(fileContents)

    return {
      slug,
      content,
      ...(data as Omit<BlogPost, "slug" | "content">),
    }
  } catch (e) {
    return null
  }
}

export function getLatestUpdateStatus(): string {
  const posts = getAllPosts()
  if (posts.length === 0) return "No updates yet"
  
  const latestDate = new Date(posts[0].date)
  return `Last updated ${formatDistanceToNow(latestDate)} ago`
}
