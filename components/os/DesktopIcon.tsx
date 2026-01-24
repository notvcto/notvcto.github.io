'use client';

import { AppID, useSystemStore } from '@/store/system';
import clsx from 'clsx';

interface DesktopIconProps {
  appId: AppID;
  label: string;
  icon: string;
  top: number;
  left: number;
  color?: string; // e.g. "blue-accent", "primary", "green-accent"
  special?: boolean; // For the resume/file style
}

export const DesktopIcon = ({ appId, label, icon, top, left, color = 'primary', special = false }: DesktopIconProps) => {
  const spawnWindow = useSystemStore((state) => state.spawnWindow);

  // Construct color classes dynamically based on the prop, unless special
  const containerClass = special
    ? "bg-white/5 border-white/10 group-hover:bg-white/10"
    : `bg-${color}/10 border-${color}/20 group-hover:bg-${color}/20`;

  const iconClass = special
    ? "text-subtext-dark"
    : `text-${color}`;

  // Since Tailwind doesn't support dynamic class construction like `bg-${color}/10` at build time effectively
  // without safelisting, it's safer to map them or pass full classes.
  // However, for this specific set, I'll use a mapping to be safe and explicit.

  const colorMap: Record<string, { container: string; icon: string }> = {
    'blue-accent': { container: 'bg-blue-accent/10 border-blue-accent/20 group-hover:bg-blue-accent/20', icon: 'text-blue-accent' },
    'primary': { container: 'bg-primary/10 border-primary/20 group-hover:bg-primary/20', icon: 'text-primary' },
    'green-accent': { container: 'bg-green-accent/10 border-green-accent/20 group-hover:bg-green-accent/20', icon: 'text-green-accent' },
    'subtext-dark': { container: 'bg-white/5 border-white/10 group-hover:bg-white/10', icon: 'text-subtext-dark' },
  };

  const styles = colorMap[color] || colorMap['primary'];

  return (
    <div
      className="pointer-events-auto absolute flex flex-col items-center gap-1 group w-20 cursor-pointer"
      style={{ top: top, left: left }}
      onClick={() => spawnWindow(appId)}
    >
      <div className={clsx(
        "w-12 h-12 flex items-center justify-center rounded-xl border transition-colors",
        styles.container
      )}>
        <span className={clsx("material-icons-round text-3xl", styles.icon)}>
          {icon}
        </span>
      </div>
      <span className="text-xs font-medium text-text-dark shadow-black drop-shadow-md text-center group-hover:bg-primary/20 group-hover:rounded px-1">
        {label}
      </span>
    </div>
  );
};
