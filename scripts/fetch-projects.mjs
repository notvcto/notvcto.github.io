import fs from "fs";
import fetch from "node-fetch";

const GITHUB_USERNAME = "notvcto";
const NUM_PROJECTS = 5;

(async () => {
  try {
    const res = await fetch(
      `https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100`
    );

    if (!res.ok) {
      throw new Error(`Failed to fetch projects: ${res.status}`);
    }

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
        domains: repo.topics || ["javascript"], // Using repo topics as suggested
      }));

    fs.writeFileSync("data/projects.json", JSON.stringify(projects, null, 2));
    console.log("Successfully fetched and saved projects! ✅");
  } catch (error) {
    console.error("Error fetching projects: ❌", error);
  }
})();
