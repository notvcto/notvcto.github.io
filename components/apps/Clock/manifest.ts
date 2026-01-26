import ClockApp from "./index";

export const manifest = {
  id: "clock",
  name: "Clock",
  icon: "clock",
  singleton: true,
  entry: ClockApp,
  desktopShortcut: true,
  favourite: true,
};
