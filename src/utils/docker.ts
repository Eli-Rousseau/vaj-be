import os from "os";
import path from "path";
import { execSync } from "child_process";

import { logger } from "./logger";

const LOGGER = logger.get({
  source: "utils",
  module: path.basename(__filename),
});

export interface RunDockerContainerOptions {
  "--name": string;
  args: (string | Record<string, string>)[];
}

class Docker {

    private containers: string[] = [];

    private static sleep(ms: number) {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    }

    activate() {
        try {
            execSync("docker info", { stdio: "ignore" });
            LOGGER.info("Docker daemon is already running.");
            return;
        } catch {
            LOGGER.info("Docker daemon is not running, attempting to start...");
        }

        const platform = os.platform();

        try {
            if (platform === "darwin") {
                execSync("open -a Docker", { stdio: "ignore" });
                LOGGER.info("Starting Docker Desktop on macOS...");

            } else if (platform === "win32") {
                execSync(
                    'start "" "C:\\Program Files\\Docker\\Docker\\Docker Desktop.exe"',
                    { stdio: "ignore" }
                );
                LOGGER.info("Starting Docker Desktop on Windows...");

            } else if (platform === "linux") {
                execSync("sudo systemctl start docker || sudo service docker start", {
                    stdio: "ignore",
                });
                LOGGER.info("Starting Docker service on Linux...");

            } else {
                throw new Error(`Unsupported platform: ${platform}`);
            }

            // Wait briefly for Docker to start
            LOGGER.info("Waiting for Docker to initialize...");
            let ready = false;
            const start = Date.now();
            while (!ready && Date.now() - start < 300000) {
                // 5 minutes
                try {
                    execSync("docker info", { stdio: "ignore" });
                    ready = true;
                } catch {
                    Docker.sleep(5000); // 5 seconds
                }
            }

            if (ready) {
                LOGGER.info("Docker deamon is started.");
            } else {
                throw new Error("Timed out waiting for Docker to start.");
            }
        } catch (error) {
            LOGGER.error("Failed to start Docker automatically.");
            throw error;
        }
    }

    pullImage(image: string) {
        try {
            execSync(`docker pull ${image}`, { stdio: "ignore" });
            LOGGER.info(`Docker image "${image}" pulled.`);
        } catch (error) {
            LOGGER.error(`Failed to run docker image: ${image}.`);
            throw error;
        }
    }

    private createRunCommand(options: RunDockerContainerOptions) {
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

    runContainer(options: RunDockerContainerOptions) {
        if (typeof options !== "object" || !Object.keys(options).includes("--name")) {
            throw new Error(`Incorrect docker runcommand options. Missing "--name" key.`);
        }

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
                LOGGER.info(`No container found with name "${containerName}".`);
            } else {
                LOGGER.info(`Removing existing container "${containerName}"...`);
                execSync(`docker stop ${containerName}`, { stdio: "ignore" });
                execSync(`docker rm ${containerName}`, { stdio: "ignore" });
            }
        } catch (error) {
            LOGGER.error("Failed to detect existing docker container.");
            throw error;                                      
        }

        try {
            const runDockerCommand = this.createRunCommand(options);
            execSync(runDockerCommand, { stdio: "ignore" });
            LOGGER.info("Docker container running.");

        } catch (error) {
            LOGGER.error("Failed to run docker container.");
            throw error;
        }

        this.containers.push(containerName);
    }

    stop(container?: string) {
        try {
            if (container) {
                execSync(`docker stop ${container}`, { stdio: "ignore" });
                LOGGER.info(`Closed the running container: ${container}`);

            } else {
                LOGGER.info("Shutting down all the docker containers...");
                for (const _container of this.containers) {
                    execSync(`docker stop ${_container}`, { stdio: "ignore" });
                    LOGGER.info(`Closed the running container: ${_container}`)
                }

            }
        } catch (error) {
            LOGGER.error("Failed to stop docker containers.");
            throw error;
        }
    }

}

export const docker = new Docker();