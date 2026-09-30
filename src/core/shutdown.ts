import { docker } from "@/src/core/docker";
import { postgres } from "@/src/core/postgres";
import { baseRedisPool } from "@/src/core/sdk/redis";

let shuttingDown = false;

export function setupShutdownHooks() {
  if (shuttingDown) return;

  const shutdown = async () => {
    if (shuttingDown) return;
    shuttingDown = true;

    try {
      docker.stop();
      await postgres.shutdown();
      await baseRedisPool.shutDown();
      process.exit(0);
    } catch (err) {
      process.exit(1);
    }
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}
