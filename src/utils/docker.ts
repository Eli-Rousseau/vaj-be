import os from "os";
import path from "path";
import { execSync } from "child_process";

import getLogger from "./logger";

const logger = getLogger({
  source: "utils",
  module: path.basename(__filename),
});

function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function ensureDockerRunning() {
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

export const pullDockerImage = function (image: string) {
  try {
    execSync(`docker pull ${image}`, { stdio: "ignore" });
    logger.info(`Docker image "${image}" pulled.`);
  } catch (error) {
    logger.error(error);
    process.exit(-1);
  }
};

export interface RunDockerContainerOptions {
  "--name": string;
  args: (string | Record<string, string>)[];
}

function createRunDockerCommand(options: RunDockerContainerOptions): string {
  const base = `docker run -d --name ${options["--name"]}`;

  const extraArgs =
    options.args
      ?.map((arg) => {
        if (typeof arg === "string") {
          return arg.trim();
        }

        if (typeof arg === "object") {
          // handle multiple flags in one object
          return Object.entries(arg)
            .map(([key, value]) => `${key} ${value}`)
            .join(" ");
        }

        return "";
      })
      .filter(Boolean)
      .join(" ") ?? "";

  return [base, extraArgs].filter(Boolean).join(" ").trim();
}

export const runDockerContainer = function (
  options: RunDockerContainerOptions
) {
  if ("--name" in options) {
    const containerName = options["--name"];

    try {
      const result = execSync(
        `docker ps -a --filter "name=${containerName}" --format "{{.Names}}"`,
        {
          stdio: "pipe",
        }
      )
        .toString()
        .trim();

      if (!result) {
        logger.info(`No container found with name "${containerName}".`);
      } else {
        logger.info(`Removing existing container "${containerName}"...`);
        execSync(`docker stop ${containerName}`, { stdio: "ignore" });
        execSync(`docker rm ${containerName}`, { stdio: "ignore" });
      }
    } catch (error: any) {
      logger.error(error);
      process.exit(-1);
    }
  }

  try {
    const runDockerCommand = createRunDockerCommand(options);
    execSync(runDockerCommand, { stdio: "ignore" });
    logger.info("Docker container running.");
  } catch (error) {
    logger.error(error);
    process.exit(-1);
  }
};
