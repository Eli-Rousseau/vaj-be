import path from "path";

import { exec } from "child_process";
import { promisify } from "util";
import { logger } from "./logger";

const LOGGER = logger.get({
  source: "utils",
  module: path.basename(__filename)
});

const execAsync = promisify(exec);

export async function runCommand(command: string, processName: string) {
  try {
    const { stdout, stderr } = await execAsync(command);
    if (stderr) LOGGER.warn(stderr);
    LOGGER.info(`${processName} finished successfully.`);
    if (stdout) LOGGER.info(stdout);
  } catch (error) {
    LOGGER.error(`${processName} failed.`);
    throw error;
  }
}
