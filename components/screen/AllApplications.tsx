import React, { useState, useEffect, useMemo } from 'react';
import UbuntuApp from '../base/UbuntuApp';
import { AppManifest } from '../apps/registry';
import { getIconPath } from '@/lib/utils/icons';

interface AllApplicationsProps {
    apps: AppManifest[];
    openApp: (id: string) => void;
}

export default function AllApplications({ apps, openApp }: AllApplicationsProps) {
    const [query, setQuery] = useState("");
    const [category, setCategory] = useState<0 | 1>(0); // 0: All, 1: Frequent
    const [frequentApps, setFrequentApps] = useState<AppManifest[]>([]);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const stored = localStorage.getItem("frequentApps");
            if (stored) {
                try {
                    const frequentIds: { id: string }[] = JSON.parse(stored);
                    const loadedFrequent = frequentIds
                        .map(item => apps.find(app => app.id === item.id))
                        .filter((app): app is AppManifest => !!app);
                    setFrequentApps(loadedFrequent);
                } catch (e) {
                    console.error("Failed to parse frequentApps", e);
                }
            }
        }
    }, [apps]);

    const handleSwitch = (cat: 0 | 1) => {
        setCategory(cat);
    };

    const displayedApps = useMemo(() => {
        let source = category === 0 ? apps : frequentApps;
        if (query) {
            source = apps.filter(app => app.name.toLowerCase().includes(query.toLowerCase()));
        }
        return source;
    }, [apps, frequentApps, category, query]);

    return (
        <div
            className="absolute top-[37px] left-[56px] w-[calc(100%-56px)] h-[calc(100%-37px)] z-40 bg-black bg-opacity-80 backdrop-blur-md flex flex-col items-center justify-start pt-20"
            onClick={(e) => e.stopPropagation()}
        >
            {/* Search Bar */}
            <div className="w-1/3 min-w-[300px] mb-10">
                <div className="flex items-center bg-ub-cool-grey border border-ub-grey rounded-full px-4 py-2 shadow-lg">
                    <img src="/images/logos/search.png" alt="search" className="w-5 h-5 opacity-70" />
                    <input
                        className="bg-transparent border-none text-white ml-3 w-full focus:outline-none placeholder-gray-400"
                        placeholder="Type to search..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        autoFocus
                    />
                </div>
            </div>

            {/* App Grid */}
            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-8 px-10 overflow-y-auto max-h-[60vh] w-full max-w-5xl justify-items-center">
                {displayedApps.map(app => (
                    <UbuntuApp
                        key={app.id}
                        id={app.id}
                        name={app.name}
                        icon={getIconPath(app.icon)}
                        openApp={() => openApp(app.id)}
                        selected={false} // Apps in menu are not selected
                    />
                ))}
            </div>

            {/* Footer Tabs */}
            <div className="absolute bottom-0 w-full flex justify-center pb-8 bg-gradient-to-t from-black to-transparent">
                <div className="flex space-x-8 text-white">
                    <button
                        className={`px-4 py-2 border-b-2 transition-colors ${category === 1 ? 'border-ub-orange text-white' : 'border-transparent text-gray-400 hover:text-white'}`}
                        onClick={() => handleSwitch(1)}
                    >
                        Frequent
                    </button>
                    <button
                        className={`px-4 py-2 border-b-2 transition-colors ${category === 0 ? 'border-ub-orange text-white' : 'border-transparent text-gray-400 hover:text-white'}`}
                        onClick={() => handleSwitch(0)}
                    >
                        All
                    </button>
                </div>
            </div>
        </div>
    );
}
