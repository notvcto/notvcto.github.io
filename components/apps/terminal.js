import React, { Component } from "react";
import $ from "jquery";
import ReactGA from "react-ga4";

export class Terminal extends Component {
  constructor() {
    super();
    this.terminal_rows = 1;
    this.current_directory = "~";
    this.curr_dir_name = "root";
    this.prev_commands = [];
    this.commands_index = -1;
    this.sudo_unlocked = false;
    this.password_mode = false;
    this.pending_sudo_command = null;
    this.child_directories = {
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
    this.hidden_files = {
      ".sudo-pass": "The password is hidden in the books...",
      ".hidden": "Try: cat books/sudo_mastery.txt",
      "sudo_mastery.txt":
        "Remember: With great power comes great responsibility.\nThe key is: 'matrix'",
      "terminal_wisdom.log":
        "Hint: The sudo password might be something from a famous movie...",
      "deployment.log": "Last deployment used sudo with password: m****x",
      "hacking_ethics.md":
        "# Ethical Hacking\nAlways remember: sudo responsibly.\nFamous quote: 'There is no spoon' - The Matrix",
      "assembly_notes.txt":
        "Low-level programming requires sudo access.\nMatrix operations are fundamental.",
    };
    this.state = {
      terminal: [],
      isClient: false,
    };
  }

  componentDidMount() {
    this.setState({ isClient: true }, () => {
      this.loadSudoState();
      this.reStartTerminal();
    });
  }

  componentDidUpdate() {
    if (this.state.isClient) {
      this.focusInput();
    }
  }

  componentWillUnmount() {}

  loadSudoState = () => {
    if (typeof window !== "undefined") {
      const sudoState = localStorage.getItem("sudo-unlocked");
      this.sudo_unlocked = sudoState === "true";
    }
  };

  saveSudoState = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("sudo-unlocked", this.sudo_unlocked.toString());
    }
  };

  reStartTerminal = () => {
    this.setState({ terminal: [] }, () => {
      this.terminal_rows = 1;
      this.appendTerminalRow();
    });
  };

  appendTerminalRow = () => {
    const terminal = [...this.state.terminal];
    terminal.push(this.terminalRow(this.terminal_rows));
    this.setState({ terminal });
    this.terminal_rows += 2;
  };

  terminalRow = (id) => (
    <React.Fragment key={id}>
      <div className="flex w-full h-5">
        <div className="flex">
          {this.password_mode ? (
            <div className="text-yellow-400">[sudo] password for vcto:</div>
          ) : (
            <>
              <div className="text-ubt-green">vcto@ubuntu</div>
              <div className="text-white mx-px font-medium">:</div>
              <div className="text-ubt-blue">{this.current_directory}</div>
              <div className="text-white mx-px font-medium mr-1">$</div>
            </>
          )}
        </div>
        <div
          id="cmd"
          onClick={this.focusInput}
          className="bg-transparent relative flex-1 overflow-hidden input-box"
        >
          <span
            id={`show-${id}`}
            className="float-left whitespace-pre pb-1 opacity-100 font-normal tracking-wider"
          ></span>
          <div
            id={`cursor-${id}`}
            className="float-left mt-1 w-1.5 h-3.5 bg-white blinking-cursor"
          ></div>
          <input
            id={`terminal-input-${id}`}
            data-row-id={id}
            type={this.password_mode ? "password" : "text"}
            onKeyDown={this.checkKey}
            className="absolute top-0 left-0 w-full opacity-0 outline-none bg-transparent"
            spellCheck={false}
            autoComplete="off"
            onInput={(e) =>
              ($(`#cmd span#show-${id}`).text(e.target.value))
            }
          />
        </div>
      </div>
      <div id={`row-result-${id}`} className="my-2 font-normal"></div>
    </React.Fragment>
  );

  focusInput = () => {
    const input = $(`input#terminal-input-${this.terminal_rows - 2}`);
    input.trigger("focus");
  };

  removeCursor = (id) => {
    $(`#cursor-${id}`).css({ display: "none" });
  };

  clearInput = (id) => {
    $(`input#terminal-input-${id}`).trigger("blur");
  };

  checkKey = (e) => {
    const terminal_row_id = $(e.target).data("row-id");

    if (e.key === "Enter") {
      const command = $(`input#terminal-input-${terminal_row_id}`).val().trim();
      if (!command) return;

      this.removeCursor(terminal_row_id);

      if (this.password_mode) {
        // Handle password input
        this.handlePasswordInput(command, terminal_row_id);
      } else {
        // Handle normal commands
        this.handleCommands(command, terminal_row_id);
      }

      this.prev_commands.push(command);
      this.commands_index = this.prev_commands.length;

      this.clearInput(terminal_row_id);
    } else if (e.key === "ArrowUp") {
      if (this.commands_index > 0) this.commands_index--;
      const prev_command = this.prev_commands[this.commands_index] || "";
      $(`input#terminal-input-${terminal_row_id}`).val(prev_command);
      $(`#show-${terminal_row_id}`).text(prev_command);
    } else if (e.key === "ArrowDown") {
      if (this.commands_index < this.prev_commands.length - 1)
        this.commands_index++;
      const prev_command = this.prev_commands[this.commands_index] || "";
      $(`input#terminal-input-${terminal_row_id}`).val(prev_command);
      $(`#show-${terminal_row_id}`).text(prev_command);
    }
  };

  childDirectories = (parent) => {
    const dirs = this.child_directories[parent] || [];
    return [
      `<div class="flex justify-start flex-wrap">`,
      ...dirs.map(
        (file) => `<span class="font-bold mr-2 text-ubt-blue">'${file}'</span>`
      ),
      `</div>`,
    ];
  };

  closeTerminal = () => {
    $("#close-terminal").trigger("click");
  };

  handlePasswordInput = (password, rowId) => {
    this.password_mode = false;

    if (password.toLowerCase() === "matrix") {
      this.sudo_unlocked = true;
      this.saveSudoState();

      const result = `<div class="text-green-400">
        🎉 Sudo access granted! Welcome to the Matrix, Neo.<br/>
        You now have elevated privileges.
      </div>`;

      document.getElementById(`row-result-${rowId}`).innerHTML = result;
      this.appendTerminalRow();

      // Now execute the original sudo command
      if (this.pending_sudo_command) {
        setTimeout(() => {
          const newRowId = this.terminal_rows - 2;
          const sudoResult = this.handleSudoCommand(
            this.pending_sudo_command,
            newRowId
          );
          document.getElementById(`row-result-${newRowId}`).innerHTML =
            sudoResult;
          this.appendTerminalRow();
          this.pending_sudo_command = null;
        }, 1000);
      }
    } else {
      const result = `<div class="text-red-400">
        ❌ Sorry, try again.<br/>
        <span class="text-gray-400">Hint: The answer might be in a famous sci-fi movie... 🕶️</span>
      </div>`;
      document.getElementById(`row-result-${rowId}`).innerHTML = result;
      this.appendTerminalRow();
      this.pending_sudo_command = null;
    }
  };

  handleSudoCommand = (args, rowId) => {
    if (!this.sudo_unlocked) {
      this.promptSudoPassword(args, rowId);
      return;
    }

    const command = args.join(" ");
    let result = "";

    switch (args[0]) {
      case "nuke":
      case "rm":
        if (args.includes("-rf") && args.includes("/")) {
          result = `<div class="text-red-500 animate-pulse">
            🚨 SYSTEM MELTDOWN INITIATED 🚨<br/>
            Deleting all files...<br/>
            <span class="text-green-400">████████████████████████████████</span> 100%<br/>
            System will reboot in 3 seconds...
          </div>`;
          setTimeout(() => {
            this.reStartTerminal();
          }, 3000);
        } else {
          result = "Usage: sudo rm -rf /";
        }
        break;

      case "vim":
        if (args[1] === "~/life.lessons") {
          result = `<div class="text-green-400">
            📝 Life Lessons from ~/vcto<br/><br/>
            "Code is poetry written in logic."<br/>
            "Every bug is a lesson in disguise."<br/>
            "The best debugger is a good night's sleep."<br/>
            "Simplicity is the ultimate sophistication."<br/>
            "First, solve the problem. Then, write the code."<br/><br/>
            <span class="text-gray-400">:q to quit vim (just kidding, this isn't real vim 😄)</span>
          </div>`;
        } else {
          result = `vim: ${args[1] || "filename"}: No such file or directory`;
        }
        break;

      case "hack":
        if (args[1] === "the-mainframe") {
          result = `<div class="text-green-400 font-mono">
            <div class="animate-pulse">Accessing mainframe...</div>
            <div class="text-green-300">
              01001000 01100001 01100011 01101011 01101001 01101110 01100111<br/>
              ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓<br/>
              ACCESS GRANTED<br/>
              Welcome to the Matrix, Neo... 😎<br/>
              Just kidding! This is just a portfolio site.
            </div>
          </div>`;
        } else {
          result = "Usage: sudo hack the-mainframe";
        }
        break;

      case "deploy":
        result = `<div class="text-blue-400">
          🚀 Deploying vcto's portfolio...<br/>
          <span class="text-green-400">✓</span> Building React components<br/>
          <span class="text-green-400">✓</span> Optimizing assets<br/>
          <span class="text-green-400">✓</span> Running tests<br/>
          <span class="text-green-400">✓</span> Deploying to production<br/><br/>
          🎉 Deployment successful! Site is live at notvcto.github.io
        </div>`;
        break;

      case "rickroll":
        result = `<div class="text-red-400">
          🎵 Never gonna give you up, never gonna let you down... 🎵<br/>
          <a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ" target="_blank" class="text-blue-400 underline">
            Click here for the full experience 😈
          </a>
        </div>`;
        break;

      default:
        result = `sudo: ${command}: command not found<br/>
        Available sudo commands: nuke, vim ~/life.lessons, hack the-mainframe, deploy, rickroll`;
    }

    document.getElementById(`row-result-${rowId}`).innerHTML = result;
    this.appendTerminalRow();
  };

  promptSudoPassword = (args, rowId) => {
    this.password_mode = true;
    this.pending_sudo_command = args;

    const result = `<div class="text-yellow-400">
      [sudo] password for vcto: <span class="text-gray-400">(explore the filesystem for clues...)</span><br/>
      <div class="text-gray-400 text-sm">
        💡 Try exploring with 'ls', 'cat', and 'cd' to find hidden files...<br/>
        🔍 Look for files that might contain passwords or hints!
      </div>
    </div>`;

    document.getElementById(`row-result-${rowId}`).innerHTML = result;
    this.appendTerminalRow();
  };

  handleCommands = (command, rowId) => {
    const words = command.split(" ").filter(Boolean);
    const main = words.shift();
    const rest = words.join(" ").trim();
    let result = "";

    switch (main) {
      case "help": {
        result = `<div class="text-cyan-400">
          📚 Available commands:<br/><br/>
          <span class="text-white">Navigation:</span><br/>
          • cd [directory] - change directory<br/>
          • ls [directory] - list files<br/>
          • pwd - show current directory<br/>
          • cat [file] - display file contents<br/><br/>
          <span class="text-white">System:</span><br/>
          • clear - clear terminal<br/>
          • exit - close terminal<br/>
          • mkdir [name] - create folder<br/>
          • echo [text] - display text<br/><br/>
          <span class="text-white">Apps:</span><br/>
          • code, spotify, chrome, about-vcto, settings, etc.<br/><br/>
          <span class="text-white">Fun:</span><br/>
          • sudo [command] - elevated privileges ${
            this.sudo_unlocked ? "✅" : "🔒"
          }<br/>
          • fortune - random wisdom<br/>
          • say [text] - text-to-speech effect<br/><br/>
          <span class="text-gray-400">💡 Tip: Try exploring hidden files with 'ls -la' or 'cat .[filename]'</span>
        </div>`;
        break;
      }

      case "sudo": {
        this.handleSudoCommand(words, rowId);
        return;
        break;
      }

      case "ls": {
        const target = rest || this.curr_dir_name;
        const showHidden = rest.includes("-la") || rest.includes("-a");

        if (this.child_directories.hasOwnProperty(target)) {
          let files = [...this.child_directories[target]];
          if (!showHidden) {
            files = files.filter((file) => !file.startsWith("."));
          }
          result = [
            `<div class="flex justify-start flex-wrap">`,
            ...files.map((file) => {
              const isHidden = file.startsWith(".");
              const color = isHidden ? "text-gray-500" : "text-ubt-blue";
              return `<span class="font-bold mr-2 ${color}">'${file}'</span>`;
            }),
            `</div>`,
          ].join("");
        } else if (target === "personal-documents") {
          result = "Permission denied 😏";
        } else {
          result = `ls: cannot access '${rest}': No such file or directory`;
        }
        break;
      }

      case "cat": {
        const filename = rest;
        if (this.hidden_files[filename]) {
          result = `<div class="text-green-400">${this.hidden_files[filename]}</div>`;
        } else if (filename === "personal-documents") {
          result = "cat: personal-documents: Permission denied 😏";
        } else if (filename.includes("/")) {
          const parts = filename.split("/");
          const file = parts[parts.length - 1];
          if (this.hidden_files[file]) {
            result = `<div class="text-green-400">${this.hidden_files[file]}</div>`;
          } else {
            result = `cat: ${filename}: No such file or directory`;
          }
        } else {
          result = `cat: ${filename}: No such file or directory`;
        }
        break;
      }

      case "fortune": {
        const fortunes = [
          "The best way to predict the future is to invent it. - Alan Kay",
          "Code never lies, comments sometimes do. - Ron Jeffries",
          "Simplicity is the ultimate sophistication. - Leonardo da Vinci",
          "First, solve the problem. Then, write the code. - John Johnson",
          "Experience is the name everyone gives to their mistakes. - Oscar Wilde",
        ];
        result = `<div class="text-yellow-400">🔮 ${
          fortunes[Math.floor(Math.random() * fortunes.length)]
        }</div>`;
        break;
      }

      case "say": {
        if (rest) {
          result = `<div class="text-purple-400">🗣️ "${rest}"</div>`;
          // Add typing effect
          setTimeout(() => {
            const element = document.getElementById(`row-result-${rowId}`);
            if (element) {
              element.innerHTML = `<div class="text-purple-400">🗣️ <span class="animate-pulse">"${rest}"</span></div>`;
            }
          }, 500);
        } else {
          result = "Usage: say [text]";
        }
        break;
      }

      case "cd": {
        if (!rest) {
          this.current_directory = "~";
          this.curr_dir_name = "root";
          break;
        }
        if (words.length > 1) {
          result = "cd: too many arguments.";
          break;
        }
        if (["..", "../"].includes(rest)) {
          if (this.current_directory !== "~") {
            const parts = this.current_directory.split("/");
            parts.pop();
            this.current_directory = parts.join("/") || "~";
            this.curr_dir_name =
              this.current_directory === "~" ? "root" : parts[parts.length - 1];
          } else {
            result = "Already at root directory.";
          }
          break;
        }
        if (rest === "." || rest === "./") break;
        if (rest === "personal-documents") {
          result = `bash: cd: ${this.curr_dir_name}: Permission denied 😏`;
          break;
        }
        const children = this.child_directories[this.curr_dir_name] || [];
        if (children.includes(rest)) {
          this.current_directory += `/${rest}`;
          this.curr_dir_name = rest;
        } else {
          result = `cd: ${rest}: No such file or directory`;
        }
        break;
      }

      case "pwd": {
        result = this.current_directory.replace("~", "/Users/vcto");
        break;
      }

      case "mkdir": {
        if (rest) this.props.addFolder(rest);
        else result = "mkdir: missing operand";
        break;
      }

      case "echo": {
        if (rest === "$motd") {
          result =
            "Welcome to Ubuntu 22.04 LTS (Jammy Jellyfish) <br/> Type 'help' for commands.";
        } else {
          result = this.xss(rest);
        }
        break;
      }

      case "code":
      case "spotify":
      case "chrome":
      case "blog":
      case "todoist":
      case "trash":
      case "about-vcto":
      case "terminal":
      case "settings":
      case "sendmsg": {
        if (!rest || rest === ".")
          this.props.openApp(main === "todoist" ? "todo-ist" : main);
        else result = `Command '${main}' not found or not yet implemented.`;
        break;
      }

      case "clear": {
        this.reStartTerminal();
        return;
      }

      case "exit": {
        this.closeTerminal();
        return;
      }

      default:
        result = `Command '${main}' not found. Type 'help' for available commands.`;
    }

    document.getElementById(`row-result-${rowId}`).innerHTML = result;
    this.appendTerminalRow();
  };

  xss(str) {
    if (!str) return;
    return str.replace(/[&<>"]/g, (char) => {
      const map = { "&": "&amp", "<": "&lt", ">": "&gt", '"': "&quot" };
      return map[char] || char;
    });
  }

  render() {
    if (!this.state.isClient) {
      return (
        <div className="h-full w-full bg-ub-drk-abrgn text-white text-sm font-bold flex items-center justify-center">
          Loading terminal...
        </div>
      );
    }

    return (
      <div
        className="h-full w-full bg-ub-drk-abrgn text-white text-sm font-mono"
        id="terminal-body"
      >
        <div className="p-2">
          <div>
            Welcome to Ubuntu 22.04.2 LTS (GNU/Linux 5.15.0-76-generic x86_64)
          </div>
          <div className="mt-2">
            * Documentation:  https://help.ubuntu.com <br />
            * Management:     https://landscape.canonical.com <br />
            * Support:        https://ubuntu.com/advantage
          </div>
          <div className="mt-2">
            Last login: {new Date().toString().slice(0, 24)} from 127.0.0.1
          </div>
          <div className="text-yellow-400 mt-2">
            {this.sudo_unlocked
              ? "🔓 Sudo access: UNLOCKED"
              : "🔒 Sudo access: LOCKED (find the password!)"}
          </div>
        </div>
        {this.state.terminal}
      </div>
    );
  }
}

export default Terminal;

export const displayTerminal = (addFolder, openApp) => {
  return <Terminal addFolder={addFolder} openApp={openApp} />;
};
