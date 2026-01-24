'use client';

import { useSystemStore } from '@/store/system';
import { WindowFrame } from './WindowFrame';
import { getAppComponent } from '@/components/apps/registry';

export const WindowManager = () => {
  const { windows, activeDesktop } = useSystemStore();

  // Filter windows for the active desktop
  const activeWindows = Object.values(windows).filter(w => w.desktopId === activeDesktop);

  return (
    <>
      {activeWindows.map((window) => {
        const AppComponent = getAppComponent(window.appId);
        return (
          <WindowFrame key={window.id} window={window}>
            {AppComponent ? <AppComponent /> : <div className="p-4">App not found: {window.appId}</div>}
          </WindowFrame>
        );
      })}
    </>
  );
};
