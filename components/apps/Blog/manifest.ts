// @ts-ignore
import { displayBlog } from "@/components/apps/blog";

export const manifest = {
  id: "blog",
  name: "Blog",
  icon: "./themes/MoreWaita/apps/gedit.svg",
  singleton: true,
  entry: displayBlog,
  desktopShortcut: true,
  favourite: true,
};
