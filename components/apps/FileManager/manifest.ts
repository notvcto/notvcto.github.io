import FileManager from "./index";

export const manifest = {
  id: "file-manager",
  name: "Files",
  icon: "org.gnome.Nautilus",
  singleton: false,
  entry: FileManager,
  desktopShortcut: false,
  favourite: true,
};
