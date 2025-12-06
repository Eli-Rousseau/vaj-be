import path from "path";

import { loadStage } from "../../src/utils/stage"
import getLogger from "../../src/utils/logger";
import { getPgClient, pgClient } from "../../src/utils/database";
import { cwd } from "process";
import { readdir, readFile } from "fs/promises";
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

async function getCurrentMigrations() {
    const query = "SELECT * FROM meta.migration;"
    try {
        const migrations: Migration[] = (await psqlClient!.query(query)).rows;
        migrations.sort((migr1, migr2) => {
            const index1 = Number(migr1.name.match('^\d+'));
            const index2 = Number(migr2.name.match('^\d+'));
            return index1 < index2 ? 1 : -1;
        });
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
            const index1 = Number(scr1.match('^\d+'));
            const index2 = Number(scr2.match('^\d+'));
            return index1 < index2 ? 1 : -1;
        });
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

        logger.info(`Applying migration ${script} ...`);

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

async function main() {
    await loadStage();

    psqlClient = await getPgClient();

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
}

main()