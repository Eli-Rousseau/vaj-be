import { exec } from "child_process";
import { copyFile } from "fs";
import { loadStage } from "../../../scripts/utils/stage"

import { rl, askQuestion } from "../../../scripts/utils/prompt";

async function main() {
  // Start by loading the stage variable
  loadStage();

  // Import the environment variables
  const DATABASE: string = process.env.DATABASE_NAME || "vintage_archive_jungle";
  const HOST: string = process.env.DATABSE_HOST || "localhost";
  const PORT: string = process.env.DATABASE_PORT || "5432";
  const USER: string = process.env.DATABSE_USER || "administrator";

  // Readin user input
  const database: string =
    (await askQuestion(`Database name (default: ${DATABASE}): `)) || DATABASE;
  const host: string =
    (await askQuestion(`Host name (default: ${HOST}): `)) || HOST;
  const port: string = (await askQuestion(`Port (default: ${PORT}): `)) || PORT;
  const user: string = (await askQuestion(`User (default: ${USER}): `)) || USER;
  const schemaOnly: boolean =
    /y/i.test(await askQuestion("Schema-only backup (default: no): ")) || false;

  // Close the input stream
  rl.close();

  // Define the output file
  const timestamp: Date = new Date();
  const output: string = `./database/backups/${
    schemaOnly ? "schema-only" : "full"
  }/database_backup.tar`;

  // Format the backup command string
  const command: string = `pg_dump -d ${database} -h ${host} -p ${port} -U ${user} -F tar -f ${output} ${
    schemaOnly ? "-s" : ""
  }`;

  // Start the backup subprocess
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(
        `\x1b[31m[ERROR]\x1b[0m The backup process failed: ${error}`
      );
      return;
    }

    if (stderr) {
      console.error(
        `\x1b[31m[DEBUG]\x1b[0m The backup process generated an error stream: ${stderr}`
      );
      return;
    }

    console.log(
      `\x1b[31m[DEBUG]\x1b[0m The backup process terminated with an output stream: ${stdout}`
    );

    // Copy the output file to the history directory
    const copy: string = `./database/backups/${
      schemaOnly ? "schema-only" : "full"
    }/history/${timestamp.toISOString()}.tar`;
    copyFile(output, copy, (error) => {
      if (error) {
        console.error(
          `\x1b[31m[ERROR]\x1b[0m The backup file could not be copied: ${error}`
        );
        return;
      }

      console.log(
        `\x1b[31m[INFO]\x1b[0m The backup file was copied to the history directory.`
      );
    });
  });
}

export default main;

main();
