import React, { Component } from "react";
import ReactGA from "react-ga4";
import { useState, useMemo } from "react";
import project_list from "../../data/projects.json";

export class AboutVcto extends Component {
  constructor() {
    super();
    this.screens = {};
    this.state = {
      screen: () => {},
      active_screen: "about", // by default 'about' screen is active
      navbar: false,
    };
  }

  componentDidMount() {
    this.screens = {
      about: <About />,
      skills: <Skills />,
      projects: <Projects />,
      resume: <Resume />,
    };

    let lastVisitedScreen = "about";
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("about-section");
      if (stored !== null && stored !== undefined) {
        lastVisitedScreen = stored;
      }
    }

    // focus last visited screen
    if (typeof document !== "undefined") {
      this.changeScreen(document.getElementById(lastVisitedScreen));
    }
  }

  changeScreen = (e) => {
    const screen = e.id || e.target.id;

    // store this state
    if (typeof window !== "undefined") {
      localStorage.setItem("about-section", screen);
    }

    // google analytics
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
              ? " bg-ub-orange bg-opacity-100 hover:bg-opacity-95"
              : " hover:bg-gray-50 hover:bg-opacity-5 ") +
            " w-28 md:w-full md:rounded-none rounded-sm cursor-default outline-none py-1.5 focus:outline-none duration-100 my-0.5 flex justify-start items-center pl-2 md:pl-2.5"
          }
        >
          <img
            className=" w-3 md:w-4"
            alt="about vcto"
            src="./themes/Yaru/status/about.svg"
          />
          <span className=" ml-1 md:ml-2 text-gray-50 ">About Me</span>
        </div>
        <div
          id="skills"
          tabIndex="0"
          onFocus={this.changeScreen}
          className={
            (this.state.active_screen === "skills"
              ? " bg-ub-orange bg-opacity-100 hover:bg-opacity-95"
              : " hover:bg-gray-50 hover:bg-opacity-5 ") +
            " w-28 md:w-full md:rounded-none rounded-sm cursor-default outline-none py-1.5 focus:outline-none duration-100 my-0.5 flex justify-start items-center pl-2 md:pl-2.5"
          }
        >
          <img
            className=" w-3 md:w-4"
            alt="vcto's skills"
            src="./themes/Yaru/status/skills.svg"
          />
          <span className=" ml-1 md:ml-2 text-gray-50 ">Skills</span>
        </div>
        <div
          id="projects"
          tabIndex="0"
          onFocus={this.changeScreen}
          className={
            (this.state.active_screen === "projects"
              ? " bg-ub-orange bg-opacity-100 hover:bg-opacity-95"
              : " hover:bg-gray-50 hover:bg-opacity-5 ") +
            " w-28 md:w-full md:rounded-none rounded-sm cursor-default outline-none py-1.5 focus:outline-none duration-100 my-0.5 flex justify-start items-center pl-2 md:pl-2.5"
          }
        >
          <img
            className=" w-3 md:w-4"
            alt="vcto's projects"
            src="./themes/Yaru/status/projects.svg"
          />
          <span className=" ml-1 md:ml-2 text-gray-50 ">Projects</span>
        </div>
        <div
          id="resume"
          tabIndex="0"
          onFocus={this.changeScreen}
          className={
            (this.state.active_screen === "resume"
              ? " bg-ub-orange bg-opacity-100 hover:bg-opacity-95"
              : " hover:bg-gray-50 hover:bg-opacity-5 ") +
            " w-28 md:w-full md:rounded-none rounded-sm cursor-default outline-none py-1.5 focus:outline-none duration-100 my-0.5 flex justify-start items-center pl-2 md:pl-2.5"
          }
        >
          <img
            className=" w-3 md:w-4"
            alt="vcto's resume"
            src="./themes/Yaru/status/download.svg"
          />
          <span className=" ml-1 md:ml-2 text-gray-50 ">Resume</span>
        </div>
        <div className="my-0.5 w-28 md:w-full h-8 px-2 md:px-2.5 flex">
          <iframe
            src="https://github.com/sponsors/notvcto/button"
            title="Sponsor notvcto"
            width={"100%"}
            height={"100%"}
          ></iframe>
        </div>
      </>
    );
  };

  render() {
    return (
      <div className="w-full h-full flex bg-ub-cool-grey text-white select-none relative">
        <div className="md:flex hidden flex-col w-1/4 md:w-1/5 text-sm overflow-y-auto windowMainScreen border-r border-black">
          {this.renderNavLinks()}
        </div>
        <div
          onClick={this.showNavBar}
          className="md:hidden flex flex-col items-center justify-center absolute bg-ub-cool-grey rounded w-6 h-6 top-1 left-1"
        >
          <div className=" w-3.5 border-t border-white"></div>
          <div
            className=" w-3.5 border-t border-white"
            style={{ marginTop: "2pt", marginBottom: "2pt" }}
          ></div>
          <div className=" w-3.5 border-t border-white"></div>
          <div
            className={
              (this.state.navbar
                ? " visible animateShow z-30 "
                : " invisible ") +
              " md:hidden text-xs absolute bg-ub-cool-grey py-0.5 px-1 rounded-sm top-full mt-1 left-0 shadow border-black border border-opacity-20"
            }
          >
            {this.renderNavLinks()}
          </div>
        </div>
        <div className="flex flex-col w-3/4 md:w-4/5 justify-start items-center flex-grow bg-ub-grey overflow-y-auto windowMainScreen">
          {this.state.screen}
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
    <>
      <div className="w-20 md:w-28 my-4 bg-white rounded-full">
        <img
          className="w-full"
          src="./images/logos/bitmoji.png"
          alt="vcto's logo"
        />
      </div>
      <div className=" mt-4 md:mt-8 text-lg md:text-2xl text-center px-1">
        <div>
          My name is <span className="font-bold">vcto!</span> ,
        </div>
      </div>
      <div className=" mt-4 relative md:my-8 pt-px bg-white w-32 md:w-48">
        <div className="bg-white absolute rounded-full p-0.5 md:p-1 top-0 transform -translate-y-1/2 left-0"></div>
        <div className="bg-white absolute rounded-full p-0.5 md:p-1 top-0 transform -translate-y-1/2 right-0"></div>
      </div>
      <ul className=" mt-4 leading-tight tracking-tight text-sm md:text-base w-5/6 md:w-3/4 emoji-list">
        <li className=" list-pc">
          I'm a <span className=" font-medium">Highschool GRADUATE 🎓</span> looking
          to pursue Computer Science and Cybersecurity related careers.
        </li>
        <li className=" mt-3 list-building">
          {" "}
          I enjoy building software as a hobby!
        </li>
        <li className=" mt-3 list-time">
          {" "}
          When I am not coding my next project, I like to spend my time with
          family, playing minecraft or watching{" "}
          <a href="https://www.youtube.com/" target="_blank" rel="noreferrer">
            {" "}
            videos.
          </a>
        </li>
        <li className=" mt-3 list-star">
          {" "}
          And I also have interest in Deep Learning & Computer Vision!
        </li>
      </ul>
    </>
  );
}
function Skills() {
  const languagesAndTools = [
    {
      name: "JavaScript",
      badge:
        "https://img.shields.io/badge/-JavaScript-%23F7DF1C?style=flat&logo=javascript&logoColor=000000",
    },
    {
      name: "Python",
      badge:
        "https://img.shields.io/badge/-Python-3776AB?style=flat&logo=python&logoColor=ffffff",
    },
    {
      name: "HTML5",
      badge:
        "https://img.shields.io/badge/-HTML5-%23E44D27?style=flat&logo=html5&logoColor=ffffff",
      link: "https://www.google.com/search?q=is+html+a+language%3F",
      tooltip: "yes it's a language!",
    },
    {
      name: "CSS",
      badge:
        "https://img.shields.io/badge/-CSS3-1572B6?style=flat&logo=css3&logoColor=ffffff",
    },
    {
      name: "SCSS",
      badge:
        "https://img.shields.io/badge/-SCSS-CC6699?style=flat&logo=sass&logoColor=ffffff",
    },
    {
      name: "Git",
      badge:
        "https://img.shields.io/badge/-Git-%23F05032?style=flat&logo=git&logoColor=%23ffffff",
    },
    {
      name: "Bash",
      badge:
        "https://img.shields.io/badge/-Bash-121011?style=flat&logo=gnu-bash&logoColor=white",
    },
  ];

  const frameworksAndLibs = [
    {
      name: "Next.js",
      badge:
        "https://img.shields.io/badge/Next-black?style=flat&logo=next.js&logoColor=ffffff",
    },
    {
      name: "Node.js",
      badge:
        "https://img.shields.io/badge/-Nodejs-339933?style=flat&logo=Node.js&logoColor=ffffff",
    },
    {
      name: "TailwindCSS",
      badge:
        "https://img.shields.io/badge/-TailwindCSS-06B6D4?style=flat&logo=tailwindcss&logoColor=ffffff",
    },
    {
      name: "Firebase",
      badge:
        "https://img.shields.io/badge/-Firebase-FFCA28?style=flat&logo=firebase&logoColor=000000",
    },
    {
      name: "Discord.js",
      badge:
        "https://img.shields.io/badge/-Discord.js-5865F2?style=flat&logo=discord&logoColor=ffffff",
    },
  ];

  return (
    <>
      <div className="font-medium relative text-2xl mt-2 md:mt-4 mb-4">
        Technical Skills
        <div className="absolute pt-px bg-white mt-px top-full w-full">
          <div className="bg-white absolute rounded-full p-0.5 md:p-1 top-0 transform -translate-y-1/2 left-full"></div>
          <div className="bg-white absolute rounded-full p-0.5 md:p-1 top-0 transform -translate-y-1/2 right-full"></div>
        </div>
      </div>

      <ul className="tracking-tight text-sm md:text-base w-10/12 emoji-list">
        <li className="list-arrow mt-4 leading-tight tracking-tight">
          I've worked with a wide variety of programming languages & frameworks.
        </li>
        <li className="list-arrow mt-4 leading-tight tracking-tight">
          My areas of expertise are{" "}
          <strong className="text-ubt-gedit-orange">
            Next.js & JavaScript!
          </strong>
        </li>
        <li className="list-arrow mt-4 leading-tight tracking-tight">
          Here are my most frequently used
        </li>
      </ul>

      <div className="w-full md:w-10/12 flex mt-4">
        <div className="text-sm text-center md:text-base w-1/2 font-bold">
          Languages & Tools
        </div>
        <div className="text-sm text-center md:text-base w-1/2 font-bold">
          Frameworks & Libraries
        </div>
      </div>

      <div className="w-full md:w-10/12 flex justify-center items-start font-bold text-center">
        <div className="px-2 w-1/2">
          <div className="flex flex-wrap justify-center items-start w-full mt-2">
            {languagesAndTools.map((tool) =>
              tool.link ? (
                <a
                  key={tool.name}
                  href={tool.link}
                  title={tool.tooltip}
                  target="_blank"
                  rel="noreferrer"
                >
                  <img
                    className="m-1"
                    src={tool.badge}
                    alt={`vcto ${tool.name}`}
                  />
                </a>
              ) : (
                <img
                  key={tool.name}
                  className="m-1"
                  src={tool.badge}
                  alt={`vcto ${tool.name}`}
                />
              )
            )}
          </div>
        </div>

        <div className="px-2 w-1/2">
          <div className="flex flex-wrap justify-center items-start w-full mt-2">
            {frameworksAndLibs.map((lib) => (
              <img
                key={lib.name}
                className="m-1"
                src={lib.badge}
                alt={`vcto ${lib.name}`}
              />
            ))}
          </div>
        </div>
      </div>

      <ul className="tracking-tight text-sm md:text-base w-10/12 emoji-list mt-4">
        <li className="list-arrow mt-4 leading-tight tracking-tight">
          <span>And of course,</span>{" "}
          <img
            className="inline ml-1"
            src="http://img.shields.io/badge/-Linux-0078D6?style=plastic&logo=linux&logoColor=ffffff"
            alt="vcto linux"
          />{" "}
          <span>!</span>
        </li>
      </ul>
    </>
  );
}

function Projects() {
  const tag_colors = {
    javascript: "yellow-300",
    typescript: "blue-300",
    firebase: "red-600",
    firestore: "red-500",
    "firebase auth": "red-400",
    "chrome-extension": "yellow-400",
    flutter: "blue-400",
    dart: "blue-500",
    "react-native": "purple-500",
    html: "pink-600",
    html5: "pink-600",
    css: "blue-200",
    sass: "pink-400",
    scss: "pink-400",
    tensorflow: "yellow-600",
    django: "green-600",
    python: "green-200",
    "codeforces-api": "gray-300",
    tailwindcss: "blue-300",
    "next.js": "purple-600",
    nodejs: "green-300",
    config: "gray-400",
    "github-config": "gray-400",
  };

  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState(null);
  const [visibleCount, setVisibleCount] = useState(6);

  const allTags = useMemo(() => {
    const tagSet = new Set();
    project_list.forEach((p) =>
      [...(p.languages || []), ...(p.topics || [])].forEach((tag) =>
        tagSet.add(tag)
      )
    );
    return Array.from(tagSet);
  }, []);

  const filteredProjects = useMemo(() => {
    return project_list.filter((project) => {
      const matchesSearch =
        project.name.toLowerCase().includes(search.toLowerCase()) ||
        project.description
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase());

      const tags = [...(project.languages || []), ...(project.topics || [])];
      const matchesTag = selectedTag ? tags.includes(selectedTag) : true;

      return matchesSearch && matchesTag;
    });
  }, [search, selectedTag]);

  const visibleProjects = filteredProjects.slice(0, visibleCount);

  return (
    <>
      <div className="font-medium relative text-2xl mt-2 md:mt-4 mb-4">
        Projects
        <div className="absolute pt-px bg-white mt-px top-full w-full">
          <div className="bg-white absolute rounded-full p-0.5 md:p-1 top-0 transform -translate-y-1/2 left-full"></div>
          <div className="bg-white absolute rounded-full p-0.5 md:p-1 top-0 transform -translate-y-1/2 right-full"></div>
        </div>
      </div>

      <iframe
        src="https://github.com/sponsors/notvcto/card"
        title="Sponsor vcto"
        className="my-4 w-5/6 md:w-3/4"
      ></iframe>

      <div className="w-5/6 md:w-3/4 mb-4">
        <input
          type="text"
          placeholder="🔍 Search projects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-2 py-1 rounded bg-ub-cool-grey border border-gray-700 text-white text-sm"
        />

        <div className="flex flex-wrap gap-2 mt-2">
          <button
            onClick={() => setSelectedTag(null)}
            className={`px-2 py-0.5 text-xs rounded-full border ${
              selectedTag === null
                ? "bg-white text-black"
                : "border-gray-500 text-gray-300"
            }`}
          >
            All
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              className={`px-2 py-0.5 text-xs rounded-full border ${
                selectedTag === tag
                  ? "bg-white text-black"
                  : `border-${tag_colors[tag] || "gray-500"} text-${
                      tag_colors[tag] || "gray-300"
                    }`
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {visibleProjects.map((project) => {
        const projectName = project.link.split("/").pop();
        const tags = [...(project.languages || []), ...(project.topics || [])];

        return (
          <a
            key={project.name}
            href={project.link}
            target="_blank"
            rel="noreferrer"
            className="flex w-full flex-col px-4"
          >
            <div className="w-full py-1 px-2 my-2 border border-gray-50 border-opacity-10 rounded hover:bg-gray-50 hover:bg-opacity-5 cursor-pointer">
              <div className="flex flex-wrap justify-between items-center">
                <div className="flex justify-center items-center">
                  <div className=" text-base md:text-lg mr-2">
                    {project.name.toLowerCase()}
                  </div>
                  <iframe
                    src={`https://ghbtns.com/github-btn.html?user=notvcto&repo=${projectName}&type=star&count=true`}
                    frameBorder="0"
                    scrolling="0"
                    width="150"
                    height="20"
                    title={`${project.name.toLowerCase()}-star`}
                  ></iframe>
                </div>
                <div className="text-gray-300 font-light text-sm">
                  {project.date}
                </div>
              </div>
              <ul className=" tracking-normal leading-tight text-sm font-light ml-4 mt-1">
                {project.description.map((desc, i) => (
                  <li key={`${i}-${desc}`} className="list-disc mt-1 text-gray-100">
                    {desc}
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap items-start justify-start text-xs py-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className={`px-1.5 py-0.5 w-max border border-${
                      tag_colors[tag] || "gray-500"
                    } text-${tag_colors[tag] || "gray-300"} m-1 rounded-full`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </a>
        );
      })}

      {visibleCount < filteredProjects.length && (
        <div className="w-full flex justify-center my-4">
          <button
            onClick={() => setVisibleCount(visibleCount + 6)}
            className="px-4 py-1 bg-ub-orange hover:bg-opacity-80 text-white rounded text-sm"
          >
            Show More
          </button>
        </div>
      )}

      {filteredProjects.length === 0 && (
        <div className="text-sm text-gray-400 my-6 text-center">
          No projects found.
        </div>
      )}
    </>
  );
}

function Resume() {
  return (
    <iframe
      className="h-full w-full"
      src="./files/"
      title="vcto's resume (coming soon!)"
      frameBorder="0"
    ></iframe>
  );
}
