export interface BlogPost {
  slug: string
  title: string
  shortTitle: string
  ogTitle?: string
  ogSubtitle?: string
  date: string
  category: string
  complexity: number
  readingTime: string
  author: string
  description: string
  tags: string[]
  content: string
}

export type BlogPostMeta = Omit<BlogPost, "content">

export function getComplexityColor(score: number): string {
  if (score < 4.0) return "text-green-500"
  if (score < 7.0) return "text-yellow-500"
  if (score < 9.0) return "text-orange-500"
  return "text-red-500"
}
