import { execFileSync } from "node:child_process";
import type { RepoEntry } from "./types";

export interface GitConfigEntry {
  key: string;
  value: string;
}

export function readInsteadOfConfigs(): string[] {
  try {
    return execFileSync(
      "git",
      ["config", "--get-regexp", "^url\\..*\\.insteadOf$"],
      { encoding: "utf8" }
    )
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

export function hasOverridingInsteadOf(
  entries: RepoEntry[],
  configs: string[]
): boolean {
  return entries.some((entry) => {
    const repoUrl = `https://${entry.host}/${entry.repo}`;
    return configs.some((line) => {
      const match = line.match(/^url\.(.+)\.insteadof\s+(.+)$/i);
      if (!match) return false;

      const replacement = trimGitSuffix(match[1]);
      const prefix = trimGitSuffix(match[2]);
      return repoUrl.startsWith(prefix) && replacement !== prefix;
    });
  });
}

export function buildPrivateRepoIdentityRewrites(
  entries: RepoEntry[]
): GitConfigEntry[] {
  return entries.flatMap((entry) => {
    const base = `https://${entry.host}/${entry.repo}`;
    return [
      { key: `url.${base}.insteadOf`, value: base },
      { key: `url.${base}/.insteadOf`, value: `${base}/` },
      { key: `url.${base}.git.insteadOf`, value: `${base}.git` },
    ];
  });
}

function trimGitSuffix(value: string): string {
  return value.replace(/\.git$/, "");
}
