'use client';

import { useState, useEffect } from 'react';
import { useSystemStore } from '@/store/system';
import clsx from 'clsx';

export const TopBar = () => {
  const { activeDesktop, switchDesktop } = useSystemStore();
  const [time, setTime] = useState('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const timeString = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
      const dateString = now.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' }).replace(/\//g, '-');
      setTime(`${timeString} • ${dateString}`);
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 h-10 px-4 z-40 flex items-center justify-between text-sm font-mono bg-surface-light/80 dark:bg-surface-dark/80 glass border-b border-white/10 dark:border-white/5 select-none">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
          <span className="material-icons-round text-base text-primary">terminal</span>
          <span className="font-bold text-primary">{activeDesktop}</span>
        </div>
        <div className="flex gap-2 text-subtext-dark/50">
          {[1, 2, 3, 4, 5].map((id) => (
            id !== activeDesktop && (
              <button
                key={id}
                onClick={() => switchDesktop(id)}
                className="hover:text-text-dark cursor-pointer transition-colors"
              >
                {id}
              </button>
            )
          ))}
        </div>
      </div>

      <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-2 text-subtext-dark opacity-0 md:opacity-100 transition-opacity">
        <span className="material-icons-round text-base">schedule</span>
        <span>{time}</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 px-3 py-1 bg-surface-light dark:bg-[#1e1e2e] rounded-full border border-white/5">
          <div className="flex items-center gap-1 text-xs">
            <span className="material-icons-round text-sm text-green-accent">memory</span>
            <span>16%</span>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <span className="material-icons-round text-sm text-red-accent">thermostat</span>
            <span>36°C</span>
          </div>
          <div className="flex items-center gap-1 text-xs hidden sm:flex">
            <span className="material-icons-round text-sm text-blue-accent">wifi</span>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <span className="material-icons-round text-sm">volume_up</span>
          </div>
        </div>
        <button className="hover:text-primary transition-colors">
          <span className="material-icons-round">power_settings_new</span>
        </button>
      </div>
    </header>
  );
};
