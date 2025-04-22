import { exec } from "child_process";
import { copyFile } from "fs";

import { rl, askQuestion } from "../../../scripts/utils/prompt";

async function main() {
  // Readin user input
  const database: string = await askQuestion(
    "Database name (default: vintage_archive_jungle): "
  );
  const host: string = await askQuestion("Host name (default: localhost): ");
  const port: string = await askQuestion("Port (default: 5432): ");
  const user: string = await askQuestion("User (default: administrator): ");
  const schema: string = await askQuestion(
    "Schema-only backup (default: no): "
  );

  // Close the input stream
  rl.close();

  // Determine whether backup requires to be schema-only
  const schemaOnly = /y/i.test(schema) || false;

  // Define the output file
  const timestamp: Date = new Date();
  const output: string = `./database/backups/${
    schemaOnly ? "schema-only" : "full"
  }/database_backup.tar`;

  // Format the backup command string
  const command: string = `pg_dump -d ${
    database || "vintage_archive_jungle"
  } -h ${host || "localhost"} -p ${port || "5432"} -U ${
    user || "administrator"
  } -F tar -f ${output} ${schemaOnly ? "-s" : ""}`;

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

main();
