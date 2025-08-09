import { Client, ClientConfig } from "pg";

import Logger from "./logger";

// Global Postgres client and status flag
let pgClient: Client | null = null;
let isDatabaseOnline: boolean = false;

// Create or return existing Postgres client
export function getPgClient(): Client | null | undefined {
  if (pgClient) {
    return pgClient;
  }

  const database: string = process.env.DATABASE_VAJ || "";
  const host: string = process.env.DATABASE_HOST || "";
  const port: number = !isNaN(Number(process.env.DATABASE_PORT))
    ? Number(process.env.DATABASE_PORT)
    : 0;
  const user: string = process.env.DATABASE_ADMINISTRATOR_USER_NAME || "";
  const password: string =
    process.env.DATABASE_ADMINISTRATOR_USER_PASSWORD || "";

  if (!database || !host || !port || !user || !password) {
    Logger.error(
      "Missing required environment variables: DATABASE_VAJ, DATABASE_HOST, DATABASE_PORT, DATABASE_ADMINISTRATOR_USER_NAME, or DATABASE_ADMINISTRATOR_USER_PASSWORD."
    );
    return;
  }

  try {
    const clientConfig: ClientConfig = {
      user,
      database,
      host,
      port,
      password,
    };

    pgClient = new Client(clientConfig);
    Logger.info("Postgres client initialized.");
    return pgClient;
  } catch (error) {
    Logger.error(`Failed to initialize Postgres client: ${error}`);
    return;
  }
}

// Initialize DB connection and health check
export async function initializeDatabaseConnection(
  client: Client
): Promise<void> {
  try {
    await client.connect();
    pgClient = client;

    await checkDatabaseHealth(client);

    if (!isDatabaseOnline) {
      throw new Error("Database connection could not be initialized.");
    }

    Logger.info("Connected to database successfully.");
  } catch (error) {
    throw error;
  }
}

// Disconnect DB client
export async function terminateDatabaseConnection(): Promise<void> {
  if (!pgClient) {
    throw new Error("Postgres client not initialized.");
  }

  try {
    await pgClient.end();
    Logger.info("Disconnected from database successfully.");
    isDatabaseOnline = false;
    pgClient = null;
  } catch (error) {
    Logger.error(`Failed to terminate database connection: ${error}`);
    throw error;
  }
}

// Check DB health by running a simple query
export async function checkDatabaseHealth(client: Client): Promise<void> {
  try {
    await client.query("SELECT 1;");
    Logger.info("Postgres Client is connected.");
    isDatabaseOnline = true;
  } catch (error) {
    Logger.error("Postgres Client is not connected.");
    isDatabaseOnline = false;
  }
}

// Returns current DB connection status
export function isConnectedToDatabase(): boolean {
  return isDatabaseOnline;
}
