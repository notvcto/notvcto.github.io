import SettingsApp from "./index";

export const manifest = {
  id: "settings",
  name: "Settings",
  icon: "gnome-control-center",
  singleton: true,
  entry: SettingsApp,
  desktopShortcut: false,
  favourite: false,
};
