import crypto from "crypto";

import { loadStage } from "../src/utils/stage";

function generateEnvApiKey(label = "VAJ_API_KEY"): string {
  const key = crypto.randomBytes(32).toString("hex");
  return `${label}=${key}`;
}

async function main() {
  // Loading the stage environment
  await loadStage();

  // Retrieve all the API keys present in the environmental variables
  let APIKeys: Record<string, string> = {};
  for (const [key, value] of Object.entries(process.env)) {
    if (/VAJ_API_KEY/.test(key) && value !== undefined) {
      APIKeys[key] = value;
    }
  }

  // Last api key index
  let lastIndex: number = 0;
  for (const [key, value] of Object.entries(APIKeys)) {
    const index: number = Number(key.match(/\d+/)![0]);
    if (index > lastIndex) {
      lastIndex = index;
    }
  }

  // Generate a new api key
  const newAPIKey: string = generateEnvApiKey(`VAJ_API_KEY_${++lastIndex}`);

  // Log the new key onto the console
  // Logger.info(
  //   `A new key was generated for the VAJ API. Please, copy this new key-value pair onto a new line in the appropriate stage .env file for activation:\n${newAPIKey}`
  // );
}

main();
