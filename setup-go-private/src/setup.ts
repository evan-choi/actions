import * as core from "@actions/core";
import fs from "node:fs";
import path from "node:path";
import { parseRepos } from "./config";
import { createCredentialsConfig, getHelperSource } from "./credential-helper";

async function run(): Promise<void> {
  try {
    const token = core.getInput("token", { required: true });
    const reposInput = core.getInput("repos", { required: true });
    const host = core.getInput("host") || "github.com";

    const runnerTemp = process.env.RUNNER_TEMP;
    if (!runnerTemp) {
      throw new Error("RUNNER_TEMP environment variable is not set");
    }

    // 1. Parse repos
    const entries = parseRepos(reposInput, token);
    core.info(`Configured ${entries.length} private repo(s) on ${host}`);

    // 2. Write credential helper script
    const helperPath = path.join(runnerTemp, "go-private-credential-helper.js");
    fs.writeFileSync(helperPath, getHelperSource(), { mode: 0o755 });
    core.saveState("helperPath", helperPath);

    // 3. Write credentials config
    const configPath = path.join(runnerTemp, "go-private-credentials.json");
    const config = createCredentialsConfig(host, entries);
    fs.writeFileSync(configPath, JSON.stringify(config));
    core.saveState("configPath", configPath);

    // 4. Write .netrc (for HTTP discovery on custom hosts)
    const netrcPath = path.join(runnerTemp, ".netrc");
    fs.writeFileSync(
      netrcPath,
      `machine ${host} login x-access-token password ${token}\n`,
      { mode: 0o600 }
    );
    core.saveState("netrcPath", netrcPath);

    // 5. Configure environment variables

    // Prevent git from prompting for credentials
    core.exportVariable("GIT_TERMINAL_PROMPT", "0");

    // Configure git credential helper via env-based config
    // Key 0: clear system credential helpers (empty value resets the list)
    // Key 1: register our credential helper
    // Key 2: enable useHttpPath so git sends the repo path to the helper
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

    // .netrc for HTTP discovery
    core.exportVariable("NETRC", netrcPath);

    // GOPRIVATE — append to existing value
    const existingGoPrivate = process.env.GOPRIVATE || "";
    const newEntries = entries
      .map((e) => `${host}/${e.repo}`)
      .join(",");
    const goprivate = existingGoPrivate
      ? `${existingGoPrivate},${newEntries}`
      : newEntries;
    core.exportVariable("GOPRIVATE", goprivate);

    core.info("Private Go module authentication configured successfully");
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    }
  }
}

run();
