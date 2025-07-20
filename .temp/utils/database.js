"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPgClient = createPgClient;
exports.initializeDatabaseConnection = initializeDatabaseConnection;
exports.terminateDatabaseConnection = terminateDatabaseConnection;
exports.checkDatabaseHealth = checkDatabaseHealth;
exports.getPgClient = getPgClient;
exports.isConnectedToDatabase = isConnectedToDatabase;
const pg_1 = require("pg");
const logger_1 = __importDefault(require("./logger"));
// Define a global postgresql client
let pgClient = null;
// Define a global variable to see if database is connected
let isDatabaseOnline = true;
// Responsible for creating a postgresql database client
function createPgClient() {
    // Import the environment variables
    const database = process.env.DATABASE_VAJ || "";
    const host = process.env.DATABASE_HOST || "";
    const port = !isNaN(Number(process.env.DATABASE_PORT))
        ? Number(process.env.DATABASE_PORT)
        : 0;
    const user = process.env.DATABASE_ADMINISTRATOR_USER_NAME || "";
    const password = process.env.DATABASE_ADMINISTRATOR_USER_PASSWORD || "";
    // Initiate the pg client
    const pgClient = new pg_1.Client({
        user: user,
        database: database,
        port: port,
        host: host,
        password: password,
    });
    return pgClient;
}
// Initialize the database connection and defining the global postgresql client
async function initializeDatabaseConnection(client) {
    return new Promise(async (resolve, reject) => {
        try {
            await client.connect();
            pgClient = client;
            await pgClient.query("SELECT 1;"); // Health check on database connection
            logger_1.default.info("Connected to database successfully.");
            isDatabaseOnline = true;
            resolve();
        }
        catch (error) {
            logger_1.default.error("Unable to initialize a connection with the database.");
            isDatabaseOnline = false;
        }
    });
}
// Disconnect from the database
async function terminateDatabaseConnection() {
    return new Promise((resolve, reject) => {
        if (!pgClient) {
            throw reject(new Error("Unable to access a pgClient."));
        }
        try {
            pgClient.end();
            logger_1.default.info("Disconnected from the database successfully.");
            isDatabaseOnline = false;
            resolve();
        }
        catch (error) {
            logger_1.default.error("Unable to terminate the connection to the database.");
        }
    });
}
// Does a health check on the database to see if the client is still connected
function checkDatabaseHealth(client) {
    return new Promise(async (resolve, reject) => {
        pgClient = client;
        try {
            await pgClient.query("SELECT 1;");
            logger_1.default.info("Postgres client is well connected to the database.");
            isDatabaseOnline = true;
            resolve();
        }
        catch (error) {
            logger_1.default.error("Postgres client is not connected to the database.");
            isDatabaseOnline = false;
        }
    });
}
// Returns the globally defined postgresql client
function getPgClient() {
    if (!pgClient) {
        throw new Error("Unable to access a pgClient.");
    }
    return pgClient;
}
// Returns the globally defined status of the datbase connection
function isConnectedToDatabase() {
    return isDatabaseOnline;
}
//# sourceMappingURL=database.js.map