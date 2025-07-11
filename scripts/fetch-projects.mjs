import fs from "fs/promises";
import fetch from "node-fetch";

const GITHUB_USERNAME = "notvcto";

// Fetch programming languages
const fetchLanguages = async (url) => {
  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    return Object.keys(data); // e.g., ["JavaScript", "HTML"]
  } catch (err) {
    console.error(`❌ Failed to fetch languages for ${url}:`, err);
    return [];
  }
};

// Fetch GitHub topics (requires special Accept header)
const fetchTopics = async (repoName) => {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${GITHUB_USERNAME}/${repoName}/topics`,
      {
        headers: {
          Accept: "application/vnd.github.mercy-preview+json",
        },
      }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.names || [];
  } catch (err) {
    console.error(`❌ Failed to fetch topics for ${repoName}:`, err);
    return [];
  }
};

(async () => {
  try {
    const res = await fetch(
      `https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100`
    );

    if (!res.ok) {
      throw new Error(`❌ Failed to fetch projects: ${res.status}`);
    }

    const repos = await res.json();

    const filtered = repos
      .filter((repo) => !repo.fork && !repo.private)
      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

    const projects = [];

    for (const repo of filtered) {
      const [languages, topics] = await Promise.all([
        fetchLanguages(repo.languages_url),
        fetchTopics(repo.name),
      ]);

      const cleanLanguages =
        languages.length > 0 ? languages.map((lang) => lang.toLowerCase()) : [];

      projects.push({
        name: repo.name,
        date: new Date(repo.created_at).toLocaleString("default", {
          month: "short",
          year: "numeric",
        }),
        link: repo.html_url,
        description: [repo.description || "No description provided."],
        languages: cleanLanguages,
        topics: topics.map((topic) => topic.toLowerCase()),
      });
    }

    await fs.writeFile("data/projects.json", JSON.stringify(projects, null, 2));
    console.log(`✅ Saved ${projects.length} projects to data/projects.json`);
  } catch (error) {
    console.error("❌ Error fetching projects:", error);
  }
})();
