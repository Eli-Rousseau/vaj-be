import { createClientPool, RedisClientPoolType } from "redis";
import { logger } from "@/core/logger";

const LOGGER = logger.get();

let baseRedisPool: RedisPool;

type RedisPoolConfig = {
    host: string;
    port: string;
    user: string;
    password: string;
}

export class RedisPool {
    public readonly client: RedisClientPoolType;

    constructor(config: RedisPoolConfig) {

        const { host, port, user, password } = config;

        const url = `redis://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}`;

        this.client = createClientPool({
            url,
        });

        this.client.on("error", (err) => {
            LOGGER.error("Redis pool error", err);
        });
    }

    static async shutDown() {
        LOGGER.info("Shutting down Redis pool...");
        await baseRedisPool.client.close();
    }
}

type RedisClientSetOptions = {
    expirationInSeconds?: number;
    saveBuffer?: boolean;
};

type RedisClientGetOptions = {
    returnBuffer?: boolean;
};

export class RedisClient {
    protected pool: RedisClientPoolType;

    constructor(pool: RedisPool) {
        this.pool = pool.client;
    }

    async set(
        key: string,
        object: any,
        options?: RedisClientSetOptions,
    ) {
        const redisOptions: any = {};

        if (options?.expirationInSeconds !== undefined) {
            redisOptions.expiration = {
                type: "EX",
                value: options.expirationInSeconds,
            };
        }

        const toSave = options?.saveBuffer
            ? object.toString("base64")
            : JSON.stringify(object);

        await this.pool.set(key, toSave, redisOptions);
    }

    async get(
        key: string,
        options?: RedisClientGetOptions,
    ) {
        const response = await this.pool.get(key);

        if (response === null) {
            return null;
        }

        return options?.returnBuffer
            ? Buffer.from(response, "base64")
            : JSON.parse(response);
    }

    async delete(key: string) {
        await this.pool.del(key);
    }

    static withDefaultPool() {
        if (!baseRedisPool) {
            const host = process.env.REDIS_HOST;
            const port = process.env.REDIS_PORT;
            const user = process.env.REDIS_USERNAME;
            const password = process.env.REDIS_PASSWORD;

            if (!host || !port || !user || !password) {
                throw new Error(
                    "Missing required environment variables: REDIS_HOST, REDIS_PORT, REDIS_USERNAME, or REDIS_PASSWORD.",
                );
            }

            baseRedisPool = new RedisPool({ host, port, user, password });
        }

        return new RedisClient(baseRedisPool);
    }
}