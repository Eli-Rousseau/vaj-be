import { loadStage } from "@/be/scripts/dev/stage";
import * as databaseBackup from "@/be/scripts/database-backup"


async function main() {
    await loadStage();
    await databaseBackup.default();
}

if (require.main === module) {
    main()
}