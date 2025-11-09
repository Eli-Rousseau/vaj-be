import path from "path";
import { execSync, ExecException } from "child_process";

import { loadStage } from "../src/utils/stage";
import getLogger from "../src/utils/logger";

const logger = getLogger({
  source: "scripts",
  module: path.basename(__filename),
});

import os from "os";

function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function ensureDockerRunning() {
  try {
    execSync("docker info", { stdio: "ignore" });
    logger.info("Docker daemon is already running.");
    return;
  } catch {
    logger.info("Docker daemon is not running, attempting to start...");
  }

  const platform = os.platform();

  try {
    if (platform === "darwin") {
      execSync("open -a Docker", { stdio: "ignore" });
      logger.info("Starting Docker Desktop on macOS...");
    } else if (platform === "win32") {
      execSync(
        'start "" "C:\\Program Files\\Docker\\Docker\\Docker Desktop.exe"',
        { stdio: "ignore" }
      );
      logger.info("Starting Docker Desktop on Windows...");
    } else if (platform === "linux") {
      execSync("sudo systemctl start docker || sudo service docker start", {
        stdio: "ignore",
      });
      logger.info("Starting Docker service on Linux...");
    } else {
      logger.error(`Unsupported platform: ${platform}`);
      return;
    }

    // Wait briefly for Docker to start
    logger.info("Waiting for Docker to initialize...");
    let ready = false;
    const start = Date.now();
    while (!ready && Date.now() - start < 300000) {
      // 5 minutes
      try {
        execSync("docker info", { stdio: "ignore" });
        ready = true;
      } catch {
        sleep(5000); // 5 seconds
      }
    }

    if (ready) {
      logger.info("Docker deamon is started.");
    } else {
      logger.error("Timed out waiting for Docker to start.");
    }
  } catch {
    logger.error("Failed to start Docker automatically.");
    process.exit(-1);
  }
}

const runDatabaseContainer = function () {
  ensureDockerRunning();

  /* TO DO
  - Split the command in two
  - Ensure no conflict on conatainer name ("/some-postgres")
  */
  try {
    execSync(
      "docker pull postgres:14.19-trixie && docker run --name some-postgres -e POSTGRES_PASSWORD=mysecretpassword -d postgres",
      { stdio: "ignore" }
    );
    logger.info("Postgres is runing on docker container.");
  } catch (err) {
    logger.error(err);
    process.exit(-1);
  }
};

const main = async function () {
  await loadStage();

  runDatabaseContainer();
};

main();
