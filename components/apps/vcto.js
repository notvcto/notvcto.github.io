import React, { Component } from "react";
import ReactGA from "react-ga4";

export class AboutVcto extends Component {
  constructor() {
    super();
    this.screens = {};
    this.state = {
      isClient: false,
      screen: () => {},
      active_screen: "about",
      navbar: false,
    };
  }

  componentDidMount() {
    this.setState({ isClient: true });
    this.screens = {
      about: <About />,
      skills: <Skills />,
      projects: <Projects />,
      resume: <Resume />,
    };

    let lastVisitedScreen = "about";
    if (this.state.isClient) {
      const stored = localStorage.getItem("about-section");
      if (stored !== null && stored !== undefined) {
        lastVisitedScreen = stored;
      }
    }

    if (this.state.isClient) {
      this.changeScreen(document.getElementById(lastVisitedScreen));
    }
  }

  changeScreen = (e) => {
    if (!this.state.isClient) return;
    
    const screen = e.id || e.target.id;

    localStorage.setItem("about-section", screen);

    ReactGA.send({
      hitType: "pageview",
      page: `/${screen}`,
      title: "Custom Title",
    });

    this.setState({
      screen: this.screens[screen],
      active_screen: screen,
    });
  };

  showNavBar = () => {
    this.setState({ navbar: !this.state.navbar });
  };

  renderNavLinks = () => {
    return (
      <>
        <div
          id="about"
          tabIndex="0"
          onFocus={this.changeScreen}
          className={
            (this.state.active_screen === "about"
              ? " bg-mac-blue bg-opacity-80 hover:bg-opacity-90"
              : " hover:bg-mac-primary hover:bg-opacity-10 ") +
            " w-full rounded-mac cursor-default outline-none py-3 px-4 focus:outline-none duration-200 my-1 flex justify-start items-center transition-all"
          }
        >
          <div className="w-5 h-5 mr-3 flex items-center justify-center">
            <img
              className="w-4 h-4 opacity-80"
              alt="about vcto"
              src="./themes/Yaru/status/about.svg"
            />
          </div>
          <span className="text-mac-primary font-medium">About Me</span>
        </div>
        <div
          id="skills"
          tabIndex="0"
          onFocus={this.changeScreen}
          className={
            (this.state.active_screen === "skills"
              ? " bg-mac-blue bg-opacity-80 hover:bg-opacity-90"
              : " hover:bg-mac-primary hover:bg-opacity-10 ") +
            " w-full rounded-mac cursor-default outline-none py-3 px-4 focus:outline-none duration-200 my-1 flex justify-start items-center transition-all"
          }
        >
          <div className="w-5 h-5 mr-3 flex items-center justify-center">
            <img
              className="w-4 h-4 opacity-80"
              alt="vcto's skills"
              src="./themes/Yaru/status/skills.svg"
            />
          </div>
          <span className="text-mac-primary font-medium">Skills</span>
        </div>
        <div
          id="projects"
          tabIndex="0"
          onFocus={this.changeScreen}
          className={
            (this.state.active_screen === "projects"
              ? " bg-mac-blue bg-opacity-80 hover:bg-opacity-90"
              : " hover:bg-mac-primary hover:bg-opacity-10 ") +
            " w-full rounded-mac cursor-default outline-none py-3 px-4 focus:outline-none duration-200 my-1 flex justify-start items-center transition-all"
          }
        >
          <div className="w-5 h-5 mr-3 flex items-center justify-center">
            <img
              className="w-4 h-4 opacity-80"
              alt="vcto's projects"
              src="./themes/Yaru/status/projects.svg"
            />
          </div>
          <span className="text-mac-primary font-medium">Projects</span>
        </div>
        <div
          id="resume"
          tabIndex="0"
          onFocus={this.changeScreen}
          className={
            (this.state.active_screen === "resume"
              ? " bg-mac-blue bg-opacity-80 hover:bg-opacity-90"
              : " hover:bg-mac-primary hover:bg-opacity-10 ") +
            " w-full rounded-mac cursor-default outline-none py-3 px-4 focus:outline-none duration-200 my-1 flex justify-start items-center transition-all"
          }
        >
          <div className="w-5 h-5 mr-3 flex items-center justify-center">
            <img
              className="w-4 h-4 opacity-80"
              alt="vcto's resume"
              src="./themes/Yaru/status/download.svg"
            />
          </div>
          <span className="text-mac-primary font-medium">Resume</span>
        </div>
        <div className="my-3 w-full px-4">
          <iframe
            src="https://github.com/sponsors/notvcto/button"
            title="Sponsor notvcto"
            width={"100%"}
            height={"32px"}
            className="rounded-mac-sm"
          ></iframe>
        </div>
      </>
    );
  };

  render() {
    return (
      <div className="w-full h-full flex bg-gradient-to-br from-mac-dark via-mac-gray to-mac-darker text-mac-primary select-none relative font-mac">
        {/* Finder-style Sidebar */}
        <div className="hidden md:flex flex-col w-64 bg-mac-sidebar-dark bg-opacity-30 backdrop-blur-mac border-r border-mac-border border-opacity-20 p-4">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-mac-primary mb-4">Portfolio</h2>
            {this.renderNavLinks()}
          </div>
        </div>

        {/* Mobile Navigation Toggle */}
        <div
          onClick={this.showNavBar}
          className="md:hidden fixed top-4 left-4 z-50 flex flex-col items-center justify-center bg-mac-gray bg-opacity-80 backdrop-blur-mac rounded-mac w-10 h-10 border border-mac-border border-opacity-20"
        >
          <div className="w-5 border-t border-mac-primary opacity-80"></div>
          <div className="w-5 border-t border-mac-primary opacity-80 mt-1"></div>
          <div className="w-5 border-t border-mac-primary opacity-80 mt-1"></div>
          
          {/* Mobile Menu Dropdown */}
          <div
            className={
              (this.state.navbar
                ? " visible opacity-100 translate-y-0 "
                : " invisible opacity-0 -translate-y-2 ") +
              " absolute top-full mt-2 left-0 bg-mac-gray bg-opacity-90 backdrop-blur-mac py-2 px-1 rounded-mac shadow-mac-lg border border-mac-border border-opacity-20 w-48 transition-all duration-200"
            }
          >
            {this.renderNavLinks()}
          </div>
        </div>

        {/* Main Content Window */}
        <div className="flex-1 flex justify-center items-center p-4 md:p-8">
          <div className="w-full max-w-4xl bg-mac-window-dark bg-opacity-40 backdrop-blur-mac rounded-mac-xl shadow-mac-window border border-mac-border border-opacity-20 overflow-hidden">
            {/* Window Title Bar */}
            <div className="flex items-center justify-between px-6 py-4 bg-mac-gray bg-opacity-50 border-b border-mac-border border-opacity-20">
              <div className="flex items-center space-x-3">
                {/* Traffic Light Buttons */}
                <div className="flex space-x-2">
                  <div className="w-3 h-3 rounded-full bg-mac-red"></div>
                  <div className="w-3 h-3 rounded-full bg-mac-yellow"></div>
                  <div className="w-3 h-3 rounded-full bg-mac-green"></div>
                </div>
              </div>
              <div className="text-mac-primary font-medium text-sm opacity-80">
                {this.state.active_screen === "about" && "About Me"}
                {this.state.active_screen === "skills" && "Technical Skills"}
                {this.state.active_screen === "projects" && "Projects"}
                {this.state.active_screen === "resume" && "Resume"}
              </div>
              <div className="w-16"></div> {/* Spacer for centering */}
            </div>

            {/* Window Content */}
            <div className="p-8 overflow-y-auto max-h-96 windowMainScreen">
              {this.state.screen}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default AboutVcto;

export const displayAboutVcto = () => {
  return <AboutVcto />;
};

function About() {
  return (
    <div className="flex flex-col items-center text-center space-y-6">
      <div className="w-24 h-24 bg-mac-gray bg-opacity-50 rounded-full p-1 shadow-mac-inner">
        <img
          className="w-full h-full rounded-full"
          src="./images/logos/bitmoji.png"
          alt="vcto's avatar"
        />
      </div>
      
      <div className="space-y-4">
        <div className="text-2xl md:text-3xl font-light">
          My name is <span className="font-semibold text-mac-blue">vcto!</span>
        </div>
        
        <div className="w-32 h-px bg-gradient-to-r from-transparent via-mac-primary via-50% to-transparent opacity-30"></div>
      </div>

      <div className="space-y-4 text-mac-secondary leading-relaxed max-w-2xl">
        <div className="flex items-start space-x-3">
          <span className="text-xl">🏫</span>
          <p>
            I'm a <span className="font-medium text-mac-primary">Highschool student</span> looking
            to pursue Computer Science and Cybersecurity related careers.
          </p>
        </div>
        
        <div className="flex items-start space-x-3">
          <span className="text-xl">👨🏻‍💻</span>
          <p>I enjoy building software as a hobby!</p>
        </div>
        
        <div className="flex items-start space-x-3">
          <span className="text-xl">🎲</span>
          <p>
            When I am not coding my next project, I like to spend my time with
            family, playing minecraft or watching{" "}
            <a 
              href="https://www.youtube.com/" 
              target="_blank" 
              rel="noreferrer"
              className="text-mac-blue hover:text-mac-blue-hover underline transition-colors"
            >
              videos.
            </a>
          </p>
        </div>
        
        <div className="flex items-start space-x-3">
          <span className="text-xl">🌟</span>
          <p>And I also have interest in Deep Learning & Computer Vision!</p>
        </div>
      </div>
    </div>
  );
}

function Skills() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-mac-primary mb-2">Technical Skills</h2>
        <div className="w-24 h-px bg-gradient-to-r from-transparent via-mac-blue via-50% to-transparent mx-auto"></div>
      </div>

      <div className="space-y-6 text-mac-secondary">
        <p className="text-center leading-relaxed">
          I've worked with a wide variety of programming languages & frameworks.
        </p>
        
        <div className="text-center">
          <p>
            My areas of expertise are{" "}
            <strong className="text-mac-blue font-semibold">Next.js & JavaScript!</strong>
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-mac-gray bg-opacity-30 rounded-mac-lg p-6 backdrop-blur-sm border border-mac-border border-opacity-10">
          <h3 className="text-lg font-semibold text-mac-primary mb-4 text-center">
            Languages & Tools
          </h3>
          <div className="flex flex-wrap justify-center gap-2">
            <img
              className="transition-transform hover:scale-105"
              src="https://img.shields.io/badge/-JavaScript-%23F7DF1C?style=flat&logo=javascript&logoColor=000000&labelColor=%23F7DF1C&color=%23FFCE5A"
              alt="vcto javascript"
            />
            <img
              className="transition-transform hover:scale-105"
              src="http://img.shields.io/badge/-Python-3776AB?style=flat&logo=python&logoColor=ffffff"
              alt="vcto python"
            />
            <a
              href="https://www.google.com/search?q=is+html+a+language%3F"
              target="_blank"
              rel="noreferrer"
            >
              <img
                title="yes it's a language!"
                className="transition-transform hover:scale-105"
                src="https://img.shields.io/badge/-HTML5-%23E44D27?style=flat&logo=html5&logoColor=ffffff"
                alt="vcto HTML"
              />
            </a>
            <img
              src="https://img.shields.io/badge/-Git-%23F05032?style=flat&logo=git&logoColor=%23ffffff"
              alt="vcto git"
              className="transition-transform hover:scale-105"
            />
          </div>
        </div>

        <div className="bg-mac-gray bg-opacity-30 rounded-mac-lg p-6 backdrop-blur-sm border border-mac-border border-opacity-10">
          <h3 className="text-lg font-semibold text-mac-primary mb-4 text-center">
            Frameworks & Libraries
          </h3>
          <div className="flex flex-wrap justify-center gap-2">
            <img
              className="transition-transform hover:scale-105"
              src="https://img.shields.io/badge/Next-black?style=flat&logo=next.js&logoColor=ffffff"
              alt="vcto next"
            />
            <img
              src="https://img.shields.io/badge/-Nodejs-339933?style=flat&logo=Node.js&logoColor=ffffff"
              alt="vcto node.js"
              className="transition-transform hover:scale-105"
            />
          </div>
        </div>
      </div>

      <div className="text-center">
        <p className="text-mac-secondary">
          And of course,{" "}
          <img
            className="inline mx-1 transition-transform hover:scale-105"
            src="http://img.shields.io/badge/-Linux-0078D6?style=plastic&logo=linux&logoColor=ffffff"
            alt="vcto linux"
          />
          !
        </p>
      </div>
    </div>
  );
}

function Projects() {
  const project_list = [
    {
      name: "notvcto.github.io",
      date: "Sep 2024",
      link: "https://github.com/notvcto/notvcto.github.io",
      description: ["The page you're seeing right now!"],
      domains: ["javascript", "next.js"],
    },
    {
      name: "omen-source",
      date: "Sep 2024",
      link: "https://github.com/notvcto/omen-source",
      description: ["Source code of my Discord bot"],
      domains: ["javascript", "node.js", "lavalink"],
    },
    {
      name: "omen",
      date: "Sep 2024",
      link: "https://github.com/notvcto/omen",
      description: ["Website for my Discord bot!"],
      domains: ["javascript", "next.js"],
    },
    {
      name: "GardenBot",
      date: "May 2025",
      link: "https://github.com/notvcto/GardenBot",
      description: [
        "Discord Bot with an integrated API to check for the Grow a Garden stock.",
      ],
      domains: ["javascript"],
    },
    {
      name: "thorn-bootstrap",
      date: "May 2025",
      link: "https://github.com/notvcto/thorn-bootstrap",
      description: ["Bootstrap for my all new programming language, Thorn"],
      domains: ["thorn", "python"],
    },
  ];

  const tag_colors = {
    javascript: "bg-yellow-500 text-black",
    firebase: "bg-red-600 text-white",
    firestore: "bg-red-500 text-white",
    "firebase auth": "bg-red-400 text-white",
    "chrome-extension": "bg-yellow-400 text-black",
    flutter: "bg-blue-400 text-white",
    dart: "bg-blue-500 text-white",
    "react-native": "bg-purple-500 text-white",
    html5: "bg-pink-600 text-white",
    sass: "bg-pink-400 text-white",
    tensorflow: "bg-yellow-600 text-white",
    django: "bg-green-600 text-white",
    python: "bg-green-400 text-black",
    "codeforces-api": "bg-gray-400 text-black",
    tailwindcss: "bg-blue-300 text-black",
    "next.js": "bg-black text-white",
    "node.js": "bg-green-500 text-white",
    lavalink: "bg-purple-600 text-white",
    thorn: "bg-indigo-600 text-white",
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-mac-primary mb-4">Projects</h2>
        <div className="w-16 h-px bg-gradient-to-r from-transparent via-mac-blue via-50% to-transparent mx-auto mb-6"></div>
        
        <div className="bg-mac-gray bg-opacity-20 rounded-mac-lg p-4 backdrop-blur-sm border border-mac-border border-opacity-10">
          <iframe
            src="https://github.com/sponsors/notvcto/card"
            title="Sponsor vcto"
            className="w-full h-32 rounded-mac"
          ></iframe>
        </div>
      </div>

      <div className="space-y-4">
        {project_list.map((project, index) => {
          const projectNameFromLink = project.link.split("/");
          const projectName = projectNameFromLink[projectNameFromLink.length - 1];
          return (
            <a
              key={index}
              href={project.link}
              target="_blank"
              rel="noreferrer"
              className="block group"
            >
              <div className="bg-mac-gray bg-opacity-30 backdrop-blur-sm rounded-mac-lg p-6 border border-mac-border border-opacity-10 hover:bg-opacity-40 hover:border-opacity-20 transition-all duration-200 group-hover:shadow-mac-md">
                <div className="flex flex-wrap justify-between items-start mb-3">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-semibold text-mac-primary group-hover:text-mac-blue transition-colors">
                      {project.name.toLowerCase()}
                    </h3>
                    <iframe
                      src={`https://ghbtns.com/github-btn.html?user=notvcto&repo=${projectName}&type=star&count=true`}
                      frameBorder="0"
                      scrolling="0"
                      width="100"
                      height="20"
                      title={project.name.toLowerCase() + "-star"}
                      className="rounded-mac-sm"
                    ></iframe>
                  </div>
                  <span className="text-mac-tertiary text-sm font-mono">
                    {project.date}
                  </span>
                </div>
                
                <div className="space-y-2 mb-4">
                  {project.description.map((desc, index) => (
                    <p key={index} className="text-mac-secondary leading-relaxed">
                      {desc}
                    </p>
                  ))}
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {project.domains?.map((domain, index) => (
                    <span
                      key={index}
                      className={`px-3 py-1 text-xs font-medium rounded-full ${
                        tag_colors[domain] || "bg-mac-gray text-mac-primary"
                      } transition-transform hover:scale-105`}
                    >
                      {domain}
                    </span>
                  ))}
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}

function Resume() {
  return (
    <div className="flex flex-col items-center justify-center h-64 space-y-6">
      <div className="text-6xl">📄</div>
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold text-mac-primary">Resume</h3>
        <p className="text-mac-secondary">Coming soon!</p>
      </div>
      <div className="bg-mac-gray bg-opacity-30 backdrop-blur-sm rounded-mac-lg p-4 border border-mac-border border-opacity-10">
        <p className="text-mac-tertiary text-sm">
          My resume will be available here shortly. In the meantime, feel free to check out my projects and connect with me!
        </p>
      </div>
    </div>
  );
}