import React, { useState } from 'react';
import { useSettingsStore } from '@/lib/store/settings';

const wallpapers: Record<string, string> = {
  "wall-1": "./images/wallpapers/wall-1.webp",
  "wall-2": "./images/wallpapers/wall-2.webp",
  "wall-3": "./images/wallpapers/wall-3.webp",
  "wall-4": "./images/wallpapers/wall-4.webp",
  "wall-5": "./images/wallpapers/wall-5.webp",
  "wall-6": "./images/wallpapers/wall-6.webp",
  "wall-7": "./images/wallpapers/wall-7.webp",
  "wall-8": "./images/wallpapers/wall-8.webp",
  "wall-9": "./images/wallpapers/wall-9.webp",
  "wall-10": "./images/wallpapers/wall-10.webp",
  "minimal": "./images/wallpapers/minimal.png",
};

const accentColors = [
  { name: "Ubuntu Orange", hex: "#E95420" },
  { name: "Forest Green", hex: "#4E9A06" },
  { name: "Royal Blue", hex: "#3465A4" },
  { name: "Aubergine", hex: "#77216F" },
  { name: "Crimson Red", hex: "#C0392B" },
];

export default function SettingsApp() {
  const [activeTab, setActiveTab] = useState<'appearance' | 'sound' | 'display'>('appearance');

  const {
    wallpaper, setWallpaper,
    accentColor, setAccentColor,
    darkMode, setDarkMode,
    volume, setVolume,
    brightness, setBrightness
  } = useSettingsStore();

  const renderSidebar = () => (
    <div className="w-1/4 min-w-[200px] bg-gray-900 bg-opacity-90 border-r border-gray-700 flex flex-col pt-4">
      <div className="px-4 mb-6 flex items-center">
        <img src="./themes/MoreWaita/apps/settings.svg" alt="Settings" className="w-6 h-6 mr-3" />
        <span className="text-white font-bold text-lg">Settings</span>
      </div>
      <nav className="flex-1 space-y-1 px-2">
        <button
          onClick={() => setActiveTab('appearance')}
          className={`w-full text-left px-4 py-2 rounded-md transition-colors flex items-center ${
            activeTab === 'appearance' ? 'bg-ub-orange text-white' : 'text-gray-300 hover:bg-gray-800'
          }`}
        >
          <span className="mr-3">🎨</span> Appearance
        </button>
        <button
          onClick={() => setActiveTab('sound')}
          className={`w-full text-left px-4 py-2 rounded-md transition-colors flex items-center ${
            activeTab === 'sound' ? 'bg-ub-orange text-white' : 'text-gray-300 hover:bg-gray-800'
          }`}
        >
          <span className="mr-3">🔊</span> Sound
        </button>
        <button
          onClick={() => setActiveTab('display')}
          className={`w-full text-left px-4 py-2 rounded-md transition-colors flex items-center ${
            activeTab === 'display' ? 'bg-ub-orange text-white' : 'text-gray-300 hover:bg-gray-800'
          }`}
        >
          <span className="mr-3">🖥️</span> Display
        </button>
      </nav>
    </div>
  );

  const renderAppearance = () => (
    <div className="space-y-8 animate-fade-in">
      {/* Dark Mode */}
      <section>
        <h3 className="text-xl font-medium text-white mb-4">Theme</h3>
        <div className="bg-gray-800 rounded-lg p-4 flex items-center justify-between border border-gray-700">
           <span className="text-gray-300">Dark Mode</span>
           <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={darkMode}
                onChange={(e) => setDarkMode(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-ub-orange"></div>
           </label>
        </div>
      </section>

      {/* Accent Color */}
      <section>
        <h3 className="text-xl font-medium text-white mb-4">Accent Color</h3>
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 flex flex-wrap gap-4">
          {accentColors.map((color) => (
            <button
              key={color.hex}
              onClick={() => setAccentColor(color.hex)}
              className={`w-10 h-10 rounded-full transition-transform hover:scale-110 flex items-center justify-center focus:outline-none ring-2 ring-offset-2 ring-offset-gray-800 ${
                accentColor === color.hex ? 'ring-white' : 'ring-transparent'
              }`}
              style={{ backgroundColor: color.hex }}
              title={color.name}
              aria-label={`Select ${color.name}`}
            >
              {accentColor === color.hex && (
                <div className="w-3 h-3 bg-white rounded-full" />
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Wallpaper */}
      <section>
        <h3 className="text-xl font-medium text-white mb-4">Background</h3>
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
             {Object.entries(wallpapers).map(([name, src]) => (
               <button
                 key={name}
                 onClick={() => setWallpaper(name)}
                 className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all ${
                    wallpaper === name ? 'border-ub-orange scale-105 shadow-lg' : 'border-transparent hover:border-gray-500'
                 }`}
               >
                 <img
                   src={src}
                   alt={name}
                   className="w-full h-full object-cover"
                   loading="lazy"
                 />
                 {wallpaper === name && (
                   <div className="absolute inset-0 bg-ub-orange bg-opacity-20 flex items-center justify-center">
                     <div className="bg-ub-orange rounded-full p-1">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                     </div>
                   </div>
                 )}
               </button>
             ))}
           </div>
        </div>
      </section>
    </div>
  );

  const renderSound = () => (
    <div className="space-y-8 animate-fade-in">
      <section>
        <h3 className="text-xl font-medium text-white mb-4">Sound</h3>
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 space-y-6">
          <div>
            <div className="flex justify-between mb-2">
                <label className="text-gray-300">System Volume</label>
                <span className="text-gray-400">{volume}%</span>
            </div>
            <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-ub-orange"
            />
          </div>
          <p className="text-sm text-gray-500">Note: This is a simulation and won't affect your actual system volume.</p>
        </div>
      </section>
    </div>
  );

  const renderDisplay = () => (
    <div className="space-y-8 animate-fade-in">
      <section>
        <h3 className="text-xl font-medium text-white mb-4">Display</h3>
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 space-y-6">
          <div>
            <div className="flex justify-between mb-2">
                <label className="text-gray-300">Brightness</label>
                <span className="text-gray-400">{brightness}%</span>
            </div>
            <input
                type="range"
                min="10"
                max="100"
                value={brightness}
                onChange={(e) => setBrightness(Number(e.target.value))}
                className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-ub-orange"
            />
          </div>
          <p className="text-sm text-gray-500">Note: This visually dims the desktop container.</p>
        </div>
      </section>
    </div>
  );

  return (
    <div className="h-full w-full bg-ub-cool-grey text-white flex select-none windowMainScreen">
      {renderSidebar()}
      <div className="flex-1 h-full overflow-y-auto p-8">
        {activeTab === 'appearance' && renderAppearance()}
        {activeTab === 'sound' && renderSound()}
        {activeTab === 'display' && renderDisplay()}
      </div>
    </div>
  );
}
