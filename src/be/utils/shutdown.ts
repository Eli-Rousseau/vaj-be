import { docker } from "@/src/core/docker";
import { PostgresPool } from "@/src/be/sdks/postgres";
import { RedisPool } from "@/src/be/sdks/redis";

let shuttingDown = false;

export function setupShutdownHooks() {
  if (shuttingDown) return;

  const shutdown = async () => {
    if (shuttingDown) return;
    shuttingDown = true;

    try {
      docker.stop();
      await PostgresPool.shutDown();
      await RedisPool.shutDown();
      process.exit(0);
    } catch (err) {
      process.exit(1);
    }
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}
