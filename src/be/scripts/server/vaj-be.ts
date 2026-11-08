import { startServer } from "@/be/api/server";
import { logger } from "@/core/logger";
import { loadStage } from "@/core/stage";

const LOGGER = logger.get();

async function main() {
    await loadStage();
    await startServer().catch((err) => {
        LOGGER.error(err);
        process.exit(1);
    });
}

main()