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
  it("RepoEntry 배열로 호스트별 config 생성", () => {
    const config = createCredentialsConfig([
      { host: "github.com", repo: "org/repo-a", token: "token-a" },
      { host: "github.com", repo: "org/repo-b", token: "token-b" },
      { host: "ghe.company.com", repo: "org/repo-c", token: "token-c" },
    ]);
    expect(config).toEqual({
      "github.com": {
        "org/repo-a": "token-a",
        "org/repo-b": "token-b",
      },
      "ghe.company.com": {
        "org/repo-c": "token-c",
      },
    });
  });
});

describe("credential helper 스크립트", () => {
  let tmpDir: string;
  let helperPath: string;
  let configPath: string;

  const config: CredentialsConfig = {
    "github.com": {
      "org/repo-a": "token-aaa",
      "org/repo-b": "token-bbb",
    },
    "ghe.company.com": {
      "org/repo-c": "token-ccc",
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

  it("매칭되는 repo의 credential 반환", async () => {
    const stdin = "protocol=https\nhost=github.com\npath=org/repo-a.git\n\n";
    const stdout = await runHelper("get", stdin);
    expect(stdout).toContain("username=x-access-token");
    expect(stdout).toContain("password=token-aaa");
  });

  it(".git 접미사 없이도 매칭", async () => {
    const stdin = "protocol=https\nhost=github.com\npath=org/repo-b\n\n";
    const stdout = await runHelper("get", stdin);
    expect(stdout).toContain("password=token-bbb");
  });

  it("다른 호스트의 repo도 매칭", async () => {
    const stdin = "protocol=https\nhost=ghe.company.com\npath=org/repo-c.git\n\n";
    const stdout = await runHelper("get", stdin);
    expect(stdout).toContain("password=token-ccc");
  });

  it("미등록 repo는 빈 응답", async () => {
    const stdin =
      "protocol=https\nhost=github.com\npath=org/unknown-repo\n\n";
    const stdout = await runHelper("get", stdin);
    expect(stdout.trim()).toBe("");
  });

  it("미등록 호스트는 빈 응답", async () => {
    const stdin =
      "protocol=https\nhost=gitlab.com\npath=org/repo-a.git\n\n";
    const stdout = await runHelper("get", stdin);
    expect(stdout.trim()).toBe("");
  });

  it("store 무시", async () => {
    const stdout = await runHelper("store", "protocol=https\nhost=github.com\n\n");
    expect(stdout.trim()).toBe("");
  });

  it("erase 무시", async () => {
    const stdout = await runHelper("erase", "protocol=https\nhost=github.com\n\n");
    expect(stdout.trim()).toBe("");
  });
});
