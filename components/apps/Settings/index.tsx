import { useSystemStore } from '@/store/system';
import clsx from 'clsx';

export const Settings = () => {
  const { wallpaper, setWallpaper } = useSystemStore();

  const wallpapers = [
      { name: 'Default (Gradient)', id: 'default', color: 'bg-gradient-to-br from-[#eff1f5] to-[#dce0e8]' },
      { name: 'Deep Space', id: 'bg-space', img: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop' },
      { name: 'Forest', id: 'bg-forest', img: 'https://images.unsplash.com/photo-1448375240586-dfd8f3793371?q=80&w=2070&auto=format&fit=crop' },
  ];

  return (
    <div className="h-full bg-surface-light dark:bg-surface-dark p-6 text-text-dark">
      <h1 className="text-xl font-bold mb-4">Settings</h1>

      <div className="mb-6">
        <h2 className="text-sm font-semibold text-subtext-dark uppercase tracking-wider mb-3">Background</h2>
        <div className="grid grid-cols-3 gap-4">
            {wallpapers.map(wp => (
                <div
                    key={wp.id}
                    onClick={() => setWallpaper(wp.id)}
                    className={clsx(
                        "aspect-video rounded-lg cursor-pointer border-2 transition-all overflow-hidden relative",
                        wallpaper === wp.id ? "border-primary shadow-glow" : "border-transparent hover:border-white/20"
                    )}
                >
                    {wp.img ? (
                        <img src={wp.img} alt={wp.name} className="w-full h-full object-cover" />
                    ) : (
                        <div className={clsx("w-full h-full", wp.color)}></div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-1 text-xs text-center text-white backdrop-blur-sm">
                        {wp.name}
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};
