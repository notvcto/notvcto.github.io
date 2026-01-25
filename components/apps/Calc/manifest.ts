// @ts-ignore
import { displayTerminalCalc } from "@/components/apps/calc";

export const manifest = {
  id: "calc",
  name: "Calc",
  icon: "./themes/MoreWaita/apps/calc.svg",
  singleton: true,
  entry: displayTerminalCalc,
  desktopShortcut: false,
  favourite: true,
};
