import { readFile } from "fs/promises";
import * as path from "path";

import { loadStage } from "./utils/stage";
import { runSqlScript } from "./utils/sql";
import Logger from "./utils/logger";

const INDENT: string = " ".repeat(2);

type DefinitionRecord = {
  columnName: string;
  dataType: string;
  nullable: boolean;
};

function parseTableDefinition(tablePath: string): Promise<string> {
  return new Promise(async (resolve, reject) => {
    // Parse the table type from the file name
    const fileName: string = path.basename(tablePath);
    const tableName = fileName.match(/[A-Za-z_]+/);
    const typeName: string = tableName
      ? tableName[0]
          .split("_")
          .map(
            (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
          )
          .join("")
      : "";

    // Initialize the result variable
    const result: string = `type ${typeName} = {\n`;

    // Reading the table definition file
    let fileContent: string = "";
    try {
      fileContent = await readFile(tablePath, { encoding: "utf-8" });
    } catch (error) {
      Logger.error(`Reading the ${fileName} file failed: ${error}`);
      process.exit(1);
    }

    // Parsing the columns from the definition table
    let definitionTable: string[] = fileContent.split("\n");
    definitionTable = definitionTable.slice(1, definitionTable.length - 1);
    const definitionRecords: DefinitionRecord[] = definitionTable.map(
      (record) => {
        const splitRecord: string[] = record.split(",");
        return {
          columnName: splitRecord[0],
          dataType: splitRecord[1],
          nullable: splitRecord[2].match(/YES/) ? true : false,
        };
      }
    );

    //
  });
}

async function main() {
  // Loading the stage variables
  await loadStage();

  // Import the environment variables
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

  const stage: string = process.env.STAGE!;

  // Define the table names selection script and command
  const outputTableNames: string = `${process.cwd()}/api/types/table_names.csv`;
  const tableNamesScript: string = `${process.cwd()}/database/scripts/select/schema/tables.sql`;
  const tableNamesCommand: string = `export PGPASSWORD='${databaseDefaultUserPassword}'; psql -h ${databaseHost} -p ${databasePort} -U ${databaseDefaultUserName} -d ${databaseVAJ} -v file="'${outputTableNames}'" -f "${tableNamesScript}"; unset PGPASSWORD`;

  // Running the table names selection process
  await runSqlScript(tableNamesCommand, "Table names selection");

  // Reading the content of the tables file
  let tableNamesFileContent: string;
  try {
    tableNamesFileContent = await readFile(outputTableNames, {
      encoding: "utf-8",
    });
  } catch (error) {
    Logger.error(`Reading the table_names.txt file failed: ${error}`);
    process.exit(1);
  }

  // Parsing the table names
  let tableNames: string[] = tableNamesFileContent.split("\n");
  tableNames = tableNames.slice(1, tableNames.length - 1);

  // Itterate over the tables
  let tableTypes: string = "";
  for (let i = 0; i < tableNames.length; i++) {
    const table: string = tableNames[i];

    // Define the table definition selection script and command
    const outputTableDefinition: string = `${process.cwd()}/api/types/definition_${table}.csv`;
    const tableDefinitionScript: string = `${process.cwd()}/database/scripts/select/schema/information_schema.sql`;
    const tableDefinitionCommand: string = `export PGPASSWORD='${databaseDefaultUserPassword}'; psql -h ${databaseHost} -p ${databasePort} -U ${databaseDefaultUserName} -d ${databaseVAJ} -v table="'${table}'" -v file="'${outputTableDefinition}'" -f "${tableDefinitionScript}"; unset PGPASSWORD`;

    // Running the table definition selection process
    await runSqlScript(
      tableDefinitionCommand,
      `${
        table.charAt(0).toUpperCase() + table.slice(1)
      } table definition process`
    );

    // Parsing the defintion of the tables
    tableTypes += await parseTableDefinition(outputTableDefinition);
  }
}

main();
