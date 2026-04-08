import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import {
  getHelperSource,
  createCredentialsConfig,
} from "../credential-helper";
import type { CredentialsConfig } from "../types";

describe("createCredentialsConfig", () => {
  it("creates config from host and repo entries", () => {
    const config = createCredentialsConfig("github.com", [
      { repo: "org/repo-a", token: "token-a" },
      { repo: "org/repo-b", token: "token-b" },
    ]);
    expect(config).toEqual({
      host: "github.com",
      repos: {
        "org/repo-a": "token-a",
        "org/repo-b": "token-b",
      },
    });
  });
});

describe("credential helper script", () => {
  let tmpDir: string;
  let helperPath: string;
  let configPath: string;

  const config: CredentialsConfig = {
    host: "github.com",
    repos: {
      "org/repo-a": "token-aaa",
      "org/repo-b": "token-bbb",
    },
  };

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "go-private-test-"));
    helperPath = path.join(tmpDir, "credential-helper.js");
    configPath = path.join(tmpDir, "go-private-credentials.json");
    fs.writeFileSync(helperPath, getHelperSource());
    fs.writeFileSync(configPath, JSON.stringify(config));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  function runHelper(operation: string, stdin: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const child = spawn("node", [helperPath, operation], { cwd: tmpDir });
      let stdout = "";
      child.stdout.on("data", (data: Buffer) => {
        stdout += data.toString();
      });
      child.on("close", () => resolve(stdout));
      child.on("error", reject);
      child.stdin.write(stdin);
      child.stdin.end();
    });
  }

  it("returns credentials for a matching repo", async () => {
    const stdin = "protocol=https\nhost=github.com\npath=org/repo-a.git\n\n";
    const stdout = await runHelper("get", stdin);
    expect(stdout).toContain("username=x-access-token");
    expect(stdout).toContain("password=token-aaa");
  });

  it("returns credentials without .git suffix", async () => {
    const stdin = "protocol=https\nhost=github.com\npath=org/repo-b\n\n";
    const stdout = await runHelper("get", stdin);
    expect(stdout).toContain("password=token-bbb");
  });

  it("returns empty for non-matching repo", async () => {
    const stdin =
      "protocol=https\nhost=github.com\npath=org/unknown-repo\n\n";
    const stdout = await runHelper("get", stdin);
    expect(stdout.trim()).toBe("");
  });

  it("returns empty for non-matching host", async () => {
    const stdin =
      "protocol=https\nhost=gitlab.com\npath=org/repo-a.git\n\n";
    const stdout = await runHelper("get", stdin);
    expect(stdout.trim()).toBe("");
  });

  it("ignores store operation", async () => {
    const stdout = await runHelper("store", "protocol=https\nhost=github.com\n\n");
    expect(stdout.trim()).toBe("");
  });

  it("ignores erase operation", async () => {
    const stdout = await runHelper("erase", "protocol=https\nhost=github.com\n\n");
    expect(stdout.trim()).toBe("");
  });
});
