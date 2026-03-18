import path from "path";

import { docker } from "../../src/utils/docker";
import { logger } from "../../src/utils/logger";
import { loadStage } from "../../src/utils/stage";
import { setupShutdownHooks } from "../../src/utils/shutdown";

const LOGGER = logger.get({
    source: "scripts",
    module: path.basename(__filename)
});

const IMAGE_NAME = "redis/redis-stack"
const CONTAINER_NAME = "vaj-redis";

function runRedisContainer() {
    const redisPort = process.env.REDIS_PORT;
    const redisInsightsPort = process.env.REDIS_INSIGHTS_PORT;
    const redisHost = process.env.REDIS_HOST;
    const redisPassword = process.env.REDIS_PASSWORD;

    if (!redisPort || !redisInsightsPort || !redisHost || !redisPassword ) {
        LOGGER.error("Missing required environment variables: REDIS_PORT, REDIS_INSIGHTS_PORT, REDIS_HOST, or REDIS_PASSWORD.");
        process.exit(1);
    }

    try {
        docker.activate();
        docker.pullImage("redis/redis-stack:7.4.0-v8");
        docker.runContainer({
            "--name": CONTAINER_NAME,
            args: [
                "-d",
                { "-p": `${redisHost}:${redisPort}:6379` },
                { "-p": `${redisHost}:${redisInsightsPort}:8001` },
                `-e REDIS_ARGS="--requirepass ${redisPassword} --appendonly yes"`,
                IMAGE_NAME

            ]
        });

        LOGGER.info(`Redis stack container "${CONTAINER_NAME}" is running on ${redisHost}:${redisPort}.`);
        LOGGER.info(`Redis insights container "${CONTAINER_NAME}" is running on ${redisHost}:${redisInsightsPort}.`);
    } catch (error) {
        LOGGER.error("Failed to start up the redis container.", error);
        process.exit(1);
    }
}

const main = async function() {
    await loadStage();

    setupShutdownHooks();

    runRedisContainer();

    LOGGER.info("Redis instance running.");
    process.stdin.resume();
}

main();