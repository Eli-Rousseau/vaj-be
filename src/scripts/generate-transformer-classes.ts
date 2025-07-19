import { readFile, writeFile, unlink } from "fs/promises";
import * as path from "path";

import { loadStage } from "../utils/stage";
import { runSqlScript } from "../utils/sql";
import Logger from "../utils/logger";

const INDENT: string = " ".repeat(2);

type PostgresType =
  | "bigint"
  | "boolean"
  | "character"
  | "character varying"
  | "date"
  | "double precision"
  | "integer"
  | "json"
  | "jsonb"
  | "numeric"
  | "smallint"
  | "text"
  | "time"
  | "timestamp"
  | "timestamp without time zone"
  | "timestamp with time zone"
  | "USER-DEFINED"
  | "uuid";

type TypeScriptType = "number" | "boolean" | "string" | "any";

const TYPE_MAPPER: Record<PostgresType, TypeScriptType> = {
  bigint: "number",
  boolean: "boolean",
  character: "string",
  "character varying": "string",
  date: "string",
  "double precision": "number",
  integer: "number",
  json: "any",
  jsonb: "any",
  numeric: "number",
  smallint: "number",
  text: "string",
  time: "string",
  timestamp: "string",
  "timestamp without time zone": "string",
  "timestamp with time zone": "string",
  "USER-DEFINED": "string",
  uuid: "string",
};

const TRANSFORMER_MAPPER: Record<
  PostgresType,
  { to: string; from: string } | null
> = {
  bigint: { to: "toInteger", from: "fromInteger" },
  boolean: null,
  character: null,
  "character varying": null,
  date: { to: "toDay", from: "fromDay" },
  "double precision": null,
  integer: { to: "toInteger", from: "fromInteger" },
  json: { to: "toJSON", from: "fromJSON" },
  jsonb: { to: "toJSON", from: "fromJSON" },
  numeric: null,
  smallint: { to: "toInteger", from: "fromInteger" },
  text: null,
  time: { to: "toTime", from: "fromTime" },
  timestamp: { to: "toDatetime", from: "fromDatetime" },
  "timestamp without time zone": { to: "toDatetime", from: "fromDatetime" },
  "timestamp with time zone": { to: "toDatetime", from: "fromDatetime" },
  "USER-DEFINED": null,
  uuid: null,
};

type DefinitionRecord = {
  columnName: string;
  pgType: PostgresType;
  tsType: TypeScriptType;
  isNullable: boolean;
  isUndefinable: boolean;
};

function getClassNameFromeTableName(tableName: string): string {
  return tableName
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("");
}

function parseTableDefinition(tablePath: string): Promise<string> {
  return new Promise(async (resolve, reject) => {
    // Parse the class name from the file name
    const fileName: string = path.basename(tablePath);
    const tableName: string = fileName.match(
      /^definition_([A-Za-z_]+)\.csv$/
    )![1];
    const className: string = getClassNameFromeTableName(tableName);

    // Initialize the result variable
    let result: string = `export class ${className} {\n`;

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
    let definitionRecords: DefinitionRecord[] = definitionTable.map(
      (record) => {
        const splitRecord: string[] = record.split(",");

        try {
          const pgType = splitRecord[1].trim() as PostgresType;

          if (!(pgType in TYPE_MAPPER)) {
            Logger.error(`Unknown Postgres type: '${pgType}'`);
            process.exit(1);
          }

          return {
            columnName: splitRecord[0].trim(),
            pgType: pgType,
            tsType: TYPE_MAPPER[pgType] as TypeScriptType,
            isNullable: splitRecord[2].match(/YES/i) ? true : false,
            isUndefinable: splitRecord[3].match(/YES/i) ? true : false,
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
    definitionRecords = definitionRecords.sort((r1, r2) => {
      return r1.columnName.localeCompare(r2.columnName);
    });

    // Transforming the definition record into a property line
    const propertyLines: string[] = definitionRecords.map(
      (definitionRecord) => {
        let propertyLine: string = "";

        // Adding the transformers to the property
        const transformers: { to: string; from: string } | null =
          TRANSFORMER_MAPPER[definitionRecord.pgType];
        if (transformers) {
          const toTransformerLine: string = `${INDENT}@Transform(({ value }) => ${
            transformers.to
          }(value${
            definitionRecord.isNullable
              ? ", { isNullable: true }"
              : definitionRecord.isUndefinable
              ? ", { isUndefinable: true }"
              : ""
          }), { toClassOnly: true })\n`;
          const fromTransformerLine: string = `${INDENT}@Transform(({ value }) => ${
            transformers.from
          }(value${
            definitionRecord.isNullable
              ? ", { isNullable: true }"
              : definitionRecord.isUndefinable
              ? ", { isUndefinable: true }"
              : ""
          }), { toPlainOnly: true })\n`;
          propertyLine += toTransformerLine + fromTransformerLine;
        }

        // Adding the expose to the property
        propertyLine += `${INDENT}@Expose()\n`;

        // Adding the property and their types
        propertyLine += `${INDENT}${definitionRecord.columnName}${
          definitionRecord.isUndefinable ? "?" : "!"
        }: ${definitionRecord.tsType}${
          definitionRecord.isNullable ? " | null" : ""
        };`;

        return propertyLine;
      }
    );

    // Joining the property lines
    result += propertyLines.join("\n".repeat(2));

    // Adding the final newlines
    result += `\n}${"\n".repeat(2)}`;

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
  const outputTableNames: string = `${process.cwd()}/src/classes/table_names.csv`;
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

  // Define the tables classes and adding the import statements
  let tableClasses: string = `import { Transform, Expose } from "class-transformer";\n`;
  tableClasses += `import "reflect-metadata"\n\n`;
  tableClasses += `import { toInteger, fromInteger, toDay, fromDay, toTime, fromTime, toDatetime, fromDatetime, toJSON, fromJSON } from "../utils/class-transformers";\n\n`;

  // Itterate over the tables
  for (let i: number = 0; i < tableNames.length; i++) {
    const table: string = tableNames[i];

    // Define the table definition selection script and command
    const outputTableDefinition: string = `${process.cwd()}/src/classes/definition_${table}.csv`;
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
    tableClasses += await parseTableDefinition(outputTableDefinition);

    // Remove the table definition file
    try {
      await unlink(outputTableDefinition);
      Logger.info(`${path.basename(outputTableDefinition)} was successfully removed.`);
    } catch (error) {
      Logger.error(
        `Failed to remove ${path.basename(outputTableDefinition)}: ${error}`
      );
      process.exit(1);
    }
  }

  // Writing all the newly created classes to the class types file
  const outputTypesFile: string = `${process.cwd()}/src/classes/transformer-classes.ts`;
  try {
    await writeFile(outputTypesFile, tableClasses, { encoding: "utf-8" });
    Logger.debug(`Writing the types.ts file finished successfully.`);
  } catch (error) {
    Logger.error(`Writing the types.ts file failed:\n${error}`);
    process.exit(1);
  }

  // Remove the table names file
  try {
    await unlink(outputTableNames);
    Logger.debug(`${path.basename(outputTableNames)} is successfully removed.`);
  } catch (error) {
    Logger.error(
      `Failed to remove ${path.basename(outputTableNames)}: ${error}`
    );
    process.exit(1);
  }
}

main();
