import path from "path";
import { cwd } from "process";
import { readdir, readFile } from "fs/promises";

import { loadStage } from "../../src/utils/stage"
import getLogger from "../../src/utils/logger";
import { getPgClient, pgClient } from "../../src/utils/database";
import { askQuestion } from "../../src/utils/prompt";

const logger = getLogger({
    source: "scripts",
    module: path.basename(__filename)
});

let psqlClient: pgClient | null = null;

const migrationsDir = `${cwd()}/src/database/migrations`;

type Migration = {
    id: number;
    name: string;
    run_on: string;
}

async function definePsqlClient() {
    const database = process.env.DATABASE_VAJ;
    const host = process.env.DATABASE_HOST;
    const port = process.env.DATABASE_PORT;
    const user = process.env.DATABASE_DEFAULT_USER_NAME;
    const password = process.env.DATABASE_DEFAULT_USER_PASSWORD;

    if (!database || !host || !port || !user || !password) {
        logger.error("Missing required environment variables: DATABASE_VAJ, DATABASE_HOST, DATABASE_PORT, DATABASE_DEFAULT_USER_NAME, or DATABASE_DEFAULT_USER_PASSWORD.");
        process.exit(1);
    }

    const pgConfig = {
      user,
      database,
      host,
      port: Number(port),
      password,
    }

    psqlClient = await getPgClient(pgConfig);
}

function checkMigrationSequence(migrations: string[]) {
    migrations.sort((mgr1, mgr2) => {
        const index1 = Number(mgr1.match('^\d+'));
        const index2 = Number(mgr2.match('^\d+'));
        return index1 < index2 ? 1 : -1;
    });

    let validSequence = true;
    for (let i = 0; i < migrations.length; i++) {
        const migration = migrations[i];
        const number = Number(migration.match(/^\d+/)![0]);
        if (number -1 !== i) {
            logger.error(`Incorrect migration sequence number: ${migration}`);
            validSequence = false;
            break;
        }
    }

    return validSequence;
}

async function getCurrentMigrations() {
    const query = "SELECT * FROM meta.migration;"
    try {
        const migrations: Migration[] = (await psqlClient!.query(query)).rows;
        migrations.sort((migr1, migr2) => {
            const index1 = Number(migr1.name.match(/^\d+/)![0]);
            const index2 = Number(migr2.name.match(/^\d+/)![0]);
            return index1 < index2 ? 1 : -1;
        });

        const validSequence = checkMigrationSequence(migrations.map(mgr => mgr.name));
        if (!validSequence) {
            logger.error("Invalid sequence detected in the database migrations. Shutting down ...");
            process.exit(1);
        }

        return migrations;
    } catch (error) {
        logger.error(`Failed to fetch the migrations: ${error}`);
        process.exit(1);
    }
    
};

async function getMigrationScripts() {
    try {
        const scripts = await readdir(migrationsDir);
        scripts.sort((scr1, scr2) => {
            const index1 = Number(scr1.match(/^\d+/)![0]);
            const index2 = Number(scr2.match(/^\d+/)![0]);
            return index1 < index2 ? 1 : -1;
        });

        const validSequence = checkMigrationSequence(scripts.map(scr => scr));
        if (!validSequence) {
            logger.error("Invalid sequence detected in the migration scripts. Shutting down ...");
            process.exit(1);
        }

        return scripts;
    } catch (error) {
        logger.error(`Failed to read the migrations directory: ${error}`);
        process.exit(1);
    }
}

function computeMigrationsDiff(migrations: Migration[], scripts: string[]) {
    const diffs = [];
    const applied = migrations.map(migration => migration.name);
    for (let script of scripts) {
        if (!applied.includes(script)) diffs.push(script);
    }

    diffs.sort((diff1, diff2) => {
        const index1 = Number(diff1.match('^\d+'));
        const index2 = Number(diff2.match('^\d+'));
        return index1 < index2 ? 1 : -1;
    });

    return diffs;
}

async function applyMigrations(scripts: string[]) {
    for (const script of scripts) {
        const path = `${migrationsDir}/${script}`;

        let content: string;
        try {
            content = await readFile(path, { encoding: "utf-8" });
        } catch (error) {
            logger.error(`Failed to read migration "${script}":`, error);
            process.exit(1);
        }

        try {
            await psqlClient!.query("BEGIN");
            await psqlClient!.query(content);
            await psqlClient!.query(
                "INSERT INTO meta.migration (name) VALUES ($1)",
                [script]
            );
            await psqlClient!.query("COMMIT");
            logger.info(`Migration ${script} applied.`);
        } catch (error) {
            logger.error(`Migration ${script} failed. Rolling back.`, error);
            await psqlClient!.query("ROLLBACK");
            process.exit(1);
        }
    }
}

async function rebuildGraphQLSchema() {
    const applicationUrl = process.env.APPLICATION_URL;

    if (!applicationUrl) {
        logger.error("Missing required environment variables: APPLICATION_URL.");
        process.exit(1);
    }

    try {
        const url = `${applicationUrl}/api/graphql/update-schema`;

        const response = await fetch(url, {
            method: "POST"
        });

        if (!response.ok) {
            throw Error(`Failed graphql/update-schema request: HTTP ${response.status} ${response.statusText}`);
        }

        logger.info(`Succeeded graphql/update-schema request: HTTP ${response.status} ${response.statusText}`);
    } catch (error) {
        logger.warn(`The graphql/update-schema request failed: ${error}`);
    }
}

async function main() {
    await loadStage();

    await definePsqlClient();

    const appliedMigrations = await getCurrentMigrations();
    const migrationScripts = await getMigrationScripts();

    const diffs = computeMigrationsDiff(appliedMigrations, migrationScripts);

    if (diffs.length === 0) {
        logger.info("All migrations applied. Shutting down ...");
        process.exit(1);
    }

    logger.info(`${diffs.length} new migration(s) found:\n\t${diffs.join('\n\t')}`);
    const proceed = await askQuestion("Do you want to proceed with the new migrations", 'no');
    if (!/y|yes/.test(proceed.toLowerCase())) {
        logger.info("No migrations applied. Shutting down ...");
        process.exit(1);
    }

    await applyMigrations(diffs);
    logger.info("All migrations applied.");

    await rebuildGraphQLSchema();

    process.exit(0);
}

main()