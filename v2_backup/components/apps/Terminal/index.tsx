'use client';

import { useState, useRef, useEffect } from 'react';

// File System Simulation (Ported from v1)
const fileSystem = {
  root: [
    "books",
    "projects",
    "personal-documents",
    "skills",
    "languages",
    "interests",
    ".sudo-pass",
    ".hidden",
  ],
  books: [
    "Eric-Jorgenson_The-Almanack-of-Naval-Ravikant.pdf",
    "Elon Musk: How the Billionaire CEO of SpaceX.pdf",
    "The $100 Startup_CHRIS_GUILLEBEAU.pdf",
    "The_Magic_of_Thinking_Big.pdf",
    "sudo_mastery.txt",
  ],
  skills: [
    "Front-end development",
    "React.js",
    "jQuery",
    "Flutter",
    "Express.js",
    "SQL",
    "Firebase",
    "terminal_wisdom.log",
  ],
  projects: [
    "notvcto-personal-portfolio",
    "synonyms-list-react",
    "economist.com-unlocked",
    "Improve-Codeforces",
    "flutter-banking-app",
    "Meditech-Healthcare",
    "CPU-Scheduling-APP-React-Native",
    "deployment.log",
  ],
  interests: [
    "Software Engineering",
    "Deep Learning",
    "Computer Vision",
    "hacking_ethics.md",
  ],
  languages: ["Javascript", "C++", "Java", "Dart", "assembly_notes.txt"],
};

const fileContents: Record<string, string> = {
  ".sudo-pass": "The password is hidden in the books...",
  ".hidden": "Try: cat books/sudo_mastery.txt",
  "sudo_mastery.txt": "Remember: With great power comes great responsibility.\nThe key is: 'matrix'",
  "terminal_wisdom.log": "Hint: The sudo password might be something from a famous movie...",
  "deployment.log": "Last deployment used sudo with password: m****x",
  "hacking_ethics.md": "# Ethical Hacking\nAlways remember: sudo responsibly.\nFamous quote: 'There is no spoon' - The Matrix",
  "assembly_notes.txt": "Low-level programming requires sudo access.\nMatrix operations are fundamental.",
};

const fortunes = [
  "The best way to predict the future is to invent it. - Alan Kay",
  "Code never lies, comments sometimes do. - Ron Jeffries",
  "Simplicity is the ultimate sophistication. - Leonardo da Vinci",
  "First, solve the problem. Then, write the code. - John Johnson",
  "Experience is the name everyone gives to their mistakes. - Oscar Wilde",
];

interface HistoryItem {
  type: 'command' | 'output';
  content: React.ReactNode;
}

export const Terminal = () => {
  const [history, setHistory] = useState<HistoryItem[]>([
    { type: 'output', content: 'Welcome to Ubuntu 22.04.2 LTS (GNU/Linux 5.15.0-76-generic x86_64)' },
    { type: 'output', content: "Type 'help' for commands." },
  ]);
  const [input, setInput] = useState('');
  const [currentDir, setCurrentDir] = useState('~'); // Visual path
  const [currentDirName, setCurrentDirName] = useState('root'); // Logical pointer key in fileSystem
  const [sudoUnlocked, setSudoUnlocked] = useState(false);
  const [passwordMode, setPasswordMode] = useState(false);
  const [pendingSudoArgs, setPendingSudoArgs] = useState<string[] | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  // Command Handlers (Ported logic)

  const handleSudoCommand = (args: string[]) => {
    if (!sudoUnlocked) {
      setHistory(prev => [...prev, {
        type: 'output',
        content: (
          <div className="text-yellow-400">
            [sudo] password for vcto: <span className="text-gray-400">(explore the filesystem for clues...)</span><br/>
            <div className="text-gray-400 text-sm">
              💡 Try exploring with 'ls', 'cat', and 'cd' to find hidden files...<br/>
              🔍 Look for files that might contain passwords or hints!
            </div>
          </div>
        )
      }]);
      setPasswordMode(true);
      setPendingSudoArgs(args);
      return;
    }

    const command = args[0];
    let result: React.ReactNode = "";

    switch (command) {
      case "nuke":
      case "rm":
        if (args.includes("-rf") && args.includes("/")) {
          result = (
            <div className="text-red-500 animate-pulse">
              🚨 SYSTEM MELTDOWN INITIATED 🚨<br/>
              Deleting all files...<br/>
              <span className="text-green-400">████████████████████████████████</span> 100%<br/>
              System will reboot in 3 seconds...
            </div>
          );
          setTimeout(() => setHistory([]), 3000); // Fake reboot
        } else {
          result = "Usage: sudo rm -rf /";
        }
        break;
      case "hack":
        if (args[1] === "the-mainframe") {
          result = (
            <div className="text-green-400 font-mono">
              <div className="animate-pulse">Accessing mainframe...</div>
              <div className="text-green-300">
                01001000 01100001 01100011 01101011 01101001 01101110 01100111<br/>
                ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓<br/>
                ACCESS GRANTED<br/>
                Welcome to the Matrix, Neo... 😎<br/>
                Just kidding! This is just a portfolio site.
              </div>
            </div>
          );
        } else {
          result = "Usage: sudo hack the-mainframe";
        }
        break;
      case "rickroll":
        result = (
          <div className="text-red-400">
            🎵 Never gonna give you up, never gonna let you down... 🎵<br/>
            <a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ" target="_blank" rel="noreferrer" className="text-blue-400 underline">
              Click here for the full experience 😈
            </a>
          </div>
        );
        break;
      default:
        result = `sudo: ${command}: command not found`;
    }

    setHistory(prev => [...prev, { type: 'output', content: result }]);
  };

  const executeCommand = (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    // Echo command
    setHistory(prev => [...prev, { type: 'command', content: trimmed }]);

    // Password Mode
    if (passwordMode) {
        setPasswordMode(false);
        if (trimmed.toLowerCase() === 'matrix') {
            setSudoUnlocked(true);
            setHistory(prev => [...prev, { type: 'output', content: <div className="text-green-400">🎉 Sudo access granted!</div> }]);
            if (pendingSudoArgs) {
                handleSudoCommand(pendingSudoArgs);
                setPendingSudoArgs(null);
            }
        } else {
            setHistory(prev => [...prev, { type: 'output', content: <div className="text-red-400">❌ Sorry, try again. Hint: famous sci-fi movie...</div> }]);
            setPendingSudoArgs(null);
        }
        setInput('');
        return;
    }

    const parts = trimmed.split(' ').filter(Boolean);
    const main = parts[0];
    const args = parts.slice(1);
    const rest = args.join(' ');

    let result: React.ReactNode = "";

    switch (main) {
      case 'help':
        result = (
          <div className="text-cyan-400">
            📚 Available commands:<br/><br/>
            <span className="text-white">Navigation:</span> cd, ls, pwd, cat<br/>
            <span className="text-white">System:</span> clear, exit, mkdir, echo<br/>
            <span className="text-white">Fun:</span> sudo {sudoUnlocked ? '✅' : '🔒'}, fortune, say
          </div>
        );
        break;

      case 'sudo':
        handleSudoCommand(args);
        setInput(''); // Return early as handleSudo pushes output
        return;

      case 'ls': {
        const target = currentDirName; // Simplified for now, ignores args like ../
        // v1 logic: "rest" (args) checking
        // If rest is empty -> list current
        const showHidden = rest.includes("-la") || rest.includes("-a");
        const list = (fileSystem as any)[target] || [];

        result = (
          <div className="flex flex-wrap gap-2">
            {list.map((f: string) => {
                if (!showHidden && f.startsWith('.')) return null;
                return <span key={f} className={f.includes('.') && !f.startsWith('.') ? "text-text-dark" : "text-blue-accent font-bold"}>{f}</span>
            })}
          </div>
        );
        break;
      }

      case 'cd': {
        if (!rest || rest === "~") {
            setCurrentDir("~");
            setCurrentDirName("root");
        } else if (rest === "..") {
            // Simplified: only one level deep supported in v1 structure really (root -> folder)
            // If current is root, stay. If subfolder, go root.
            setCurrentDir("~");
            setCurrentDirName("root");
        } else {
            // Check if directory exists in current
            const children = (fileSystem as any)[currentDirName];
            if (children && children.includes(rest) && !rest.includes('.')) {
                setCurrentDir(`~/${rest}`);
                setCurrentDirName(rest);
            } else {
                result = `cd: ${rest}: No such file or directory`;
            }
        }
        break;
      }

      case 'cat': {
        const filename = rest;
        // Search in current dir files? Or simplified global lookup like v1 hidden_files?
        // v1 checked hidden_files[filename] directly.
        // Also check if file exists in current dir.
        const fileContent = fileContents[filename];
        if (fileContent) {
            result = <div className="text-green-400 whitespace-pre-wrap">{fileContent}</div>;
        } else {
            result = `cat: ${filename}: No such file or directory`;
        }
        break;
      }

      case 'clear':
        setHistory([]);
        setInput('');
        return;

      case 'fortune':
        result = <div className="text-yellow-400">🔮 {fortunes[Math.floor(Math.random() * fortunes.length)]}</div>;
        break;

      default:
        result = `Command '${main}' not found. Type 'help' for commands.`;
    }

    if (result) {
        setHistory(prev => [...prev, { type: 'output', content: result }]);
    }
    setInput('');
  };

  return (
    <div
      className="h-full bg-[#1e1e2e]/95 p-4 font-mono text-sm overflow-y-auto cursor-text text-text-dark"
      onClick={() => inputRef.current?.focus()}
    >
      {history.map((item, i) => (
        <div key={i} className="mb-1 break-words">
          {item.type === 'command' ? (
            <div>
              <span className="text-green-accent">vcto@ubuntu</span>
              <span className="text-white">:</span>
              <span className="text-blue-accent">{currentDir}</span>
              <span className="text-white">$ </span>
              <span>{item.content}</span>
            </div>
          ) : (
            <div>{item.content}</div>
          )}
        </div>
      ))}

      <div className="flex items-center">
        {passwordMode ? (
            <span className="text-yellow-400 mr-2">[sudo] password:</span>
        ) : (
            <>
                <span className="text-green-accent">vcto@ubuntu</span>
                <span className="text-white">:</span>
                <span className="text-blue-accent">{currentDir}</span>
                <span className="text-white">$ </span>
            </>
        )}
        <input
          ref={inputRef}
          type={passwordMode ? "password" : "text"}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && executeCommand(input)}
          className="bg-transparent border-none outline-none flex-1 ml-2 text-text-dark w-full"
          autoFocus
          spellCheck={false}
          autoComplete="off"
        />
      </div>
      <div ref={bottomRef} />
    </div>
  );
};
