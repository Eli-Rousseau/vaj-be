import { writeFile} from "fs/promises";
import * as path from "path";

import { loadStage } from "../src/utils/stage";
import { buildTransformerClasses } from "../src/classes/build-classes";
import { getDataBaseInfo } from "../src/database/database-info";
import { logger } from "../src/utils/logger";

const LOGGER = logger.get({
  source: "scripts",
  module: path.basename(__filename)
});

async function main() {
  await loadStage();

  const classes = await buildTransformerClasses();

  const outputFile = `${process.cwd()}/src/classes/transformer-classes.ts`;
  try {
    await writeFile(outputFile, classes, { encoding: "utf-8" });
    LOGGER.info(`Writing the tranfomer-classes to output file finished successfully.`, outputFile);
  } catch (error) {
    LOGGER.error(`Writing the tranfomer-classes to output file failed: `, error);
    process.exit(1);
  }

  process.exit(0);
}

main();