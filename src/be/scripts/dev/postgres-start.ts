import { loadStage } from "@/be/scripts/dev/stage";
import * as postgresStart from "@/be/scripts/postgres-start"


async function main() {
    await loadStage();
    await postgresStart.default();
}

if (require.main === module) {
    main()
}