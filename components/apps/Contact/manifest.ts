// @ts-ignore
import { displayContact } from "@/components/apps/contact";

export const manifest = {
  id: "contact",
  name: "Contact Me",
  icon: "mail-message-new",
  singleton: true,
  entry: displayContact,
  desktopShortcut: true,
  favourite: true,
};
