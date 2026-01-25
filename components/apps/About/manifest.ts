// @ts-ignore
import { displayAboutVcto } from "@/components/apps/vcto";

export const manifest = {
  id: "about-vcto",
  name: "about vcto",
  icon: "./themes/MoreWaita/system/user-home.svg",
  singleton: true,
  entry: displayAboutVcto,
  desktopShortcut: true,
  favourite: false,
};
