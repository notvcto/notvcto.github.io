import SettingsApp from "./index";

export const manifest = {
  id: "settings",
  name: "Settings",
  icon: "./themes/MoreWaita/apps/settings.svg",
  singleton: true,
  entry: SettingsApp,
  desktopShortcut: false,
  favourite: false,
};
