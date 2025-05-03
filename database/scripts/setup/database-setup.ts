import { exec } from "child_process";
import { cwd } from "process";
import { promisify } from "util";

import { askQuestionWithHiddenInput, rl } from "../../../scripts/utils/prompt";
import { loadStage } from "../../../scripts/utils/stage";
import Logger from "../../../scripts/utils/logger";

const execAsync = promisify(exec);

async function runSqlScript(command: string, stepName: string) {
  try {
    const { stdout, stderr } = await execAsync(command);
    if (stderr) {
      Logger.debug(`${stepName} generated an error stream: ${stderr}`);
      process.exit(1);
    }
    Logger.info(`${stepName} finished successfully.`);
    if (stdout) {
      Logger.debug(`${stepName} generated an output stream: ${stdout}`);
    }
  } catch (error) {
    Logger.error(`${stepName} failed: ${error}`);
    process.exit(1);
  }
}

async function main() {
  // Loading the stage environment
  await loadStage();

  // Import the environmental variables
  const database: string = process.env.DATABASE_NAME || "vintage_archive_jungle";
  const user: string = process.env.DATABASE_USER || "administrator";
  const host: string = process.env.DATABSE_HOST || "localhost";
  const port: string = process.env.DATABASE_PORT || "5432";

  // Define the default database and user
  const defaultDatabase: string = "template1";
  const defaultUser: string = "postgres";

  // Readin the administrator user password
  let password: string = "";
  while (!password) {
    password =
      (await askQuestionWithHiddenInput(
        `Enter a password to setup the administrator user: `
      )) || "";
  }

  // Close the input stream
  rl.close();

  // Define the database creation script and command
  const dbScript = `${cwd()}/database/scripts/create/database/vintage_archive_jungle.sql`;
  const dbCommand = `psql -h ${host} -p ${port} -U ${defaultUser} -d ${defaultDatabase} -f "${dbScript}"`;

  // Define the schema creation script and command
  const schemaScript = `${cwd()}/database/scripts/create/schema/shop.sql`;
  const schemaCommand = `psql -h ${host} -p ${port} -U ${defaultUser} -d ${defaultDatabase} -f "${schemaScript}"`;

  // Define the admininistrator user creation script and command
  const userScript = `${cwd()}/database/scripts/create/user/administrator.sql`;
  const userCommand = `psql -h ${host} -p ${port} -U ${defaultUser} -d ${database} -v password="'${password}'" -f "${userScript}"`;

  // Running the setup scripts
  await runSqlScript(dbCommand, "Database Creation");
  await runSqlScript(schemaCommand, "Schema Creation");
  await runSqlScript(userCommand, "Administrator User Creation");
}

main();
