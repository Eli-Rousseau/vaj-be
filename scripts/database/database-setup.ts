import { cwd } from "process";
import path from "path";

import { runCommand } from "../../src/utils/process";
import { loadStage } from "../../src/utils/stage";
import getLogger from "../../src/utils/logger";

const logger = getLogger({
    source: "scripts",
    module: path.basename(__filename)
});

async function dropDatabase(args: {
    database: string,
    defaultUserName: string,
    defaultUserPassword: string,
    host: string,
    port: string
}) {
    const {database, defaultUserName, defaultUserPassword, host, port} = args;
    const dropCommand = `export PGPASSWORD='${defaultUserPassword}'; dropdb -h ${host} -p ${port} -U ${defaultUserName} -f ${database}; unset PGPASSWORD`;
    await runCommand(dropCommand, "Database drop");
}

async function createDatabase(args: {
    defaultDatabase: string,
    defaultUserName: string,
    defaultUserPassword: string,
    host: string,
    port: string
}) {
    const {defaultDatabase, defaultUserName, defaultUserPassword, host, port} = args;
    const dbScript = `${cwd()}/src/database/setup/add_database.sql`;
    const dbCommand = `export PGPASSWORD='${defaultUserPassword}'; psql -h ${host} -p ${port} -U ${defaultUserName} -d ${defaultDatabase} -f "${dbScript}"; unset PGPASSWORD`;
    await runCommand(dbCommand, "Database creation");
}

async function createSchema(args: {
    database: string,
    defaultUserName: string,
    defaultUserPassword: string,
    host: string,
    port: string
}) {
    const {database, defaultUserName, defaultUserPassword, host, port} = args;
    const schemaScript = `${cwd()}/src/database/setup/add_schema.sql`;
    const schemaCommand = `export PGPASSWORD='${defaultUserPassword}'; psql -h ${host} -p ${port} -U ${defaultUserName} -d ${database} -f "${schemaScript}"; unset PGPASSWORD`;
    await runCommand(schemaCommand, "Schema creation");
}

async function createMigrationTable(args: {
    database: string,
    defaultUserName: string,
    defaultUserPassword: string,
    host: string,
    port: string
}) {
    const {database, defaultUserName, defaultUserPassword, host, port} = args;
    const tableScript = `${cwd()}/src/database/setup/add_migration_table.sql`;
    const tableCommand = `export PGPASSWORD='${defaultUserPassword}'; psql -h ${host} -p ${port} -U ${defaultUserName} -d ${database} -f "${tableScript}"; unset PGPASSWORD`;
    await runCommand(tableCommand, "Migration table creation");
}

async function createUser(args: {
    database: string,
    defaultUserName: string,
    defaultUserPassword: string,
    host: string,
    port: string,
    newUserName: string,
    newUserPassword: string
}) {
    const { database, defaultUserName, defaultUserPassword, host, port, newUserName, newUserPassword } = args;
    const userScript = `${cwd()}/src/database/setup/add_user.sql`;
    const tableCommand = `export PGPASSWORD='${defaultUserPassword}'; psql -h ${host} -p ${port} -U ${defaultUserName} -d ${database} -v username="${newUserName}" -v password="'${newUserPassword}'" -f "${userScript}"; unset PGPASSWORD`;
    await runCommand(tableCommand, "New user creation");
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
    const administratorUserPassword = process.env.DATABASE_ADMINISTRATOR_USER_PASSWORD;

    if (!host || !port || !defaultUserPassword || !defaultUserName || !defaultDatabase || !database || !administratorUserName || !administratorUserPassword) {
        logger.error("Missing required environment variables: DATABASE_DEFAULT_USER_PASSWORD, DATABASE_DEFAULT_USER_NAME, DATABASE_DEFAULT, DATABASE_HOST, DATBASE_PORT, DATABASE_VAJ, DATABASE_ADMINISTRATOR_USER_NAME, or DATABASE_ADMINISTRATOR_USER_PASSWORD.");
        process.exit(1);
    }

    await dropDatabase({ database, defaultUserName, defaultUserPassword, host, port });
    await createDatabase({ defaultDatabase, defaultUserName, defaultUserPassword, host, port });
    await createSchema({ database, defaultUserName, defaultUserPassword, host, port });
    await createMigrationTable({ database, defaultUserName, defaultUserPassword, host, port });
    await createUser({ database, defaultUserName, defaultUserPassword, host, port, newUserName: administratorUserName, newUserPassword: administratorUserPassword });

    logger.info("Finished database setup.")
}

main();