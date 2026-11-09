import { loadStage } from "@/be/scripts/dev/stage";
import * as databaseMigrate from "@/be/scripts/database-migrate"


async function main() {
    await loadStage();
    await databaseMigrate.default();
}

if (require.main === module) {
    main()
}