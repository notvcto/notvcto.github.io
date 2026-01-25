// @ts-ignore
import { displaySettings } from "@/components/apps/settings";

export const manifest = {
  id: "settings",
  name: "Settings",
  icon: "./themes/MoreWaita/apps/settings.svg",
  singleton: true,
  entry: displaySettings,
  desktopShortcut: false,
  favourite: true,
};
