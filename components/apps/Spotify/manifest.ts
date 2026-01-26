// @ts-ignore
import displaySpotify from "@/components/apps/spotify";

export const manifest = {
  id: "spotify",
  name: "Spotify",
  icon: "spotify",
  singleton: true,
  entry: displaySpotify,
  desktopShortcut: false,
  favourite: true,
};
