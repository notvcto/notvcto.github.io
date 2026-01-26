import { ComponentType } from 'react';
import { manifest as Terminal } from './Terminal/manifest';
import { manifest as Settings } from './Settings/manifest';
import { manifest as Firefox } from './Firefox/manifest';
import { manifest as About } from './About/manifest';
import { manifest as Achievements } from './Achievements/manifest';
import { manifest as Blog } from './Blog/manifest';
import { manifest as Calc } from './Calc/manifest';
import { manifest as Contact } from './Contact/manifest';
import { manifest as Spotify } from './Spotify/manifest';
import { manifest as Trash } from './Trash/manifest';
import { manifest as VSCode } from './VSCode/manifest';
import { manifest as FileManager } from './FileManager/manifest';
import { manifest as TextEditor } from './TextEditor/manifest';
import { manifest as Clock } from './Clock/manifest';

export interface AppManifest {
  id: string;
  name: string;
  icon: string;
  singleton: boolean;
  entry: ComponentType<any>;
  desktopShortcut: boolean;
  favourite: boolean;
}

export const apps: Record<string, AppManifest> = {
  "file-manager": FileManager,
  "text-editor": TextEditor,
  terminal: Terminal,
  settings: Settings,
  firefox: Firefox,
  "about-vcto": About,
  achievements: Achievements,
  blog: Blog,
  calc: Calc,
  contact: Contact,
  clock: Clock,
  spotify: Spotify,
  trash: Trash,
  vscode: VSCode,
};

export const defaultApps = Object.values(apps);
