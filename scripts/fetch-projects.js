// scripts/fetch-projects.js
const fs = require("fs");
const fetch = require("node-fetch");

const GITHUB_USERNAME = "notvcto";
const NUM_PROJECTS = 5;

(async () => {
  const res = await fetch(
    `https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100`
  );
  const data = await res.json();

  const projects = data
    .filter((repo) => !repo.fork && !repo.private)
    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
    .slice(0, NUM_PROJECTS)
    .map((repo) => ({
      name: repo.name,
      date: new Date(repo.created_at).toLocaleString("default", {
        month: "short",
        year: "numeric",
      }),
      link: repo.html_url,
      description: [repo.description || "No description provided."],
      domains: ["javascript"], // You can enhance this by using repo topics!
    }));

  fs.writeFileSync("data/projects.json", JSON.stringify(projects, null, 2));
})();
