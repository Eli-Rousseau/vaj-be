import path from "path";
import { createYoga } from "graphql-yoga";
import type { GraphQLSchema } from "graphql";

import { logger } from "../utils/logger";
import { buildGraphQLSchema } from "./build-schema";

const LOGGER = logger.get({
    source: "src",
    service: "graphql",
    module: path.basename(__filename)
});

let currentSchema: GraphQLSchema | null = null;

export const yoga = createYoga({
  schema: () => {
    if (!currentSchema) {
      throw new Error("GraphQL schema not initialized");
    }
    return currentSchema;
  }
});

export async function initSchema() {
  currentSchema = await buildGraphQLSchema();
  LOGGER.info("GraphQL schema build.")
}

export async function rebuildSchema(force = false) {
  currentSchema = await buildGraphQLSchema(force);
  LOGGER.info("GraphQL schema updated.")
}
