import path from "path";

import { exec } from "child_process";
import { promisify } from "util";
import getLogger from "./logger";

const logger = getLogger({
  source: "utils",
  module: path.basename(__filename)
});

const execAsync = promisify(exec);

export async function runCommand(command: string, processName: string) {
  try {
    const { stdout, stderr } = await execAsync(command);
    if (stderr) logger.warn(stderr);
    logger.info(`${processName} finished successfully.`);
    if (stdout) logger.info(stdout);
  } catch (error) {
    logger.error(`${processName} failed: ${error}`);
    process.exit(1);
  }
}
