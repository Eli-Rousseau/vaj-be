import { Pool, PoolConfig } from "pg";

import { logger } from "@/core/logger";

const LOGGER = logger.get();

const basePostgresPools = new Map<PoolKey, PostgresPool>();

export class PostgresPool {
  public readonly client: Pool;

  constructor(config: PoolConfig) {
    this.client = new Pool({
      ...config,
      max: 5,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
    });

    this.client.on("error", (err) => {
      LOGGER.error(`Postgres pool config error`, err);
    });
  }

  static async shutDown() {
    LOGGER.info("Shutting down Postgres pools...");
    await Promise.all([...basePostgresPools.values()].map((pool) => pool.client.end()));
  }
}

type PoolKey = "default" | "administrator";

export class PostgresClient {
  protected pool: PostgresPool;

  constructor(pool: PostgresPool) {
    this.pool = pool;
  }

  async query(query: string, values?: any) {
    return await this.pool.client.query(query, values);
  }

  static getClientByPoolKey(key: PoolKey) {
    if (!basePostgresPools.has(key)) {
      const capitalizedKey = key.trim().toUpperCase();
      const config = {
        host: process.env.DATABASE_HOST,
        user: process.env[`DATABASE_${capitalizedKey}_USER_NAME`],
        password: process.env[`DATABASE_${capitalizedKey}_USER_PASSWORD`],
        database: process.env.DATABASE_VAJ,
        port: Number(process.env.DATABASE_PORT),
      };
      const newPool = new PostgresPool(config);
      basePostgresPools.set(key, newPool);
    }

    const pool = basePostgresPools.get(key);
    return new PostgresClient(pool!);
  }
}