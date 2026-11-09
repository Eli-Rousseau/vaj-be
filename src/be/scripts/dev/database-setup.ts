import { loadStage } from "@/be/scripts/dev/stage";
import * as databaseSetup from "@/be/scripts/database-setup"


async function main() {
    await loadStage();
    await databaseSetup.default();
}

if (require.main === module) {
    main()
}