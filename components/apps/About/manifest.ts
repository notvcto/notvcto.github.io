// @ts-ignore
import { displayAboutVcto } from "@/components/apps/vcto";

export const manifest = {
  id: "about-vcto",
  name: "about vcto",
  icon: "user-home",
  singleton: true,
  entry: displayAboutVcto,
  desktopShortcut: true,
  favourite: false,
};
