import express from "express";
import { Client, QueryResult } from "pg";

import Logger from "./logger";

// Define a global postgresql client
let pgClient: Client | null = null;

function createPgClient(): Client {
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

async function initializeDatabaseConnection(
  pgClient: Client
): Promise<boolean> {
  return new Promise(async (resolve, reject) => {
    try {
      await pgClient.connect();
      pgClient = pgClient;
      const queryResult: QueryResult = await pgClient.query("SELECT 1;"); // Quick health check on database connection
      Logger.info("Connected to database successfully.");
      resolve(true);
    } catch (error) {
      Logger.error("Unable to initialize a connection with the database.");
      resolve(false);
    }
  });
}

function getPgClient(): Client {
  if (!pgClient) {
    throw new Error("Unable to access a pgClient.");
  }
  return pgClient;
}

export { createPgClient, initializeDatabaseConnection, getPgClient };
