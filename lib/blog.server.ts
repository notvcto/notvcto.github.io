import fs from "fs"
import path from "path"
import matter from "gray-matter"
import { type BlogPost, type BlogPostMeta } from "./blog"

const contentDirectory = path.join(process.cwd(), "content/blog")

const REQUIRED_FIELDS: (keyof BlogPost)[] = [
  "title", "date", "category", "complexity", "readingTime",
  "author", "description", "tags",
]

function validateFrontmatter(slug: string, data: Record<string, unknown>): void {
  for (const field of REQUIRED_FIELDS) {
    if (data[field] === undefined || data[field] === null) {
      throw new Error(`Blog post "${slug}" is missing required frontmatter field: "${field}"`)
    }
  }
  if (!Array.isArray(data.tags)) {
    throw new Error(`Blog post "${slug}" has invalid "tags" field — must be an array`)
  }
  if (typeof data.complexity !== "number") {
    throw new Error(`Blog post "${slug}" has invalid "complexity" field — must be a number`)
  }
}

export function getAllPosts(): BlogPost[] {
  if (!fs.existsSync(contentDirectory)) return []

  return fs.readdirSync(contentDirectory)
    .filter((f) => f.endsWith(".md"))
    .map((fileName) => {
      const slug = fileName.replace(/\.md$/, "")
      const { data, content } = matter(fs.readFileSync(path.join(contentDirectory, fileName), "utf8"))
      validateFrontmatter(slug, data)
      return { slug, content, ...(data as Omit<BlogPost, "slug" | "content">) }
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function getPostBySlug(slug: string): BlogPost | null {
  try {
    const { data, content } = matter(
      fs.readFileSync(path.join(contentDirectory, `${slug}.md`), "utf8")
    )
    validateFrontmatter(slug, data)
    return { slug, content, ...(data as Omit<BlogPost, "slug" | "content">) }
  } catch {
    return null
  }
}

export function getAllPostsMeta(): BlogPostMeta[] {
  if (!fs.existsSync(contentDirectory)) return []

  return fs.readdirSync(contentDirectory)
    .filter((f) => f.endsWith(".md"))
    .map((fileName) => {
      const slug = fileName.replace(/\.md$/, "")
      const { data } = matter(fs.readFileSync(path.join(contentDirectory, fileName), "utf8"))
      validateFrontmatter(slug, data)
      return { slug, ...(data as Omit<BlogPostMeta, "slug">) }
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}
