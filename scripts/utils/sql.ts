import { exec } from "child_process";
import { promisify } from "util";

import Logger from "./logger";

const execAsync = promisify(exec);

async function runSqlScript(command: string, stepName: string) {
  try {
    const { stdout, stderr } = await execAsync(command);
    if (stderr) {
      Logger.debug(`${stepName} generated an error stream:\n${stderr}`);
      process.exit(1);
    }
    Logger.info(`${stepName} finished successfully.`);
    if (stdout) {
      Logger.debug(`${stepName} generated an output stream:\n${stdout}`);
    }
  } catch (error) {
    Logger.error(`${stepName} failed: ${error}`);
    process.exit(1);
  }
}

export { runSqlScript };
