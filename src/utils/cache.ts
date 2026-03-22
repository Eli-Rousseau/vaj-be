import { createClientPool, RedisClientPoolType } from "redis";
import { logger } from "./logger";
import path from "path";

const LOGGER = logger.get({
    source: "utils",
    module: path.basename(__filename),
});

type SetJSONOptions = {
    expirationInSeconds?: number;
}

class RedisClient {
    private pool: RedisClientPoolType | null = null;

    getPool(): RedisClientPoolType {
        if (this.pool) {
            return this.pool;
        }

        const host = process.env.REDIS_HOST;
        const port = process.env.REDIS_PORT;
        const user = process.env.REDIS_USERNAME;
        const password = process.env.REDIS_PASSWORD;

        if (!host || !port || !user || !password) {
            throw new Error(
                "Missing required environment variables: REDIS_HOST, REDIS_PORT, REDIS_USERNAME, or REDIS_PASSWORD."
            );
        }

        const url = `redis://${user}:${password}@${host}:${port}`;

        const pool = createClientPool({
            url,
        });

        pool.on("error", (err) => {
            LOGGER.error("Redis pool error", err);
        });

        this.pool = pool as RedisClientPoolType;

        return pool as RedisClientPoolType;
    }

    async shutDown() {
        LOGGER.info("Shutting down Redis pool...");
        await this.pool?.close();
    }

    async setJSON(key: string, object: any, options?: SetJSONOptions) {
        const redisOptions: any = {};
        if (options?.expirationInSeconds) {
            redisOptions["expiration"] = { type: "EX", value: options.expirationInSeconds }
        } 
        
        const redisPool = this.getPool();
        await redisPool.set(key, JSON.stringify(object), redisOptions);
    }

    async getJSON(key: string): Promise<any> {
        const redisPool = this.getPool();
        const response = await redisPool.get(key);
        
        if (response === null) {
            return null; 
        }
        return JSON.parse(response);
    }

    async deleteJSON(key: string) {
        const redisPool = this.getPool();
        await redisPool.del(key);
    }

    async findKeyInJSON(key: string, path: string) {
        const object = await this.getJSON(key);

        try {
            const pathElements = path.split(".");
            let nestedObject = object;
            for (let element of pathElements) {
                nestedObject = !isNaN(parseFloat(element)) && Array.isArray(nestedObject) ? 
                    nestedObject[parseInt(element)] : 
                    nestedObject[element]
                ;
            }

            return nestedObject;
        } catch (error) {
            return null;
        }
        
    }

    async keyExistsInJSON(key: string, path: string) {
        const result = await this.findKeyInJSON(key, path);
        return result !== null;

    }
}

export const redisClient = new RedisClient();