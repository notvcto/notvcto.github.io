import { useState } from 'react';

export const Firefox = () => {
  const [url, setUrl] = useState('https://google.com/search?igu=1'); // Default to google embeddable
  // Note: Most sites block iframe. Using a custom start page or just placeholder.
  // v1 used a custom 'home' page.

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="h-9 flex items-center gap-2 px-2 bg-[#f9f9fa] border-b border-[#e0e0e2]">
        <div className="flex gap-1">
            <span className="material-icons-round text-sm text-gray-400">arrow_back</span>
            <span className="material-icons-round text-sm text-gray-400">arrow_forward</span>
            <span className="material-icons-round text-sm text-gray-400">refresh</span>
        </div>
        <div className="flex-1 bg-white border border-[#e0e0e2] rounded-md h-7 flex items-center px-3 text-xs text-gray-700 shadow-sm">
            <span className="material-icons-round text-xs mr-2 text-gray-400">lock</span>
            google.com
        </div>
      </div>
      <iframe
        src={url}
        frameBorder="0"
        className="flex-1 w-full bg-white"
        title="Firefox"
      />
    </div>
  );
};
