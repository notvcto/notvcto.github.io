// @ts-ignore
import { displayAchievements } from "@/components/apps/achievements";

export const manifest = {
  id: "achievements",
  name: "Achievements",
  icon: "./themes/MoreWaita/apps/achievements.svg",
  singleton: true,
  entry: displayAchievements,
  desktopShortcut: true,
  favourite: true,
};
