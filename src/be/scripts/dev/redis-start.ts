import { loadStage } from "@/be/scripts/dev/stage";
import * as redisStart from "@/be/scripts/redis-start"

async function main() {
    await loadStage();
    await redisStart.default();
}

if (require.main === module) {
    main()
}