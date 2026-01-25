import displaySpotify from "./components/apps/spotify";
import displayVsCode from "./components/apps/vscode";
import { displayTerminal } from "./components/apps/terminal";
import { displaySettings } from "./components/apps/settings";
import { displayFirefox } from "./components/apps/firefox";
import { displayTrash } from "./components/apps/trash";
import { displayGedit } from "./components/apps/gedit";
import { displayAboutVcto } from "./components/apps/vcto";
import { displayTerminalCalc } from "./components/apps/calc";
import { displayBlog } from "./components/apps/blog";
import { displayAchievements } from "./components/apps/achievements";

const apps = [
  {
    id: "firefox",
    title: "Mozilla Firefox",
    icon: "./themes/MoreWaita/apps/firefox.svg",
    disabled: false,
    favourite: true,
    desktop_shortcut: true,
    screen: displayFirefox,
  },
  {
    id: "achievements",
    title: "Achievements",
    icon: "./themes/MoreWaita/apps/achievements.svg",
    disabled: false,
    favourite: true,
    desktop_shortcut: true,
    screen: displayAchievements,
  },
  {
    id: "blog",
    title: "Blog",
    icon: "./themes/MoreWaita/apps/gedit.svg",
    disabled: false,
    favourite: true,
    desktop_shortcut: true,
    screen: displayBlog,
  },
  {
    id: "calc",
    title: "Calc",
    icon: "./themes/MoreWaita/apps/calc.svg",
    disabled: false,
    favourite: true,
    desktop_shortcut: false,
    screen: displayTerminalCalc,
  },
  {
    id: "about-vcto",
    title: "about vcto",
    icon: "./themes/MoreWaita/system/user-home.svg",
    disabled: false,
    favourite: true,
    desktop_shortcut: true,
    screen: displayAboutVcto,
  },
  {
    id: "vscode",
    title: "Visual Studio Code",
    icon: "./themes/MoreWaita/apps/vscode.svg",
    disabled: false,
    favourite: true,
    desktop_shortcut: false,
    screen: displayVsCode,
  },
  {
    id: "terminal",
    title: "Terminal",
    icon: "./themes/MoreWaita/apps/terminal.svg",
    disabled: false,
    favourite: true,
    desktop_shortcut: false,
    screen: displayTerminal,
  },
  {
    id: "spotify",
    title: "Spotify",
    icon: "./themes/MoreWaita/apps/spotify.svg",
    disabled: false,
    favourite: true,
    desktop_shortcut: false,
    screen: displaySpotify, // India Top 50 Playlist 😅
  },
  {
    id: "settings",
    title: "Settings",
    icon: "./themes/MoreWaita/apps/settings.svg",
    disabled: false,
    favourite: true,
    desktop_shortcut: false,
    screen: displaySettings,
  },
  {
    id: "trash",
    title: "Trash",
    icon: "./themes/MoreWaita/system/user-trash-full.svg",
    disabled: false,
    favourite: false,
    desktop_shortcut: true,
    screen: displayTrash,
  },
  {
    id: "gedit",
    title: "Contact Me",
    icon: "./themes/MoreWaita/apps/mail.svg",
    disabled: false,
    favourite: false,
    desktop_shortcut: true,
    screen: displayGedit,
  },
];

export default apps;
