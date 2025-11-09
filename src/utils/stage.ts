import * as dotenv from "dotenv";
import { existsSync } from "fs";
import path from "path";

import { dropDown } from "./prompt";
import getLogger from "./logger";

let logger = getLogger({
  source: "utils",
  module: path.basename(__filename),
});

enum Stages {
  dev = "dev",
  prod = "prod",
}

const stageConfigs: Record<keyof typeof Stages, string> = {
  dev: ".env.dev",
  prod: ".env.prod",
};

/**
 * @description Helps to load the environments from the desired stage.
 */
export const loadStage = async function (
  stage: keyof typeof Stages | null = null
) {
  if (process.env.STAGE) return;

  if (!stage)
    stage = (await dropDown(
      "Please, select your environment:",
      Object.keys(Stages)
    )) as keyof typeof Stages;
  process.env["STAGE"] = stage;

  const config = stageConfigs[stage];
  const configFullPath = `${process.cwd()}/${config}`;
  if (!existsSync(configFullPath)) {
    logger.error(`Missing .env file for ${stage}: ${configFullPath}`);
    process.exit(-1);
  }

  dotenv.config({ path: config, quiet: true });

  // Reinitialize the baseLogger once the environment is loaded
  logger = getLogger(
    {
      source: "utils",
      module: path.basename(__filename),
    },
    true
  );

  logger.info("Environment loaded.");
};
