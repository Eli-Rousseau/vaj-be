import { cwd } from "process";

import { runCommand } from "@/core/process";
import { loadStage } from "@/core/stage";
import { logger } from "@/core/logger";
import { askQuestion } from "@/core/prompt";

const LOGGER = logger.get();

async function isAlreadySetup(args: {
  database: string;
  defaultUserName: string;
  defaultUserPassword: string;
  host: string;
  port: string;
}) {
  const script = `${cwd()}/src/be/database/setup/is_already_setup.sql`;
  const { database, defaultUserName, defaultUserPassword, host, port } = args;
  const command = `export PGPASSWORD='${defaultUserPassword}'; psql -h ${host} -p ${port} -U ${defaultUserName} -d ${database} -f "${script}"; unset PGPASSWORD`;
  const result = await runCommand(command, "Setup already completed check");
  return result && result.split('\n')[2].trim() === 't' ? true : false;
}

async function dropDatabase(args: {
  database: string;
  defaultUserName: string;
  defaultUserPassword: string;
  host: string;
  port: string;
}) {
  const { database, defaultUserName, defaultUserPassword, host, port } = args;
  const command = `export PGPASSWORD='${defaultUserPassword}'; dropdb -h ${host} -p ${port} -U ${defaultUserName} -f ${database}; unset PGPASSWORD`;
  await runCommand(command, "Database drop");
}

async function createDatabase(args: {
  defaultDatabase: string;
  defaultUserName: string;
  defaultUserPassword: string;
  host: string;
  port: string;
}) {
  const { defaultDatabase, defaultUserName, defaultUserPassword, host, port } =
    args;
  const script = `${cwd()}/src/be/database/setup/add_database.sql`;
  const command = `export PGPASSWORD='${defaultUserPassword}'; psql -h ${host} -p ${port} -U ${defaultUserName} -d ${defaultDatabase} -f "${script}"; unset PGPASSWORD`;
  await runCommand(command, "Database creation");
}

async function createSchema(args: {
  database: string;
  defaultUserName: string;
  defaultUserPassword: string;
  host: string;
  port: string;
}) {
  const { database, defaultUserName, defaultUserPassword, host, port } = args;
  const script = `${cwd()}/src/be/database/setup/add_schema.sql`;
  const command = `export PGPASSWORD='${defaultUserPassword}'; psql -h ${host} -p ${port} -U ${defaultUserName} -d ${database} -f "${script}"; unset PGPASSWORD`;
  await runCommand(command, "Schema creation");
}

async function createMigrationTable(args: {
  database: string;
  defaultUserName: string;
  defaultUserPassword: string;
  host: string;
  port: string;
}) {
  const { database, defaultUserName, defaultUserPassword, host, port } = args;
  const script = `${cwd()}/src/be/database/setup/add_migration_table.sql`;
  const command = `export PGPASSWORD='${defaultUserPassword}'; psql -h ${host} -p ${port} -U ${defaultUserName} -d ${database} -f "${script}"; unset PGPASSWORD`;
  await runCommand(command, "Migration table creation");
}

async function createUser(args: {
  database: string;
  defaultUserName: string;
  defaultUserPassword: string;
  host: string;
  port: string;
  newUserName: string;
  newUserPassword: string;
}) {
  const {
    database,
    defaultUserName,
    defaultUserPassword,
    host,
    port,
    newUserName,
    newUserPassword,
  } = args;
  const script = `${cwd()}/src/be/database/setup/add_user.sql`;
  const command = `export PGPASSWORD='${defaultUserPassword}'; psql -h ${host} -p ${port} -U ${defaultUserName} -d ${database} -v username="${newUserName}" -v password="'${newUserPassword}'" -f "${script}"; unset PGPASSWORD`;
  await runCommand(command, "New user creation");
}

async function main() {
  await loadStage();

  const host = process.env.DATABASE_HOST;
  const port = process.env.DATABASE_PORT;

  const defaultDatabase = process.env.DATABASE_DEFAULT;
  const defaultUserName = process.env.DATABASE_DEFAULT_USER_NAME;
  const defaultUserPassword = process.env.DATABASE_DEFAULT_USER_PASSWORD;

  const database = process.env.DATABASE_VAJ;
  const administratorUserName = process.env.DATABASE_ADMINISTRATOR_USER_NAME;
  const administratorUserPassword =
    process.env.DATABASE_ADMINISTRATOR_USER_PASSWORD;

  if (
    !host ||
    !port ||
    !defaultUserPassword ||
    !defaultUserName ||
    !defaultDatabase ||
    !database ||
    !administratorUserName ||
    !administratorUserPassword
  ) {
    LOGGER.error(
      "Missing required environment variables: DATABASE_DEFAULT_USER_PASSWORD, DATABASE_DEFAULT_USER_NAME, DATABASE_DEFAULT, DATABASE_HOST, DATBASE_PORT, DATABASE_VAJ, DATABASE_ADMINISTRATOR_USER_NAME, or DATABASE_ADMINISTRATOR_USER_PASSWORD.",
    );
    process.exit(1);
  }

  const exists = await isAlreadySetup({
    database,
    defaultUserName,
    defaultUserPassword,
    host,
    port
  });

  if (exists) {
    const answer = await askQuestion(
      `The database appears to already have been setup properly. Do you really want to proceed with this setup? Any existing data will be erased.`,
      "no"
    );
    if (answer.trim().toLowerCase().startsWith("n")) process.exit(0);
  }

  await dropDatabase({
    database,
    defaultUserName,
    defaultUserPassword,
    host,
    port,
  });
  await createDatabase({
    defaultDatabase,
    defaultUserName,
    defaultUserPassword,
    host,
    port,
  });
  await createSchema({
    database,
    defaultUserName,
    defaultUserPassword,
    host,
    port,
  });
  await createMigrationTable({
    database,
    defaultUserName,
    defaultUserPassword,
    host,
    port,
  });
  await createUser({
    database,
    defaultUserName,
    defaultUserPassword,
    host,
    port,
    newUserName: administratorUserName,
    newUserPassword: administratorUserPassword,
  });

  LOGGER.info("Finished database setup.");
}

main();
