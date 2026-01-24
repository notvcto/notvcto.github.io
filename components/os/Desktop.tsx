'use client';

import { TopBar } from './TopBar';
import { DesktopIcon } from './DesktopIcon';
import { WindowManager } from '@/components/wm/WindowManager';
import { useSystemStore } from '@/store/system';

export const Desktop = () => {
  const { icons } = useSystemStore();

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
      <div className="absolute inset-0 z-10 pointer-events-none">
        {icons.map((icon) => (
          <DesktopIcon key={icon.id} iconData={icon} />
        ))}
      </div>

      {/* Window Manager Layer */}
      <div className="fixed inset-0 z-20 pointer-events-none">
        <WindowManager />
      </div>
    </>
  );
};
