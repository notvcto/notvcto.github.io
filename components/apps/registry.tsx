import { AppID } from '@/store/system';
import dynamic from 'next/dynamic';

// Manifests
import { aboutManifest } from './About/manifest';
import { projectsManifest } from './Projects/manifest';
import { terminalManifest } from './Terminal/manifest';

// Components
const About = dynamic(() => import('./About').then(mod => mod.About));
const Projects = dynamic(() => import('./Projects').then(mod => mod.Projects));
const Terminal = dynamic(() => import('./Terminal').then(mod => mod.Terminal));

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
  contact: {
      component: () => <div className="p-4 text-text-light dark:text-text-dark">Contact app placeholder</div>,
      manifest: { id: 'contact', name: 'Contact', icon: 'alternate_email', defaultSize: { width: 400, height: 300 }, singleton: true }
  },
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
