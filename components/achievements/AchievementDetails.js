import React from 'react';

const AchievementDetails = ({ achievement, onBack }) => {
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="h-full w-full bg-ub-cool-grey text-white overflow-y-auto windowMainScreen">
      <div className="p-6">
        {/* Back button */}
        <button
          onClick={onBack}
          className="mb-6 flex items-center text-ubt-blue hover:text-white transition-colors"
        >
          <span className="mr-2">←</span>
          Back to Achievements
        </button>

        {/* Header */}
        <header className="mb-8 pb-6 border-b border-gray-700">
          <div className="flex items-start justify-between">
            <h1 className="text-3xl font-bold text-white mb-4">{achievement.title}</h1>
            <div className="bg-gray-700 p-2 rounded-lg border border-gray-600">
                <img
                    src={`./themes/MoreWaita/status/${achievement.icon || 'award'}.svg`}
                    alt="icon"
                    className="w-10 h-10"
                />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300 mb-4 bg-gray-800 p-4 rounded-lg bg-opacity-40 border border-gray-700">
            <div className="flex items-center">
              <span className="text-gray-400 w-24">Issuer:</span>
              <span className="font-medium text-white">{achievement.issuer}</span>
            </div>
            <div className="flex items-center">
              <span className="text-gray-400 w-24">Date:</span>
              <span className="font-medium text-white">{formatDate(achievement.date)}</span>
            </div>
            <div className="flex items-center">
              <span className="text-gray-400 w-24">Type:</span>
              <span className="bg-ub-orange bg-opacity-80 text-white px-2 py-0.5 rounded text-xs">{achievement.type}</span>
            </div>
            {achievement.score && (
                <div className="flex items-center">
                <span className="text-gray-400 w-24">Score:</span>
                <span className="font-medium text-green-400">{achievement.score}</span>
                </div>
            )}
          </div>
        </header>

        {/* Content */}
        <article
          className="markdown-content text-gray-300 leading-relaxed"
           style={{
            '--heading-color': '#ffffff',
            '--text-color': '#d1d5db',
            '--link-color': '#3465A4',
            '--code-color': '#F39A21',
            '--code-bg': '#201f1f',
            '--border-color': '#374151'
          }}
          dangerouslySetInnerHTML={{ __html: achievement.contentHtml }}
        />
      </div>
    </div>
  );
};

export default AchievementDetails;
