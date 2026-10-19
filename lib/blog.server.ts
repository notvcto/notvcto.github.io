import fs from "node:fs";
import matter from "gray-matter";
import path from "node:path";
import { type BlogPost, type BlogPostMeta } from "./blog.ts";

const contentDirectory = path.join(process.cwd(), "content/blog");
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;

export function isValidPostSlug(slug: string): boolean {
    return SLUG_PATTERN.test(slug);
}

export function parsePost(slug: string, source: string): BlogPost {
    const invalid = (field: string) => {
        throw new Error(`Blog post "${slug}" has invalid "${field}" frontmatter`);
    };
    if (!isValidPostSlug(slug)) invalid("slug");
    const { data, content } = matter(source);
    for (const field of ["title", "date", "category", "readingTime", "author", "description"]) {
        if (typeof data[field] !== "string" || !data[field].trim()) invalid(field);
    }
    for (const field of ["shortTitle", "ogTitle", "ogSubtitle"]) {
        if (data[field] !== undefined && typeof data[field] !== "string") invalid(field);
    }
    if (!DATE_PATTERN.test(data.date) || !Number.isFinite(Date.parse(data.date))) invalid("date");
    const day = new Date(`${data.date.slice(0, 10)}T00:00:00Z`);
    if (!Number.isFinite(day.getTime()) || day.toISOString().slice(0, 10) !== data.date.slice(0, 10)) invalid("date");
    if (!Array.isArray(data.tags) || !data.tags.every((tag: unknown) => typeof tag === "string")) invalid("tags");
    if (typeof data.complexity !== "number" || !Number.isFinite(data.complexity) || data.complexity < 0 || data.complexity > 10) {
        invalid("complexity");
    }
    return { ...(data as Omit<BlogPost, "slug" | "content">), slug, content };
}

export function getPostBySlug(slug: string): BlogPost | null {
    if (!isValidPostSlug(slug)) return null;
    let source: string;
    try {
        source = fs.readFileSync(path.join(contentDirectory, `${slug}.md`), "utf8");
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
        throw error;
    }
    return parsePost(slug, source);
}

export function getAllPosts(): BlogPost[] {
    if (!fs.existsSync(contentDirectory)) return [];
    return fs.readdirSync(contentDirectory)
        .filter(file => file.endsWith(".md"))
        .map(file => getPostBySlug(file.slice(0, -3))!)
        .sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
}

export function getAllPostsMeta(): BlogPostMeta[] {
    return getAllPosts().map(post => {
        const { content, ...meta } = post;
        void content;
        return meta;
    });
}
