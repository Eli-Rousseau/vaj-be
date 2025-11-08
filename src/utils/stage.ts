import * as dotenv from "dotenv";
import { existsSync } from "fs";
import path from "path";

import { dropDown } from "./prompt";
import getLogger from "./logger";

const STAGES = ["dev", "prod"];

const stageConfigs: Record<(typeof STAGES)[number], string> = {
  dev: ".env.dev",
  prod: ".env.prod",
};

/**
 * @description Helps to load the environments from the desired stage.
 */
export const loadStage = async function (
  stage: (typeof STAGES)[number] | null = null
) {
  if (process.env.STAGE) return;

  if (!stage)
    stage = await dropDown("Please, select your environment:", STAGES);
  process.env["STAGE"] = stage;

  const config = stageConfigs[stage];
  dotenv.config({ path: config, quiet: true });

  /*
    Normally, you would create the logger as a global variable.
    In this case, we first need to load the environment variables.
    The variables are needed to initialize the logger LEVEL and FOMAT correctly.
    Please note that this is an exception to the rule.
    Leave it as it is.
  */
  const logger = getLogger({
    source: "utils",
    module: path.basename(__dirname),
  });

  const configFullPath = `${process.cwd()}/${config}`;
  if (!existsSync(configFullPath)) {
    logger.error(`Missing .env file for ${stage}: ${configFullPath}`);
    process.exit(-1);
  }
  logger.info("Environment loaded.");
};
