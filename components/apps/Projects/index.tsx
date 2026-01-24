const projects = [
  { name: 'portfolio-v2', icon: 'folder', color: 'text-blue-accent' },
  { name: 'arch-rice', icon: 'folder', color: 'text-blue-accent' },
  { name: 'react-os', icon: 'terminal', color: 'text-green-accent' },
  { name: 'thesis.pdf', icon: 'picture_as_pdf', color: 'text-red-accent' },
  { name: 'notes.txt', icon: 'description', color: 'text-subtext-dark' },
];

export const Projects = () => {
  return (
    <div className="h-full bg-surface-light dark:bg-surface-dark flex flex-col">
      {/* Toolbar */}
      <div className="h-10 bg-[#1e1e2e] border-b border-white/5 flex items-center px-4 gap-4 text-subtext-dark shrink-0">
        <div className="flex gap-2">
          <span className="material-icons-round text-lg hover:text-text-dark cursor-pointer">arrow_back</span>
          <span className="material-icons-round text-lg hover:text-text-dark cursor-pointer">arrow_forward</span>
          <span className="material-icons-round text-lg hover:text-text-dark cursor-pointer">arrow_upward</span>
        </div>
        <div className="flex-1 bg-[#11111b] rounded h-6 px-2 flex items-center text-xs font-mono border border-white/5">
          <span className="text-subtext-dark">/home/user/projects/</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
          {projects.map((project, i) => (
            <div key={i} className="flex flex-col items-center gap-1 group cursor-pointer p-2 rounded hover:bg-white/5 transition-colors">
              <span className={`material-icons-round text-4xl ${project.color} group-hover:scale-105 transition-transform`}>
                {project.icon}
              </span>
              <span className="text-xs text-text-dark text-center group-hover:text-primary transition-colors">
                {project.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Status Bar */}
      <div className="h-6 bg-[#11111b] border-t border-white/5 flex items-center px-3 justify-between text-[10px] text-subtext-dark font-mono shrink-0">
        <span>{projects.length} items</span>
        <span>Free space: 42 GB</span>
      </div>
    </div>
  );
};
