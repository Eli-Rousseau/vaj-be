import path from "path";
import { Pool, PoolConfig } from "pg";

import { logger } from "./logger";

const LOGGER = logger.get({
  source: 'utils',
  module: path.basename(__filename)
});

type PoolKey = "default" | "administrator";

class PostgresManager {
  private pools = new Map<PoolKey, Pool>();

  getPool(key: PoolKey, config?: PoolConfig): Pool {
    if (!config) {
        try {
            const capitalizedKey = key.toUpperCase();
            config = {
                host: process.env.DATABASE_HOST,
                user: process.env[`DATABASE_${capitalizedKey}_USER_NAME`],
                password: process.env[`DATABASE_${capitalizedKey}_USER_PASSWORD`],
                database: process.env.DATABASE_VAJ,
                port: Number(process.env.DATABASE_PORT),
            }
        } catch {
            config = {
                host: process.env.DATABASE_HOST,
                user: process.env.DATABASE_DEFAULT_USER_NAME,
                password: process.env.DATABASE_DEFAULT_USER_PASSWORD,
                database: process.env.DATABASE_VAJ,
                port: Number(process.env.DATABASE_PORT),
            }
        }
    }
    
    if (!this.pools.has(key)) {
      const pool = new Pool({
        ...config,
        max: 5,
        idleTimeoutMillis: 30_000,
        connectionTimeoutMillis: 5_000,
      });

      pool.on("error", (err) => {
        LOGGER.error(`Postgres pool (${key}) error`, err);
      });

      this.pools.set(key, pool);
    }

    return this.pools.get(key)!;
  }

  async shutdown() {
    LOGGER.info("Shutting down Postgres pools...");
    await Promise.all(
      [...this.pools.values()].map(pool => pool.end())
    );
  }
}

export const postgres = new PostgresManager();
