import { Router } from "express";
import { yoga, initSchema } from "../../graphql/yoga";
import { handleGraphQLUpdateSchema } from "../../graphql/handlers";

export async function getGraphQlRouter() {
  const router = Router();

  // Ensure schema is built before any request hits Yoga
  await initSchema();

  router.post("/update-schema", handleGraphQLUpdateSchema);
  router.use(yoga);

  return router;
}
