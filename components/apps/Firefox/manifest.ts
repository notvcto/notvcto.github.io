// @ts-ignore
import displayFirefox from "@/components/apps/firefox";

export const manifest = {
  id: "firefox",
  name: "Mozilla Firefox",
  icon: "./themes/MoreWaita/apps/firefox.svg",
  singleton: true,
  entry: displayFirefox,
  desktopShortcut: true,
  favourite: true,
};
