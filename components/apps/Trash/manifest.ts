// @ts-ignore
import { displayTrash } from "@/components/apps/trash";

export const manifest = {
  id: "trash",
  name: "Trash",
  icon: "./themes/MoreWaita/system/user-trash-full.svg",
  singleton: true,
  entry: displayTrash,
  desktopShortcut: true,
  favourite: false,
};
