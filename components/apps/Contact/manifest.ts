// @ts-ignore
import { displayContact } from "@/components/apps/contact";

export const manifest = {
  id: "contact",
  name: "Contact Me",
  icon: "./themes/MoreWaita/apps/mail.svg",
  singleton: true,
  entry: displayContact,
  desktopShortcut: true,
  favourite: true,
};
