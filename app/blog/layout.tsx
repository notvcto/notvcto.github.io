import type React from "react"
import { BlogSidebar } from "@/components/blog-sidebar"
import { getAllPostsMeta } from "@/lib/blog.server"

import { BlogMobileNav } from "@/components/blog-mobile-nav"

export default async function BlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const posts = getAllPostsMeta()

  return (
    <div className="min-h-screen bg-transparent text-foreground flex flex-col relative">
      <div className="flex-1 flex flex-col md:flex-row relative z-10 max-w-[1600px] mx-auto w-full px-6 lg:px-12 md:gap-12">
        {/* Sidebar - Floating GitBook Style */}
        <BlogSidebar posts={posts} />

        {/* Mobile Navigation Drawer */}
        <BlogMobileNav posts={posts} />

        {/* Main Content Area - Center Focused */}
        <main className="flex-1 flex justify-center pt-12 md:pt-24 pb-32">
          <div className="w-full max-w-3xl relative z-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
