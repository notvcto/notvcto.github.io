export const icons = {
  // Apps
  firefox: "/themes/Yaru/apps/firefox.svg",
  "org.gnome.Nautilus": "/themes/Yaru/apps/org.gnome.Nautilus.svg",
  "utilities-terminal": "/themes/Yaru/apps/utilities-terminal.svg",
  "mail-message-new": "/themes/Yaru/apps/mail-message-new.svg",
  "accessories-calculator": "/themes/Yaru/apps/accessories-calculator.svg",
  spotify: "/themes/Yaru/apps/spotify.svg",
  vscode: "/themes/Yaru/apps/vscode.svg",
  "gnome-control-center": "/themes/Yaru/apps/gnome-control-center.svg",

  // Places
  "user-home": "/themes/Yaru/places/user-home.png",
  "user-trash": "/themes/Yaru/places/user-trash.svg",
  folder: "/themes/Yaru/places/folder.svg",

  // Status
  "dialog-information": "/themes/Yaru/status/dialog-information.svg",
  "user-trash-full": "/themes/Yaru/status/user-trash-full.png",

  // Mimetypes
  "text-x-generic": "/themes/Yaru/mimetypes/text-x-generic.svg",
  "application-x-generic": "/themes/Yaru/mimetypes/application-x-generic.svg",

  // Window Controls
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
  // Default fallback (generic file?)
  console.warn(`Icon not found: ${name}`);
  return icons["text-x-generic"];
};
