export const About = () => {
  return (
    <div className="h-full bg-surface-light dark:bg-surface-dark p-6 overflow-y-auto text-text-light dark:text-text-dark">
      <h1 className="text-2xl font-bold mb-4 text-primary">About Me</h1>
      <div className="prose dark:prose-invert max-w-none">
        <p className="mb-4">
          Hi, I'm a software engineer passionate about building beautiful, functional, and performant web applications.
        </p>
        <p className="mb-4">
          This portfolio is designed to mimic a Linux desktop environment (specifically an Arch Linux "rice").
          It is built with <strong>Next.js 13+ (App Router)</strong>, <strong>TypeScript</strong>, and <strong>Tailwind CSS</strong>.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2 text-secondary">Tech Stack</h2>
        <ul className="list-disc list-inside space-y-1 ml-2 text-subtext-dark">
          <li>React / Next.js</li>
          <li>TypeScript</li>
          <li>Tailwind CSS</li>
          <li>Zustand (State Management)</li>
        </ul>
      </div>
    </div>
  );
};
