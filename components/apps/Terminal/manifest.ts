// @ts-ignore
import { displayTerminal } from "@/components/apps/terminal";

export const manifest = {
  id: "terminal",
  name: "Terminal",
  icon: "./themes/MoreWaita/apps/terminal.svg",
  singleton: false,
  entry: displayTerminal,
  desktopShortcut: false,
  favourite: true,
};
