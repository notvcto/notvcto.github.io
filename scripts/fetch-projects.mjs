import fs from "fs/promises";
import fetch from "node-fetch";

const GITHUB_USERNAME = "notvcto";

const fetchLanguages = async (url) => {
  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    return Object.keys(data); // language names only
  } catch (err) {
    console.error(`❌ Failed to fetch languages for ${url}:`, err);
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
      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at)); // newest first

    const projects = [];

    for (const repo of filtered) {
      const languages = await fetchLanguages(repo.languages_url);

      projects.push({
        name: repo.name,
        date: new Date(repo.created_at).toLocaleString("default", {
          month: "short",
          year: "numeric",
        }),
        link: repo.html_url,
        description: [repo.description || "No description provided."],
        domains:
          languages.length > 0
            ? languages.map((l) => l.toLowerCase())
            : [repo.language?.toLowerCase() || "unknown"],
      });
    }

    await fs.writeFile("data/projects.json", JSON.stringify(projects, null, 2));
    console.log(`✅ Saved ${projects.length} projects to data/projects.json`);
  } catch (error) {
    console.error("❌ Error fetching projects:", error);
  }
})();
