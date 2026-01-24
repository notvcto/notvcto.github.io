import { AppID } from '@/store/system';
import dynamic from 'next/dynamic';

// Manifests
import { aboutManifest } from './About/manifest';
import { projectsManifest } from './Projects/manifest';
import { terminalManifest } from './Terminal/manifest';
import { spotifyManifest } from './Spotify/manifest';
import { vscodeManifest } from './VSCode/manifest';
import { firefoxManifest } from './Firefox/manifest';
import { settingsManifest } from './Settings/manifest';
import { trashManifest } from './Trash/manifest';
import { contactManifest } from './Contact/manifest';

// Components
const About = dynamic(() => import('./About').then(mod => mod.About));
const Projects = dynamic(() => import('./Projects').then(mod => mod.Projects));
const Terminal = dynamic(() => import('./Terminal').then(mod => mod.Terminal));
const Spotify = dynamic(() => import('./Spotify').then(mod => mod.Spotify));
const VSCode = dynamic(() => import('./VSCode').then(mod => mod.VSCode));
const Firefox = dynamic(() => import('./Firefox').then(mod => mod.Firefox));
const Settings = dynamic(() => import('./Settings').then(mod => mod.Settings));
const Trash = dynamic(() => import('./Trash').then(mod => mod.Trash));
const Contact = dynamic(() => import('./Contact').then(mod => mod.Contact));

export interface AppManifest {
  id: AppID;
  name: string;
  icon: string;
  defaultSize: { width: number; height: number };
  singleton: boolean;
}

export const apps: Record<AppID, { component: React.ComponentType, manifest: AppManifest }> = {
  about: { component: About, manifest: aboutManifest },
  projects: { component: Projects, manifest: projectsManifest },
  terminal: { component: Terminal, manifest: terminalManifest },
  spotify: { component: Spotify, manifest: spotifyManifest },
  vscode: { component: VSCode, manifest: vscodeManifest },
  firefox: { component: Firefox, manifest: firefoxManifest },
  settings: { component: Settings, manifest: settingsManifest },
  trash: { component: Trash, manifest: trashManifest },
  contact: { component: Contact, manifest: contactManifest },
  // Blog and Resume placeholders until fully implemented or merged
  blog: {
      component: () => <div className="p-4 text-text-light dark:text-text-dark">Blog app placeholder</div>,
      manifest: { id: 'blog', name: 'Blog', icon: 'article', defaultSize: { width: 600, height: 600 }, singleton: true }
  },
  resume: {
      component: () => <div className="p-4 text-text-light dark:text-text-dark">Resume app placeholder</div>,
      manifest: { id: 'resume', name: 'Resume', icon: 'description', defaultSize: { width: 800, height: 1000 }, singleton: true }
  },
};

export const getAppManifest = (id: AppID) => apps[id]?.manifest;
export const getAppComponent = (id: AppID) => apps[id]?.component;
