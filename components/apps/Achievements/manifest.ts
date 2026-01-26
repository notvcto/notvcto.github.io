// @ts-ignore
import { displayAchievements } from "@/components/apps/achievements";

export const manifest = {
  id: "achievements",
  name: "Achievements",
  icon: "achievements",
  singleton: true,
  entry: displayAchievements,
  desktopShortcut: true,
  favourite: true,
};
