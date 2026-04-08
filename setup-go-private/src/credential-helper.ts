import type { RepoEntry, CredentialsConfig } from "./types";

/**
 * RepoEntry 배열로부터 credentials 설정을 생성한다.
 * 형식: { [host]: { [owner/repo]: token } }
 */
export function createCredentialsConfig(
  entries: RepoEntry[]
): CredentialsConfig {
  const config: CredentialsConfig = {};
  for (const entry of entries) {
    if (!config[entry.host]) {
      config[entry.host] = {};
    }
    config[entry.host][entry.repo] = entry.token;
  }
  return config;
}

/**
 * git credential helper로 동작하는 독립 Node.js 스크립트의 소스 코드를 반환한다.
 *
 * 같은 디렉토리의 go-private-credentials.json을 읽어
 * git credential "get" 요청에 응답한다.
 */
export function getHelperSource(): string {
  return `#!/usr/bin/env node
"use strict";
const fs = require("fs");
const path = require("path");
const readline = require("readline");

// "get"만 처리 — "store"와 "erase"는 무시
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
  const hostConfig = config[fields.host];
  if (!hostConfig) {
    process.exit(0);
  }

  const repoPath = (fields.path || "").replace(/\\.git$/, "");
  const token = hostConfig[repoPath];

  if (!token) {
    process.exit(0);
  }

  process.stdout.write("username=x-access-token\\n");
  process.stdout.write("password=" + token + "\\n");
  process.exit(0);
});
`;
}
