import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function runSqlScript(command: string, stepName: string) {
  try {
    const { stdout, stderr } = await execAsync(command);
    if (stderr) {
      // Logger.debug(`${stepName} generated an error stream:\n${stderr}`);
    }
    // Logger.info(`${stepName} finished successfully.`);
    if (stdout) {
      // Logger.debug(`${stepName} generated an output stream:\n${stdout}`);
    }
  } catch (error) {
    // Logger.error(`${stepName} failed: ${error}`);
    process.exit(1);
  }
}
