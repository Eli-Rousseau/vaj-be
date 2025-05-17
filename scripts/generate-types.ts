import { readFile, writeFile } from "fs/promises";
import * as path from "path";

import { loadStage } from "../utils/stage";
import { runSqlScript } from "../utils/sql";
import Logger from "../utils/logger";

const INDENT: string = " ".repeat(2);

type PostgresType =
  | "bigint"
  | "boolean"
  | "bytea"
  | "character"
  | "character varying"
  | "date"
  | "double precision"
  | "integer"
  | "json"
  | "jsonb"
  | "numeric"
  | "real"
  | "smallint"
  | "text"
  | "time"
  | "timestamp"
  | "timestamp without time zone"
  | "timestamp with time zone"
  | "USER-DEFINED"
  | "uuid";

const TYPEMAPPER: Record<PostgresType, string> = {
  bigint: "number",
  boolean: "boolean",
  bytea: "Buffer",
  character: "string",
  "character varying": "string",
  date: "Date",
  "double precision": "number",
  integer: "number",
  json: "any",
  jsonb: "any",
  numeric: "number",
  real: "number",
  smallint: "number",
  text: "string",
  time: "string",
  timestamp: "Date",
  "timestamp without time zone": "Date",
  "timestamp with time zone": "Date",
  "USER-DEFINED": "string",
  uuid: "string",
};

type DefinitionRecord = {
  columnName: string;
  dataType: string;
  isNullable: boolean;
  isPrimaryKey: boolean;
};

function getTypeNameFromeTableName(tableName: string): string {
  return tableName
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("");
}

function parseTableDefinition(tablePath: string): Promise<string> {
  return new Promise(async (resolve, reject) => {
    // Parse the table type from the file name
    const fileName: string = path.basename(tablePath);
    const tableName: string = fileName.match(
      /^definition_([A-Za-z_]+)\.csv$/
    )![1];
    const typeName: string = getTypeNameFromeTableName(tableName);

    // Initialize the result variable
    let result: string = `class ${typeName} {\n`;

    // Reading the table definition file
    let fileContent: string = "";
    try {
      fileContent = await readFile(tablePath, { encoding: "utf-8" });
      Logger.info(`Reading the ${fileName} file successfully.`);
    } catch (error) {
      Logger.error(`Reading the ${fileName} file failed: ${error}`);
      process.exit(1);
    }

    // Parsing the columns from the definition table
    let definitionTable: string[] = fileContent.trim().split("\n");
    definitionTable = definitionTable.slice(1, definitionTable.length);

    // Transforming the records into definition record instances
    const definitionRecords: DefinitionRecord[] = definitionTable.map(
      (record) => {
        const splitRecord: string[] = record.split(",");

        try {
          const pgType = splitRecord[1].trim() as PostgresType;

          if (!(pgType in TYPEMAPPER)) {
            Logger.error(`Unknown Postgres type: '${pgType}'`);
            process.exit(1);
          }

          return {
            columnName: splitRecord[0].trim(),
            dataType: TYPEMAPPER[pgType],
            isNullable: splitRecord[2].match(/YES/i) ? true : false,
            isPrimaryKey: splitRecord[3].match(/t/i) ? true : false,
          };
        } catch (error) {
          Logger.error(
            `An error was thrown when parsing the DefinitionRecord instances:\n${error}`
          );
          process.exit(1);
        }
      }
    );

    // Sorting the definition records alphabetically
    definitionRecords.sort((r1, r2) => {
      if (r1.isPrimaryKey) return -1;
      if (r2.isPrimaryKey) return 1;
      if (r1.isNullable && !r2.isNullable) return 1;
      else if (!r1.isNullable && r2.isNullable) return -1;
      else {
        const lastFields: string[] = ["created_at", "updated_at"];
        if (
          lastFields.includes(r1.columnName) &&
          !lastFields.includes(r2.columnName)
        )
          return 1;
        else if (
          !lastFields.includes(r1.columnName) &&
          lastFields.includes(r2.columnName)
        )
          return -1;
        else return r1.columnName.localeCompare(r2.columnName);
      }
    });

    // Transforming the definition records into a properties
    for (let i: number = 0; i < definitionRecords.length; i++) {
      const definitionRecord: DefinitionRecord = definitionRecords[i];
      result += `${INDENT}${definitionRecord.columnName}: ${
        definitionRecord.dataType
      }${
        definitionRecord.isPrimaryKey
          ? " | undefined"
          : definitionRecord.isNullable
          ? " | null"
          : ""
      };\n`;
    }
    result += `${INDENT}\n`;

    // Adding the constructor method
    result += `${INDENT}constructor(${definitionRecords
      .map(
        (definitionRecord) =>
          `${definitionRecord.columnName}: ${definitionRecord.dataType}${
            definitionRecord.isPrimaryKey
              ? " | undefined"
              : definitionRecord.isNullable
              ? " | null"
              : ""
          }`
      )
      .join(", ")}) {\n`;
    for (let i: number = 0; i < definitionRecords.length; i++) {
      const definitioRecord: DefinitionRecord = definitionRecords[i];
      result += `${INDENT.repeat(2)}this.${definitioRecord.columnName} = ${
        definitioRecord.columnName
      };\n`;
    }
    result += `${INDENT}}\n}${"\n".repeat(2)}`;

    resolve(result);
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
    Logger.info(`Reading the table_names.csv file successfully.`);
  } catch (error) {
    Logger.error(`Reading the table_names.csv file failed: ${error}`);
    process.exit(1);
  }

  // Parsing the table names
  let tableNames: string[] = tableNamesFileContent.split("\n");
  tableNames = tableNames.slice(1, tableNames.length - 1).sort();

  // Itterate over the tables
  let tableTypes: string = "";
  for (let i: number = 0; i < tableNames.length; i++) {
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

    // Parsing the defintion of the tables into classes
    tableTypes += await parseTableDefinition(outputTableDefinition);
  }

  // Adding the export statment
  const typeNames: string[] = tableNames.map((tableName) =>
    getTypeNameFromeTableName(tableName)
  );
  tableTypes += `export {\n${INDENT + typeNames.join(", \n" + INDENT)}\n};`;

  // Writing all the newly created classes to the class types file
  const outputTypesFile: string = `${process.cwd()}/api/types/classes.ts`;
  try {
    await writeFile(outputTypesFile, tableTypes, { encoding: "utf-8" });
    Logger.info(`Writing the types.ts file finished successfully.`);
  } catch (error) {
    Logger.error(`Writing the types.ts file failed:\n${error}`);
    process.exit(1);
  }
}

main();
