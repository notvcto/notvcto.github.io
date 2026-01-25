'use client';

import data from './data.json';

interface Project {
  name: string;
  description: string[];
  link: string;
  languages: string[];
  topics: string[];
}

export const Projects = () => {
  return (
    <div className="h-full bg-surface-light dark:bg-surface-dark flex flex-col text-text-dark">
      <div className="flex-1 p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(data as Project[]).map((project, i) => (
          <a
            key={i}
            href={project.link}
            target="_blank"
            rel="noreferrer"
            className="block p-4 bg-surface-dark border border-white/10 rounded-lg hover:border-primary/50 hover:bg-white/5 transition-all group"
          >
            <div className="flex items-center gap-2 mb-2">
                <span className="material-icons-round text-blue-accent group-hover:text-primary transition-colors">folder</span>
                <span className="font-bold truncate">{project.name}</span>
            </div>
            <p className="text-sm text-subtext-dark mb-4 line-clamp-2">
                {project.description[0]}
            </p>
            <div className="flex gap-2 flex-wrap">
                {project.languages.map(lang => (
                    <span key={lang} className="text-xs px-2 py-1 rounded bg-white/10 text-white/70">
                        {lang}
                    </span>
                ))}
            </div>
          </a>
        ))}
      </div>
      <div className="h-8 bg-[#1e1e2e] border-t border-white/5 flex items-center px-4 text-xs text-subtext-dark">
        {data.length} projects found
      </div>
    </div>
  );
};
