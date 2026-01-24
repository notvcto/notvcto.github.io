'use client';

import { TopBar } from './TopBar';
import { DesktopIcon } from './DesktopIcon';
import { WindowManager } from '@/components/wm/WindowManager';

export const Desktop = () => {
  return (
    <>
      <div className="fixed inset-0 scanlines z-50 pointer-events-none opacity-20"></div>

      {/* Background */}
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-background-light to-[#dce0e8] dark:from-background-dark dark:to-[#11111b]">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl"></div>
      </div>

      <TopBar />

      {/* Desktop Icons Layer */}
      <div className="absolute inset-0 z-10 pt-16 px-6 pointer-events-none">
        <DesktopIcon
          appId="projects"
          label="Projects"
          icon="folder"
          color="blue-accent"
          top={96} // top-24 -> 6rem * 16 = 96px
          left={32} // left-8 -> 2rem * 16 = 32px
        />
        <DesktopIcon
          appId="about"
          label="About Me"
          icon="person"
          color="primary"
          top={192} // top-48 -> 12rem * 16 = 192px
          left={32}
        />
        <DesktopIcon
          appId="contact"
          label="Contact"
          icon="alternate_email"
          color="green-accent"
          top={288} // top-72 -> 18rem * 16 = 288px
          left={32}
        />
        <DesktopIcon
          appId="resume"
          label="resume.pdf"
          icon="description"
          color="subtext-dark"
          top={128} // top-32 -> 8rem * 16 = 128px
          left={128} // left-32 -> 8rem * 16 = 128px
        />
      </div>

      {/* Window Manager Layer */}
      <div className="fixed inset-0 z-20 pointer-events-none">
        <WindowManager />
      </div>
    </>
  );
};
