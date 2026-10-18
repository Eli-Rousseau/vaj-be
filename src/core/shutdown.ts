import { docker } from "@/src/core/docker";
import { PostgresClient } from "@/src/be/sdks/postgres";
import { baseRedisPool } from "@/src/core/sdk/redis";

let shuttingDown = false;

export function setupShutdownHooks() {
  if (shuttingDown) return;

  const shutdown = async () => {
    if (shuttingDown) return;
    shuttingDown = true;

    try {
      docker.stop();
      await PostgresClient.shutDown();
      await baseRedisPool.shutDown();
      process.exit(0);
    } catch (err) {
      process.exit(1);
    }
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}
