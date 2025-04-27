import * as fs from "fs";
import * as path from "path";

enum Stage {
  dev = "dev",
  prod = "prod",
}

// Now loadStage returns a Promise
function loadStage(): Promise<void> {
  return new Promise((resolve, reject) => {
    const stage: Stage = process.argv.includes("prod") ? Stage.prod : Stage.dev;
    const root: string = process.cwd();

    fs.readdir(root, (error, files) => {
      if (error) {
        console.error(
          `\x1b[31m[ERROR]\x1b[0m Unable to read files from project root: ${error}`
        );
        return reject(error);
      }

      const envFiles: string[] = files.filter((file) => {
        return file.includes(`${stage}`) && file.includes(".env");
      });

      const variables: Map<string, string> = new Map();
      let filesLeft = envFiles.length;

      if (filesLeft === 0) {
        console.warn(`\x1b[33m[WARNING]\x1b[0m No environment files found for stage '${stage}'.`);
        return resolve();
      }

      envFiles.forEach((fileName) => {
        const filePath: string = path.join(root, fileName);

        fs.readFile(filePath, "utf-8", (error, data) => {
          if (error) {
            console.error(
              `\x1b[31m[ERROR]\x1b[0m Could not read file ${fileName}: ${error}`
            );
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

          if (filesLeft === 0) {
            variables.forEach((value, key) => {
              process.env[key] = value;
            });
            console.log(`\x1b[32m[INFO]\x1b[0m Loaded ${variables.size} environment variables.`);
            resolve();
          }
        });
      });
    });
  });
}

export { loadStage };
