// @ts-ignore
import { displayBlog } from "@/components/apps/blog";

export const manifest = {
  id: "blog",
  name: "Blog",
  icon: "blog",
  singleton: true,
  entry: displayBlog,
  desktopShortcut: true,
  favourite: true,
};
