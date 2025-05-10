import { cwd } from "process";

import { askQuestionWithHiddenInput, rl } from "../../../scripts/utils/prompt";
import { loadStage } from "../../../scripts/utils/stage";
import { runSqlScript } from "../../../scripts/utils/sql";

async function main() {
  // Loading the stage environment
  await loadStage();

  // Import the environmental variables
  const databasePort: string = process.env.DATABASE_PORT || "";
  const databaseHost: string = process.env.DATABASE_HOST || "";

  const databaseVAJ: string = process.env.DATABASE_VAJ || "";
  const databaseAdminUserName: string =
    process.env.DATABASE_ADMINISTRATOR_USER_NAME || "";
  const databaseAdminUserPassword: string =
    process.env.DATABASE_ADMINISTRATOR_USER_PASSWORD || "";

  const databaseDefault: string = process.env.DATABASE_DEFAULT || "";
  const databaseDefaultUserName: string =
    process.env.DATABASE_DEFAULT_USER_NAME || "";
  const databaseDefaultUserPassword: string =
    process.env.DATABASE_DEFAULT_USER_PASSWORD || "";

  let password: string = "";
  while (!password) {
    password =
      (await askQuestionWithHiddenInput(
        "Enter a password to setup the administrator user"
      )) || "";
  }

  // Close the input stream
  rl.close();

  // Define the database creation script and command
  const dbScript = `${cwd()}/database/scripts/create/database/vintage_archive_jungle.sql`;
  const dbCommand = `export PGPASSWORD='${databaseDefaultUserPassword}'; psql -h ${databaseHost} -p ${databasePort} -U ${databaseDefaultUserName} -d ${databaseDefault} -f "${dbScript}"; unset PGPASSWORD`;

  // Define the schema creation script and command
  const schemaScript = `${cwd()}/database/scripts/create/schema/shop.sql`;
  const schemaCommand = `export PGPASSWORD='${databaseDefaultUserPassword}'; psql -h ${databaseHost} -p ${databasePort} -U ${databaseDefaultUserName} -d ${databaseDefault} -f "${schemaScript}"; unset PGPASSWORD`;

  // Define the admininistrator user creation script and command
  const userScript = `${cwd()}/database/scripts/create/user/administrator.sql`;
  const userCommand = `export PGPASSWORD='${databaseDefaultUserPassword}'; psql -h ${databaseHost} -p ${databasePort} -U ${databaseDefaultUserName} -d ${databaseVAJ} -v password="'${password}'" -f "${userScript}"; unset PGPASSWORD`;

  // Running the setup scripts
  await runSqlScript(dbCommand, "Database creation");
  await runSqlScript(schemaCommand, "Schema creation");
  await runSqlScript(userCommand, "Administrator user creation");
}

main();
