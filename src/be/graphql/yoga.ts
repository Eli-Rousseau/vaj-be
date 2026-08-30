import { createYoga } from "graphql-yoga";
import type { GraphQLSchema } from "graphql";

import { logger } from "@/src/core/logger";
import { buildGraphQLSchema } from "@/src/be/graphql/build-schema";
import VAJClient from "@/src/core/sdk/vaj";

const LOGGER = logger.get();

let currentSchema: GraphQLSchema | null = null;

export const yoga = createYoga({
  schema: () => {
    if (!currentSchema) {
      throw new Error("GraphQL schema not initialized");
    }
    return currentSchema;
  },

  context: async ({ request }) => {
    const authorization = request.headers.get("authorization");

    if (!authorization && process.env.STAGE === "dev") {
      const vajClient = await VAJClient.withAPIUserAuth();
      const accessToken = (await vajClient.auth.connect())?.accessToken || "";

      request.headers.set("authorization", accessToken);
    }
  },
});

export async function initSchema() {
  currentSchema = await buildGraphQLSchema();
  LOGGER.info("GraphQL schema build.");
}

export async function rebuildSchema() {
  currentSchema = await buildGraphQLSchema(true);
  LOGGER.info("GraphQL schema updated.");
}
