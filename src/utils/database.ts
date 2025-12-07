import path from "path";

import { Client, ClientConfig, Pool } from "pg";
import { createPostGraphileSchema } from "postgraphile";

import getLogger from "./logger";

const logger = getLogger({
  source: 'utils',
  module: path.basename(__filename)
});

let pgClient: Client | null = null;


export { Client as pgClient };

/**
 * 
 * @description Returns a Postgres client.
 */
export async function getPgClient(pgConfig?: ClientConfig) {
  if (pgClient) {
    return pgClient;
  }

  if (!pgConfig) {
    const database = process.env.DATABASE_VAJ;
    const host = process.env.DATABASE_HOST;
    const port = process.env.DATABASE_PORT;
    const user = process.env.DATABASE_DEFAULT_USER_NAME;
    const password = process.env.DATABASE_DEFAULT_USER_PASSWORD;

    if (!database || !host || !port || !user || !password) {
      throw Error("Missing required environment variables: DATABASE_VAJ, DATABASE_HOST, DATABASE_PORT, DATABASE_DEFAULT_USER_NAME, or DATABASE_DEFAULT_USER_PASSWORD.");
    }

    pgConfig = {
      user,
      database,
      host,
      port: Number(port),
      password,
    }
  }

  try {
    pgClient = new Client(pgConfig);

    await pgClient.connect();

    setupPgShutdownHook(pgClient);

    logger.info("Postgres client initialized.");
    return pgClient;
  } catch (error) {
    throw Error(`Failed to initialize Postgres client: ${error}`);
  }
}

function setupPgShutdownHook(client: Client) {
  const shutdown = async () => {
    try {
      await client.end();
      logger.info("Postgres client disconnected.");
      process.exit(0);
    } catch (error) {
      throw Error(`Error during Postgres client disconnect: ${error}`);
    }
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
  process.on("beforeExit", shutdown);
  process.on("exit", shutdown);
}

export async function buildSchema() {
    const database = process.env.DATABASE_VAJ;
    const host = process.env.DATABASE_HOST;
    const port = process.env.DATABASE_PORT;
    const user = process.env.DATABASE_DEFAULT_USER_NAME;
    const password = process.env.DATABASE_DEFAULT_USER_PASSWORD;

    if (!database || !host || !port || !user || !password) {
      throw Error("Missing required environment variables: DATABASE_VAJ, DATABASE_HOST, DATABASE_PORT, DATABASE_DEFAULT_USER_NAME, or DATABASE_DEFAULT_USER_PASSWORD.");
    }

    const pool = new Pool({
        user,
        database,
        host,
        port: Number(port),
        password,
    });

    try {
        const schema = await createPostGraphileSchema(
            pool,
            ["shop"],
            {
                classicIds: true,
                dynamicJson: true,
                setofFunctionsContainNulls: false,
            }
        )
        logger.info("Postgraphile schema created successfully.");

        return schema;
    } catch (error) {
        throw Error(`Failed to create Postgraphile schema: ${error}`);
    }
}