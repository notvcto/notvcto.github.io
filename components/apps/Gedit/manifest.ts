// @ts-ignore
import { displayGedit } from "@/components/apps/gedit";

export const manifest = {
  id: "gedit",
  name: "Contact Me",
  icon: "./themes/MoreWaita/apps/mail.svg",
  singleton: true,
  entry: displayGedit,
  desktopShortcut: true,
  favourite: false,
};
