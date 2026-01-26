// @ts-ignore
import displayVsCode from "@/components/apps/vscode";

export const manifest = {
  id: "vscode",
  name: "Visual Studio Code",
  icon: "vscode",
  singleton: true,
  entry: displayVsCode,
  desktopShortcut: false,
  favourite: true,
};
