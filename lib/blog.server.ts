import fs from "fs"
import path from "path"
import matter from "gray-matter"
import { type BlogPost, type BlogPostMeta } from "./blog"

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

export function getAllPostsMeta(): BlogPostMeta[] {
  if (!fs.existsSync(contentDirectory)) {
    return []
  }

  const fileNames = fs.readdirSync(contentDirectory)
  return fileNames
    .filter((fileName) => fileName.endsWith(".md"))
    .map((fileName) => {
      const slug = fileName.replace(/\.md$/, "")
      const fullPath = path.join(contentDirectory, fileName)
      const fileContents = fs.readFileSync(fullPath, "utf8")
      const { data } = matter(fileContents)

      return {
        slug,
        ...(data as Omit<BlogPostMeta, "slug">),
      }
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1))
}
