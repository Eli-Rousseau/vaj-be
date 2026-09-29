import { createClientPool, RedisClientPoolType } from "redis";
import { logger } from "@/src/core/logger";

const LOGGER = logger.get();

type RedisClientSetOptions = {
  expirationInSeconds?: number;
  saveBuffer?: boolean
};

type RedisClientGetOptions = {
  returnBuffer?: boolean;
}

class RedisClient {
  protected pool: RedisClientPoolType

  constructor() {
    const host = process.env.REDIS_HOST;
    const port = process.env.REDIS_PORT;
    const user = process.env.REDIS_USERNAME;
    const password = process.env.REDIS_PASSWORD;

    if (!host || !port || !user || !password) {
      throw new Error(
        "Missing required environment variables: REDIS_HOST, REDIS_PORT, REDIS_USERNAME, or REDIS_PASSWORD.",
      );
    }

    const url = `redis://${user}:${password}@${host}:${port}`;

    const pool = createClientPool({
      url
    });

    pool.on("error", (err) => {
      LOGGER.error("Redis pool error", err);
    });

    this.pool = pool as RedisClientPoolType;
  }

  async shutDown() {
    LOGGER.info("Shutting down Redis pool...");
    await this.pool.close();
  }

  async set(key: string, object: any, options?: RedisClientSetOptions) {
    const redisOptions: any = {};
    if (options?.expirationInSeconds) {
      redisOptions["expiration"] = {
        type: "EX",
        value: options.expirationInSeconds,
      };
    }

    let toSave;
    if (options?.saveBuffer) toSave = object.toString("utf-16le");
    else toSave = JSON.stringify(object);

    await this.pool.set(key, toSave, redisOptions);
  }

  async get(key: string, options?: RedisClientGetOptions) {
    const response = await this.pool.get(key);

    if (response === null) return null;

    let toReturn;
    if (options?.returnBuffer) toReturn = Buffer.from(response, "utf-16le");
    else toReturn = JSON.parse(response);

    return toReturn;
  }

  async delete(key: string) {
    await this.pool.del(key);
  }

  // async findKeyInJSON(key: string, path: string) {
  //   const object = await this.getJSON(key);

  //   try {
  //     const pathElements = path.split(".");
  //     let nestedObject = object;
  //     for (const element of pathElements) {
  //       nestedObject =
  //         !isNaN(parseFloat(element)) && Array.isArray(nestedObject)
  //           ? nestedObject[parseInt(element)]
  //           : nestedObject[element];
  //     }

  //     return nestedObject;
  //   } catch (error) {
  //     return null;
  //   }
  // }

  // async keyExistsInJSON(key: string, path: string) {
  //   const result = await this.findKeyInJSON(key, path);
  //   return result !== null;
  // }
}

export const redisClient = new RedisClient();
