import { cwd } from "process";
import { readdir, readFile, writeFile } from "fs/promises";

import { loadStage } from "@/src/core/stage";
import { logger } from "@/src/core/logger";
import { postgres } from "@/src/core/postgres";
import { setupShutdownHooks } from "@/src/core/shutdown";
import { askQuestion } from "@/src/core/prompt";
import { buildTransformerClasses } from "@/src/be/database/classes/build-classes";
import VAJClient from "@/src/core/sdk/vaj";

const LOGGER = logger.get();

const MIGRATION_DIRECTORY = `${cwd()}/src/be/database/migrations`;
const TRANSFORMER_CLASSES_FILE = `${cwd()}/src/be/database/classes/transformer-classes.ts`;

type Migration = {
  id: number;
  name: string;
  run_on: string;
};

function checkMigrationSequence(migrations: string[]) {
  migrations.sort((mgr1, mgr2) => {
    const index1 = Number(mgr1.match("^\d+"));
    const index2 = Number(mgr2.match("^\d+"));
    return index1 < index2 ? 1 : -1;
  });

  let validSequence = true;
  for (let i = 0; i < migrations.length; i++) {
    const migration = migrations[i];
    const number = Number(migration.match(/^\d+/)![0]);
    if (number - 1 !== i) {
      LOGGER.error(`Incorrect migration sequence number: ${migration}`);
      validSequence = false;
      break;
    }
  }

  return validSequence;
}

async function getCurrentMigrations() {
  const pgPool = postgres.getPool("default");
  const query = "SELECT * FROM meta.migration;";

  try {
    const migrations: Migration[] = (await pgPool.query(query)).rows;
    migrations.sort((migr1, migr2) => {
      const index1 = Number(migr1.name.match(/^\d+/)![0]);
      const index2 = Number(migr2.name.match(/^\d+/)![0]);
      return index1 < index2 ? 1 : -1;
    });

    const validSequence = checkMigrationSequence(
      migrations.map((mgr) => mgr.name),
    );
    if (!validSequence) {
      LOGGER.error(
        "Invalid sequence detected in the database migrations. Shutting down ...",
      );
      process.exit(1);
    }

    return migrations;
  } catch (error) {
    LOGGER.error(`Failed to fetch the migrations: ${error}`);
    process.exit(1);
  }
}

async function getMigrationScripts() {
  try {
    const scripts = await readdir(MIGRATION_DIRECTORY);
    scripts.sort((scr1, scr2) => {
      const index1 = Number(scr1.match(/^\d+/)![0]);
      const index2 = Number(scr2.match(/^\d+/)![0]);
      return index1 < index2 ? 1 : -1;
    });

    const validSequence = checkMigrationSequence(scripts.map((scr) => scr));
    if (!validSequence) {
      LOGGER.error(
        "Invalid sequence detected in the migration scripts. Shutting down ...",
      );
      process.exit(1);
    }

    return scripts;
  } catch (error) {
    LOGGER.error(`Failed to read the migrations directory: ${error}`);
    process.exit(1);
  }
}

function computeMigrationsDiff(migrations: Migration[], scripts: string[]) {
  const diffs = [];
  const applied = migrations.map((migration) => migration.name);
  for (let script of scripts) {
    if (!applied.includes(script)) diffs.push(script);
  }

  diffs.sort((diff1, diff2) => {
    const index1 = Number(diff1.match("^\d+"));
    const index2 = Number(diff2.match("^\d+"));
    return index1 < index2 ? 1 : -1;
  });

  return diffs;
}

async function applyMigrations(scripts: string[]) {
  const pgPool = postgres.getPool("default");

  for (const script of scripts) {
    const path = `${MIGRATION_DIRECTORY}/${script}`;

    let content: string;
    try {
      content = await readFile(path, { encoding: "utf-8" });
    } catch (error) {
      LOGGER.error(`Failed to read migration "${script}":`, error);
      process.exit(1);
    }

    try {
      await pgPool.query("BEGIN");
      await pgPool.query(content);
      await pgPool.query("INSERT INTO meta.migration (name) VALUES ($1)", [
        script,
      ]);
      await pgPool.query("COMMIT");
      LOGGER.info(`Migration ${script} applied.`);
    } catch (error) {
      LOGGER.error(`Migration ${script} failed. Rolling back.`, error);
      await pgPool.query("ROLLBACK");
      process.exit(1);
    }
  }
}

async function rebuildGraphQLSchema() {
  try {
    const vajClient = await VAJClient.withAPIUserAuth();
    await vajClient.updateSchema();
  } catch (error) {
    LOGGER.warn(`Failed to update the graphql schema: ${error}`);
  }
}

async function updateTranformerClasses() {
  const newTransformerClasses = await buildTransformerClasses();

  let currentTransformerClasses: string;
  try {
    currentTransformerClasses = await readFile(TRANSFORMER_CLASSES_FILE, {
      encoding: "utf-8",
    });
  } catch (error) {
    LOGGER.warn(
      `Failed to read tranformer classes from "${TRANSFORMER_CLASSES_FILE}".`,
      error,
    );
    currentTransformerClasses = "";
  }

  if (newTransformerClasses === currentTransformerClasses) {
    LOGGER.info("No changes in transformer classes, skipping the update.");
    return;
  }

  try {
    await writeFile(TRANSFORMER_CLASSES_FILE, newTransformerClasses, {
      encoding: "utf-8",
    });
    LOGGER.info("Successfull update of the transformer classes.");
  } catch (error) {
    LOGGER.error("Failed to update the transformer classes.", error);
    process.exit(1);
  }
}

async function main() {
  setupShutdownHooks();

  await loadStage();

  const appliedMigrations = await getCurrentMigrations();
  const migrationScripts = await getMigrationScripts();

  const diffs = computeMigrationsDiff(appliedMigrations, migrationScripts);

  if (diffs.length !== 0) {
    LOGGER.info(
      `${diffs.length} new migration(s) found:\n\t${diffs.join("\n\t")}`,
    );
    const proceed = await askQuestion(
      "Do you want to proceed with the new migrations",
      "no",
    );
    if (!/y|yes/.test(proceed.toLowerCase())) {
      LOGGER.info("No migrations applied. Shutting down ...");
      process.exit(1);
    }

    await applyMigrations(diffs);
    LOGGER.info("All migrations applied.");
  }

  await rebuildGraphQLSchema();
  await updateTranformerClasses();

  process.exit(0);
}

main();
