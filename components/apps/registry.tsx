'use client';

import dynamic from 'next/dynamic';
import { AppID } from '@/store/system';

const Terminal = dynamic(() => import('./Terminal').then(mod => mod.Terminal));
const About = dynamic(() => import('./About').then(mod => mod.About));
const Projects = dynamic(() => import('./Projects').then(mod => mod.Projects));
// const Contact = dynamic(() => import('./Contact').then(mod => mod.Contact));

export const AppRegistry: Record<AppID, React.ComponentType> = {
  terminal: Terminal,
  about: About,
  projects: Projects,
  contact: () => <div className="p-4 text-text-light dark:text-text-dark">Contact Me: user@arch.linux</div>, // Simple inline for now
  blog: () => <div className="p-4 text-text-light dark:text-text-dark">Blog coming soon...</div>,
  resume: () => <div className="p-4 text-text-light dark:text-text-dark">Resume PDF Viewer Placeholder</div>,
};
