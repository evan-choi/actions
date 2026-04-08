import * as core from "@actions/core";
import fs from "node:fs";
import path from "node:path";
import { parseRepos } from "./config";
import { createCredentialsConfig, getHelperSource } from "./credential-helper";

async function run(): Promise<void> {
  try {
    const token = core.getInput("token", { required: true });
    const reposInput = core.getInput("repos", { required: true });

    const runnerTemp = process.env.RUNNER_TEMP;
    if (!runnerTemp) {
      throw new Error("RUNNER_TEMP 환경변수가 설정되지 않았습니다");
    }

    // 1. repos 파싱
    const entries = parseRepos(reposInput, token);
    core.info(`${entries.length}개 private repo 설정됨`);

    // 2. credential helper 스크립트 작성
    const helperPath = path.join(runnerTemp, "go-private-credential-helper.js");
    fs.writeFileSync(helperPath, getHelperSource(), { mode: 0o755 });
    core.saveState("helperPath", helperPath);

    // 3. credentials 설정 파일 작성
    const configPath = path.join(runnerTemp, "go-private-credentials.json");
    const config = createCredentialsConfig(entries);
    fs.writeFileSync(configPath, JSON.stringify(config));
    core.saveState("configPath", configPath);

    // 4. 환경변수 설정

    // git credential 프롬프트 비활성화
    core.exportVariable("GIT_TERMINAL_PROMPT", "0");

    // 환경변수 기반 git config로 credential helper 등록
    // Key 0: 시스템 credential helper 초기화 (빈 값으로 리셋)
    // Key 1: 우리 credential helper 등록
    // Key 2: useHttpPath 활성화 (git이 repo 경로를 helper에 전달하도록)
    const existingCount = parseInt(
      process.env.GIT_CONFIG_COUNT || "0",
      10
    );
    const base = existingCount;

    core.exportVariable("GIT_CONFIG_COUNT", String(base + 3));
    core.exportVariable(`GIT_CONFIG_KEY_${base}`, "credential.helper");
    core.exportVariable(`GIT_CONFIG_VALUE_${base}`, "");
    core.exportVariable(`GIT_CONFIG_KEY_${base + 1}`, "credential.helper");

    const escapedHelperPath = helperPath.replace(/\\/g, "/");
    core.exportVariable(
      `GIT_CONFIG_VALUE_${base + 1}`,
      `!node "${escapedHelperPath}"`
    );
    core.exportVariable(`GIT_CONFIG_KEY_${base + 2}`, "credential.useHttpPath");
    core.exportVariable(`GIT_CONFIG_VALUE_${base + 2}`, "true");

    // GOPRIVATE — 기존 값에 추가
    const existingGoPrivate = process.env.GOPRIVATE || "";
    const newEntries = entries
      .map((e) => `${e.host}/${e.repo}`)
      .join(",");
    const goprivate = existingGoPrivate
      ? `${existingGoPrivate},${newEntries}`
      : newEntries;
    core.exportVariable("GOPRIVATE", goprivate);

    core.info("private Go 모듈 인증 설정 완료");
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    }
  }
}

run();
