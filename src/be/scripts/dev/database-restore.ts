import { loadStage } from "@/be/scripts/dev/stage";
import * as databaseRestore from "@/be/scripts/database-restore"


async function main() {
    await loadStage();
    await databaseRestore.default();
}

if (require.main === module) {
    main()
}