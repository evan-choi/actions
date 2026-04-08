import type { RepoEntry, CredentialsConfig } from "./types";

export function createCredentialsConfig(
  host: string,
  entries: RepoEntry[]
): CredentialsConfig {
  const repos: Record<string, string> = {};
  for (const entry of entries) {
    repos[entry.repo] = entry.token;
  }
  return { host, repos };
}

/**
 * Returns the source code of a standalone Node.js script
 * that acts as a git credential helper.
 *
 * The script reads go-private-credentials.json from the same directory
 * and responds to git credential "get" requests.
 */
export function getHelperSource(): string {
  return `#!/usr/bin/env node
"use strict";
const fs = require("fs");
const path = require("path");
const readline = require("readline");

// Only handle "get" — ignore "store" and "erase"
if (process.argv[2] !== "get") {
  process.exit(0);
}

const configPath = path.join(
  path.dirname(process.argv[1]),
  "go-private-credentials.json"
);
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

const rl = readline.createInterface({ input: process.stdin });
const fields = {};

rl.on("line", (line) => {
  if (line === "") return;
  const idx = line.indexOf("=");
  if (idx !== -1) {
    fields[line.substring(0, idx)] = line.substring(idx + 1);
  }
});

rl.on("close", () => {
  if (fields.host !== config.host) {
    process.exit(0);
  }

  const repoPath = (fields.path || "").replace(/\\.git$/, "");
  const token = config.repos[repoPath];

  if (!token) {
    process.exit(0);
  }

  process.stdout.write("username=x-access-token\\n");
  process.stdout.write("password=" + token + "\\n");
  process.exit(0);
});
`;
}
