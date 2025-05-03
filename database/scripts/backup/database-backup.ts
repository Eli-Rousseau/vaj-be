import { copyFile } from "fs";
import { loadStage } from "../../../scripts/utils/stage";

import Logger from "../../../scripts/utils/logger";
import { rl, askQuestion } from "../../../scripts/utils/prompt";
import { runSqlScript } from "../../../scripts/utils/sql";

async function main() {
  // Loading the stage variable
  await loadStage();

  // Import the environment variables
  const DATABASE: string =
    process.env.DATABASE_NAME || "vintage_archive_jungle";
  const HOST: string = process.env.DATABSE_HOST || "localhost";
  const PORT: string = process.env.DATABASE_PORT || "5432";
  const USER: string = process.env.DATABSE_USER || "administrator";
  const STAGE: string = process.env.STAGE || "dev";

  // Readin user input
  const database: string =
    (await askQuestion(`Database name (default: ${DATABASE}): `)) || DATABASE;
  const host: string =
    (await askQuestion(`Host name (default: ${HOST}): `)) || HOST;
  const port: string = (await askQuestion(`Port (default: ${PORT}): `)) || PORT;
  const user: string = (await askQuestion(`User (default: ${USER}): `)) || USER;
  const schemaOnly: boolean =
    /y/i.test(
      await askQuestion("Schema-only backup [yes/no] (default: no): ")
    ) || false;

  // Close the input stream
  rl.close();

  // Define the output file
  const timestamp: Date = new Date();
  const output: string = `./database/backups/${
    schemaOnly ? "schema-only" : "full"
  }/database_backup_${STAGE === "dev" ? "dev" : "prod"}.tar`;

  // Format the backup command string
  const backupCommand: string = `pg_dump -d ${database} -h ${host} -p ${port} -U ${user} -F tar -f ${output} ${
    schemaOnly ? "-s" : ""
  }`;

  // Start the backup process
  await runSqlScript(backupCommand, "Database backup");

  // Copy the output file to the history directory
  const copy: string = `./database/backups/${
    schemaOnly ? "schema-only" : "full"
  }/history/${STAGE === "dev" ? "dev" : "prod"}/${timestamp.toISOString()}.tar`;
  copyFile(output, copy, (error) => {
    if (error) {
      Logger.error(`The database backup file could not be copied: ${error}`);
      process.exit(1);
    }

    Logger.info(`The backup file was copied to the history directory.`);
  });
}

main();
