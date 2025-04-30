import { exec } from "child_process";
import { cwd } from "process";

import { askQuestionHiddenInput, rl } from "../../../scripts/utils/prompt";
import { loadStage } from "../../../scripts/utils/stage";
import Logger from "../../../scripts/utils/logger";

async function main() {
  // Loading the stage environment
  await loadStage();

  // Import the environmental variables
  const host: string = process.env.DATABSE_HOST || "localhost";
  const port: string = process.env.DATABASE_PORT || "5432";

  // Define the default database and user
  const defaultDatabase: string = "template1";
  const defaultUser: string = "postgres";

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

  // Format the setup command string
  const command: string = `psql -h ${host} -p ${port} -U ${defaultUser} -d ${defaultDatabase} -v password="'${password}'" -f "${path}"`;

  // Start the databse setup process
  exec(command, (error, stdout, stderr) => {
    if (error || stderr) {
      Logger.error(`The database setup process failed: ${error}`);
      if (stderr) {
        Logger.debug(
          `The database setup process generated an error stream: ${stderr}`
        );
      }
      return;
    }

    Logger.info("The database setup process finished successfully.");
    if (stdout) {
      Logger.debug(
        `The database setup process terminated with an output stream: ${stdout}`
      );
    }
  });
}

main();
