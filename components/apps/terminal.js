import React, { Component } from "react";
import $ from "jquery";
import ReactGA from "react-ga4";

export class Terminal extends Component {
  constructor() {
    super();
    this.cursor = "";
    this.terminal_rows = 1;
    this.current_directory = "~";
    this.curr_dir_name = "root";
    this.prev_commands = [];
    this.commands_index = -1;
    this.child_directories = {
      root: [
        "books",
        "projects",
        "personal-documents",
        "skills",
        "languages",
        "interests",
      ],
      books: [
        "Eric-Jorgenson_The-Almanack-of-Naval-Ravikant.pdf",
        "Elon Musk: How the Billionaire CEO of SpaceX.pdf",
        "The $100 Startup_CHRIS_GUILLEBEAU.pdf",
        "The_Magic_of_Thinking_Big.pdf",
      ],
      skills: [
        "Front-end development",
        "React.js",
        "jQuery",
        "Flutter",
        "Express.js",
        "SQL",
        "Firebase",
      ],
      projects: [
        "notvcto-personal-portfolio",
        "synonyms-list-react",
        "economist.com-unlocked",
        "Improve-Codeforces",
        "flutter-banking-app",
        "Meditech-Healthcare",
        "CPU-Scheduling-APP-React-Native",
      ],
      interests: ["Software Engineering", "Deep Learning", "Computer Vision"],
      languages: ["Javascript", "C++", "Java", "Dart"],
    };
    this.state = { terminal: [] };
  }

  componentDidMount() {
    this.reStartTerminal();
  }

  componentDidUpdate() {
    clearInterval(this.cursor);
    this.startCursor(this.terminal_rows - 2);
  }

  componentWillUnmount() {
    clearInterval(this.cursor);
  }

  reStartTerminal = () => {
    clearInterval(this.cursor);
    $("#terminal-body").empty();
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
          <div className=" text-ubt-green">vcto@Dell</div>
          <div className="text-white mx-px font-medium">:</div>
          <div className=" text-ubt-blue">{this.current_directory}</div>
          <div className="text-white mx-px font-medium mr-1">$</div>
        </div>
        <div
          id="cmd"
          onClick={this.focusCursor}
          className=" bg-transperent relative flex-1 overflow-hidden"
        >
          <span
            id={`show-${id}`}
            className=" float-left whitespace-pre pb-1 opacity-100 font-normal tracking-wider"
          ></span>
          <div
            id={`cursor-${id}`}
            className=" float-left mt-1 w-1.5 h-3.5 bg-white"
          ></div>
          <input
            id={`terminal-input-${id}`}
            data-row-id={id}
            onKeyDown={this.checkKey}
            onBlur={this.unFocusCursor}
            className=" absolute top-0 left-0 w-full opacity-0 outline-none bg-transparent"
            spellCheck={false}
            autoFocus={typeof window !== "undefined"}
            autoComplete="off"
            type="text"
          />
        </div>
      </div>
      <div id={`row-result-${id}`} className="my-2 font-normal"></div>
    </React.Fragment>
  );

  focusCursor = (e) => {
    clearInterval(this.cursor);
    this.startCursor($(e.target).data("row-id"));
  };

  unFocusCursor = (e) => {
    this.stopCursor($(e.target).data("row-id"));
  };

  startCursor = (id) => {
    clearInterval(this.cursor);
    $(`input#terminal-input-${id}`).trigger("focus");
    $(`input#terminal-input-${id}`).on("input", function () {
      $(`#cmd span#show-${id}`).text($(this).val());
    });
    this.cursor = window.setInterval(function () {
      const cursor = $(`#cursor-${id}`);
      cursor.css(
        "visibility",
        cursor.css("visibility") === "visible" ? "hidden" : "visible"
      );
    }, 500);
  };

  stopCursor = (id) => {
    clearInterval(this.cursor);
    $(`#cursor-${id}`).css({ visibility: "visible" });
  };

  removeCursor = (id) => {
    this.stopCursor(id);
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
      this.handleCommands(command, terminal_row_id);

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

  handleCommands = (command, rowId) => {
    const words = command.split(" ").filter(Boolean);
    const main = words.shift();
    const rest = words.join(" ").trim();
    let result = "";

    switch (main) {
      case "help": {
        result = `Available commands: <br>[ cd, ls, pwd, mkdir, echo, code, spotify, chrome, todoist, trash, about-vcto, terminal, settings, sendmsg, clear, exit, sudo, sudo rm -rf /, help ]`;
        break;
      }
      case "sudo": {
        if (rest === "rm -rf /") {
          result =
            "<span class='text-red-500'>Nuking system... brb</span><script>setTimeout(() => window.location.reload(), 2000);</script>";
        } else {
          ReactGA.event({ category: "Sudo Access", action: "lol" });
          result =
            "<img class='w-2/5' src='./images/memes/used-sudo-command.webp' />";
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
          result = `bash /${this.curr_dir_name}: Permission denied 😏`;
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
      case "ls": {
        const target = rest || this.curr_dir_name;
        if (this.child_directories.hasOwnProperty(target)) {
          result = this.childDirectories(target).join("");
        } else if (target === "personal-documents") {
          result = "Nope! 🙃";
        } else {
          result = `ls: cannot access '${rest}': No such file or directory`;
        }
        break;
      }
      case "pwd": {
        result = this.current_directory.replace("~", "/home/vcto");
        break;
      }
      case "mkdir": {
        if (rest) this.props.addFolder(rest);
        else result = "mkdir: missing operand";
        break;
      }
      case "echo": {
        result = this.xss(rest);
        break;
      }
      case "code":
      case "spotify":
      case "chrome":
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
        result = `Command '${main}' not found or not yet implemented.`;
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
    return (
      <div
        className="h-full w-full bg-ub-drk-abrgn text-white text-sm font-bold"
        id="terminal-body"
      >
        {this.state.terminal}
      </div>
    );
  }
}

export default Terminal;

export const displayTerminal = (addFolder, openApp) => {
  return <Terminal addFolder={addFolder} openApp={openApp} />;
};
