import * as fs from "fs";
import * as path from "path";

enum Stage {
  dev = "dev",
  prod = "prod",
}

// Helper function that loads the development or production variables
function loadStage(): void {
  // Determine the stage from the command arguments
  const stage: Stage = process.argv.includes("prod") ? Stage.prod : Stage.dev;

  // Retrieve the root directory
  const root: string = process.cwd();

  // Read the file system on the root directory
  fs.readdir(root, (error, files) => {
    if (error) {
      console.error(
        `\x1b[31m[ERROR]\x1b[0m Unable to read files from project root: ${error}`
      );
      return;
    }

    // Filter the list of files to the relevant environmental stage files
    const envFiles: string[] = files.filter((file) => {
      return file.includes(`${stage}`) && file.includes(".env");
    });

    // Initialize a variables map
    const variables: Map<string, string> = new Map();

    // Read in the variables from the enviromental files
    envFiles.forEach((fileName) => {
      const filePath: string = path.join(root, fileName);

      fs.readFile(filePath, "utf-8", (error, data) => {
        if (error) {
          console.error(
            `\x1b[31m[ERROR]\x1b[0m Could not read file ${fileName}: ${error}`
          );
          return;
        }

        const lines: string[] = data.split(/\n/);
        lines.forEach((line) => {
          const match = line.match(/^([A-Z0-9_]+)=(.+)$/);
          if (match) {
            const key = match[1];
            const value = match[2];
            variables.set(key, value);
          }
        });
      });

      // After processing all files, set the process.env variables
      variables.forEach((value, key) => {
        process.env[key] = value;
      });
    });
  });
}

export { loadStage };
