import * as fs from "fs";
import * as path from "path";

import Logger from "./logger";

enum Stage {
  dev = "dev",
  prod = "prod",
}

// Async helper function for loading the environmental variables
function loadStage(): Promise<void> {
  return new Promise((resolve, reject) => {
    // Determine the stage from the command arguments
    const stage: Stage = process.argv.includes("prod") ? Stage.prod : Stage.dev;

    // Saving the stage to process.env
    process.env["STAGE"] = stage;
    Logger.debug(`Loading the ${stage} environmental variables.`);

    // Determine the root of the project
    const root: string = process.cwd();

    // Read the content of the root
    fs.readdir(root, (error, files) => {
      if (error) {
        Logger.error(`Unable to read files from project root: ${error}`);
        return reject(error);
      }

      // Filter the relevant .env files
      const envFiles: string[] = files.filter((file) => {
        return file.includes(`${stage}`) && file.includes(".env");
      });

      // Initialize a variable map
      const variables: Map<string, string> = new Map();

      // Number of env files
      let filesLeft = envFiles.length;

      if (filesLeft === 0) {
        Logger.warning(`No environment files found for stage '${stage}'.`);
        return resolve();
      }

      envFiles.forEach((fileName) => {
        const filePath: string = path.join(root, fileName);

        // Reading the variables from the file content
        fs.readFile(filePath, "utf-8", (error, data) => {
          if (error) {
            Logger.error(`Could not read file ${fileName}: ${error}`);
          } else {
            const lines: string[] = data.split(/\n/);
            lines.forEach((line) => {
              const match = line.match(/^([A-Z0-9_]+)=(.+)$/);
              if (match) {
                const key = match[1];
                const value = match[2];
                variables.set(key, value);
              }
            });
          }

          filesLeft--;

          // Save the variables in the process.env
          if (filesLeft === 0) {
            variables.forEach((value, key) => {
              process.env[key] = value;
            });
            Logger.info(`Loaded ${variables.size} environment variables.`);
            resolve();
          }
        });
      });
    });
  });
}

export { loadStage };
