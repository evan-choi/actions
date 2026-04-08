import { RepoEntry } from "./types";

export function parseRepos(input: string, defaultToken: string): RepoEntry[] {
  const lines = input
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length === 0) {
    throw new Error("No repos provided");
  }

  return lines.map((line) => {
    // owner/repo or owner/repo:token
    // Split on first colon AFTER the owner/repo part
    const slashIndex = line.indexOf("/");
    if (slashIndex === -1) {
      throw new Error(`Invalid repo format: "${line}". Expected owner/repo`);
    }

    // Find the first colon after the slash (repo:token separator)
    const colonIndex = line.indexOf(":", slashIndex);
    if (colonIndex === -1) {
      // No token override — use default
      const repo = line;
      validateRepo(repo);
      return { repo, token: defaultToken };
    }

    const repo = line.substring(0, colonIndex);
    const token = line.substring(colonIndex + 1);
    validateRepo(repo);
    return { repo, token };
  });
}

function validateRepo(repo: string): void {
  const parts = repo.split("/");
  if (parts.length !== 2 || parts[0].length === 0 || parts[1].length === 0) {
    throw new Error(`Invalid repo format: "${repo}". Expected owner/repo`);
  }
}
