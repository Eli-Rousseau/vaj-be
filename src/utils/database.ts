import { Client } from "pg";

import Logger from "./logger";

// Define a global postgresql client
let pgClient: Client | null = null;

// Define a global variable to see if database is connected
let isDatabaseOnline = true;

// Responsible for creating a postgresql database client
export function createPgClient(): Client {
  // Import the environment variables
  const database: string = process.env.DATABASE_VAJ || "";
  const host: string = process.env.DATABASE_HOST || "";
  const port: number = !isNaN(Number(process.env.DATABASE_PORT))
    ? Number(process.env.DATABASE_PORT)
    : 0;
  const user: string = process.env.DATABASE_ADMINISTRATOR_USER_NAME || "";
  const password: string =
    process.env.DATABASE_ADMINISTRATOR_USER_PASSWORD || "";

  // Initiate the pg client
  const pgClient: Client = new Client({
    user: user,
    database: database,
    port: port,
    host: host,
    password: password,
  });

  return pgClient;
}

// Initialize the database connection and defining the global postgresql client
export async function initializeDatabaseConnection(
  client: Client
): Promise<void> {
  return new Promise(async (resolve, reject) => {
    try {
      await client.connect();
      pgClient = client;
      await pgClient.query("SELECT 1;"); // Health check on database connection
      Logger.info("Connected to database successfully.");
      isDatabaseOnline = true;
      resolve();
    } catch (error) {
      Logger.error("Unable to initialize a connection with the database.");
      isDatabaseOnline = false;
    }
  });
}

// Disconnect from the database
export async function terminateDatabaseConnection(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!pgClient) {
      throw reject(new Error("Unable to access a pgClient."));
    }
    try {
      pgClient!.end();
      Logger.info("Disconnected from the database successfully.");
      isDatabaseOnline = false;
      resolve();
    } catch (error) {
      Logger.error("Unable to terminate the connection to the database.");
    }
  });
}

// Does a health check on the database to see if the client is still connected
export function checkDatabaseHealth(client: Client): Promise<void> {
  return new Promise(async (resolve, reject) => {
    pgClient = client;
    try {
      await pgClient.query("SELECT 1;");
      Logger.info("Postgres client is well connected to the database.");
      isDatabaseOnline = true;
      resolve();
    } catch (error) {
      Logger.error("Postgres client is not connected to the database.");
      isDatabaseOnline = false;
    }
  });
}

// Returns the globally defined postgresql client
export function getPgClient(): Client {
  if (!pgClient) {
    throw new Error("Unable to access a pgClient.");
  }
  return pgClient;
}

// Returns the globally defined status of the datbase connection
export function isConnectedToDatabase(): boolean {
  return isDatabaseOnline;
}
