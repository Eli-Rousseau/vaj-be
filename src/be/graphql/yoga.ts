import { createYoga } from "graphql-yoga";
import type { GraphQLSchema } from "graphql";

import { logger } from "@/src/core/logger";
import { buildGraphQLSchema } from "@/src/be/graphql/build-schema";
import { AuthVAJ } from "@/src/be/api/auth";

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
      const accessToken =
        (await AuthVAJ.connectAPIUser())?.accessToken || "";

      request.headers.set("authorization", accessToken);
    }
  },
});

export async function initSchema() {
  currentSchema = await buildGraphQLSchema();
  LOGGER.info("GraphQL schema build.");
}

export async function rebuildSchema(force = false) {
  currentSchema = await buildGraphQLSchema(force);
  LOGGER.info("GraphQL schema updated.");
}
