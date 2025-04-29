import { exec } from "child_process";
import { cwd } from "process";
import { readFile } from "fs/promises";

import { askQuestionHiddenInput, rl } from "../../../scripts/utils/prompt";
import { loadStage } from "../../../scripts/utils/stage";
import Logger from "../../../scripts/utils/logger";

async function main() {
  // Loading the stage environment
  await loadStage();

  // Import the environmental variables
  const host: string = process.env.DATABSE_HOST || "localhost";
  const port: string = process.env.DATABASE_PORT || "5432";
  const user: string = "postgres";
  const database: string = "template1";

  // Readin the administrator user password
  let password: string = "";
  while (!password) {
    password =
      (await askQuestionHiddenInput(
        `Enter a password to setup the administrator user: `
      )) || "";
  }

  // Close the input stream
  rl.close();

  // Define path to file
  const path: string = cwd() + "/database/scripts/setup/setup.sql";

  // Reading the database setup script
  let script: string;
  try {
    script = await readFile(path, "utf-8");
  } catch (error) {
    Logger.error(`Could not read file ${path}: ${error}`);
    return;
  }

  // Replace the password in the script
  script = script.replace(/my_password/, password);

  // Format the setup command string
  const command: string = `psql -h ${host} -p ${port} -U ${user} -d ${database} -c "${script}"`;

  // Start the databse setup process
  exec(command, (error, stdout, stderr) => {
    if (error) {
      let errorString: string = String(error);
      errorString = errorString.replace(new RegExp(password), "my_password");
      Logger.error(`The database setup process failed: ${errorString}`);
      return;
    }

    if (stderr) {
      let stderrString: string = String(stderr);
      stderrString = stderrString.replace(new RegExp(password), "my_password");
      Logger.error(
        `The database setup process generated an error stream: ${stderr}`
      );
      return;
    }

    Logger.debug(
      `The database setup process terminated with an output stream: ${stdout}`
    );
  });
}

main();
