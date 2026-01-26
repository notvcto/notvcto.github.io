// @ts-ignore
import { displayTrash } from "@/components/apps/trash";

export const manifest = {
  id: "trash",
  name: "Trash",
  icon: "user-trash",
  singleton: true,
  entry: displayTrash,
  desktopShortcut: true,
  favourite: false,
};
