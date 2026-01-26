// @ts-ignore
import displayFirefox from "@/components/apps/firefox";

export const manifest = {
  id: "firefox",
  name: "Mozilla Firefox",
  icon: "firefox",
  singleton: true,
  entry: displayFirefox,
  desktopShortcut: true,
  favourite: true,
};
