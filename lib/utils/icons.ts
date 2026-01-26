export const icons = {
  // Apps
  "ubuntu-logo": "/themes/Yaru/status/ubuntu-logo-symbolic.svg",
  firefox: "/themes/Yaru/apps/web-browser.png",
  "org.gnome.Nautilus": "/themes/Yaru/apps/org.gnome.Nautilus.png",
  "utilities-terminal": "/themes/Yaru/apps/utilities-terminal.png",
  "mail-message-new": "/themes/Yaru/actions/mail-message-new.png",
  "accessories-calculator": "/themes/Yaru/apps/accessories-calculator.png",
  "accessories-text-editor": "/themes/Yaru/apps/accessories-text-editor.png",
  spotify: "/themes/MoreWaita/apps/spotify.svg",
  vscode: "/themes/MoreWaita/apps/vscode.svg",
  achievements: "/themes/MoreWaita/apps/achievements.svg",
  blog: "/themes/MoreWaita/apps/gedit.svg",
  discord: "/themes/Yaru/apps/applications-other.png",
  hackerone: "/themes/MoreWaita/apps/hackerone.svg",
  "gnome-control-center": "/themes/Yaru/apps/gnome-control-center.png",

  // Places
  "user-home": "/themes/Yaru/places/user-home.png",
  "user-trash": "/themes/Yaru/places/user-trash.png",
  folder: "/themes/Yaru/places/folder.png",
  cdrom: "/themes/Yaru/devices/media-optical.png",

  // Status
  "dialog-information": "/themes/Yaru/status/dialog-information.png",
  "user-trash-full": "/themes/Yaru/status/user-trash-full.png",

  // Mimetypes
  "text-x-generic": "/themes/Yaru/mimetypes/text-x-generic.png",
  "application-x-generic": "/themes/Yaru/mimetypes/application-x-executable.png",

  // Window Controls - Keeping existing SVGs for now (Symbolic)
  "window-minimize": "/themes/Yaru/window/window-minimize-symbolic.svg",
  "window-maximize": "/themes/Yaru/window/window-maximize-symbolic.svg",
  "window-restore": "/themes/Yaru/window/window-restore-symbolic.svg",
  "window-close": "/themes/Yaru/window/window-close-symbolic.svg",
};

export type IconName = keyof typeof icons;

export const getIconPath = (name: string): string => {
  if (name in icons) {
    return icons[name as IconName];
  }
  // Fallback or pass-through if it's already a path (legacy check)
  if (name.startsWith("/") || name.startsWith("./")) {
    return name;
  }
  // Default fallback
  console.warn(`Icon not found: ${name}`);
  return icons["application-x-generic"];
};
