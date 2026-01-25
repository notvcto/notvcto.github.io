import FileManager from "./index";

export const manifest = {
  id: "file-manager",
  name: "Files",
  icon: "./themes/Yaru/system/folder.png",
  singleton: false,
  entry: FileManager,
  desktopShortcut: false,
  favourite: true,
};
