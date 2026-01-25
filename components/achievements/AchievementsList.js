import React, { useState, useMemo } from 'react';

const AchievementsList = ({ achievements, onSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIssuer, setSelectedIssuer] = useState('All');
  const [selectedType, setSelectedType] = useState('All');

  const issuers = useMemo(() => {
    const allIssuers = achievements.map(a => a.issuer).filter(Boolean);
    return ['All', ...new Set(allIssuers)];
  }, [achievements]);

  const types = useMemo(() => {
    const allTypes = achievements.map(a => a.type).filter(Boolean);
    return ['All', ...new Set(allTypes)];
  }, [achievements]);

  const filteredAchievements = useMemo(() => {
    return achievements
      .filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              item.issuer?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesIssuer = selectedIssuer === 'All' || item.issuer === selectedIssuer;
        const matchesType = selectedType === 'All' || item.type === selectedType;
        return matchesSearch && matchesIssuer && matchesType;
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [achievements, searchQuery, selectedIssuer, selectedType]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="h-full w-full bg-ub-cool-grey text-white overflow-hidden flex flex-col windowMainScreen">
      {/* Toolbar */}
      <div className="bg-gray-800 p-4 border-b border-gray-700 flex flex-wrap gap-4 items-center justify-between shrink-0">
        <h2 className="text-xl font-bold flex items-center">
             <img src="./themes/MoreWaita/apps/achievements.svg" alt="App Icon" className="w-6 h-6 mr-2" />
             Achievements
        </h2>

        <div className="flex flex-wrap gap-2 items-center">
            {/* Search */}
            <input
                type="text"
                placeholder="Search..."
                className="bg-gray-700 border border-gray-600 rounded px-3 py-1 text-sm text-white focus:outline-none focus:border-ub-orange"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />

            {/* Issuer Filter */}
            <select
                className="bg-gray-700 border border-gray-600 rounded px-3 py-1 text-sm text-white focus:outline-none focus:border-ub-orange max-w-[150px]"
                value={selectedIssuer}
                onChange={(e) => setSelectedIssuer(e.target.value)}
            >
                {issuers.map(issuer => <option key={issuer} value={issuer}>{issuer}</option>)}
            </select>

            {/* Type Filter */}
             <select
                className="bg-gray-700 border border-gray-600 rounded px-3 py-1 text-sm text-white focus:outline-none focus:border-ub-orange max-w-[150px]"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
            >
                {types.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {filteredAchievements.length === 0 ? (
            <div className="text-center text-gray-400 mt-10">
                <p>No achievements found matching your criteria.</p>
            </div>
        ) : (
            filteredAchievements.map(item => (
                <div
                    key={item.id}
                    onClick={() => onSelect(item.id)}
                    className="bg-gray-800 bg-opacity-50 border border-gray-700 hover:border-ub-orange hover:bg-opacity-70 rounded-lg p-4 cursor-pointer transition-all flex items-start gap-4 group"
                >
                    <div className="bg-gray-700 p-3 rounded-lg shrink-0 border border-gray-600">
                        <img src={`./themes/MoreWaita/status/${item.icon || 'award'}.svg`} alt="" className="w-8 h-8" />
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                            <h3 className="text-lg font-bold text-gray-200 group-hover:text-ub-orange truncate pr-4">{item.title}</h3>
                            <span className="text-xs text-gray-400 whitespace-nowrap">{formatDate(item.date)}</span>
                        </div>
                        <p className="text-sm text-gray-400 mb-2 truncate">{item.issuer}</p>

                        <div className="flex gap-2">
                             <span className="text-xs bg-gray-700 px-2 py-0.5 rounded text-gray-300">{item.type}</span>
                             {item.score && <span className="text-xs bg-green-900 bg-opacity-50 text-green-300 px-2 py-0.5 rounded">Score: {item.score}</span>}
                        </div>
                    </div>
                </div>
            ))
        )}
      </div>
    </div>
  );
};

export default AchievementsList;
