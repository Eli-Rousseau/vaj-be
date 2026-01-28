import { docker } from "./docker";
import { postgres } from "./postgres";

let shuttingDown = false;

export function setupShutdownHooks() {
  if (shuttingDown) return;

  const shutdown = async () => {
    if (shuttingDown) return;
    shuttingDown = true;

    try {
      docker.stop();
      await postgres.shutdown();
      process.exit(0);
    } catch (err) {
      process.exit(1);
    }
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}
