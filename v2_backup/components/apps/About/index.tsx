export const About = () => {
  return (
    <div className="h-full bg-[#1e1e2e] text-white flex flex-col items-center justify-center p-8 text-center">
      <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white/10 mb-6 shadow-2xl">
        <img
            src="https://avatars.githubusercontent.com/u/notvcto?v=4" // Placeholder or dynamic if we knew URL
            alt="Profile"
            className="w-full h-full object-cover"
            onError={(e) => (e.currentTarget.src = 'https://ui-avatars.com/api/?name=V&background=random')}
        />
      </div>
      <h1 className="text-3xl font-bold mb-2">Vivek</h1>
      <h2 className="text-xl text-primary mb-6">Software Engineer</h2>
      <p className="max-w-md text-subtext-dark mb-8 leading-relaxed">
        Passionate about building scalable web applications and exploring new technologies.
        This portfolio is a reflection of my love for Linux and clean UI.
      </p>

      <div className="flex gap-4">
        <a href="https://github.com/notvcto" target="_blank" className="p-2 bg-white/5 rounded-full hover:bg-white/10 hover:text-primary transition-colors">
            <span className="material-icons-round">code</span>
        </a>
        <a href="mailto:contact@vcto.io" className="p-2 bg-white/5 rounded-full hover:bg-white/10 hover:text-green-accent transition-colors">
            <span className="material-icons-round">email</span>
        </a>
      </div>
    </div>
  );
};
