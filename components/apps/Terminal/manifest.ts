// @ts-ignore
import { displayTerminal } from "@/components/apps/terminal";

export const manifest = {
  id: "terminal",
  name: "Terminal",
  icon: "utilities-terminal",
  singleton: false,
  entry: displayTerminal,
  desktopShortcut: false,
  favourite: true,
};
