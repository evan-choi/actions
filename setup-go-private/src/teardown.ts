import * as core from "@actions/core";
import fs from "node:fs";

async function run(): Promise<void> {
  const files = ["helperPath", "configPath", "netrcPath"];

  for (const key of files) {
    const filePath = core.getState(key);
    if (filePath) {
      try {
        fs.unlinkSync(filePath);
        core.info(`Removed: ${filePath}`);
      } catch {
        core.warning(`Failed to remove: ${filePath}`);
      }
    }
  }

  core.info("Cleanup complete");
}

run();
