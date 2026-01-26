// @ts-ignore
import { displayBlog } from "@/components/apps/blog";

export const manifest = {
  id: "blog",
  name: "Blog",
  icon: "text-x-generic",
  singleton: true,
  entry: displayBlog,
  desktopShortcut: true,
  favourite: true,
};
