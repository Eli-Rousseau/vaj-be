import { Router } from "express";
import { yoga, initSchema } from "../../graphql/yoga";
import * as handlers from "../../graphql/handlers";
import * as middleware from "../../middleware/handlers";

export async function getGraphQlRouter() {
  const router = Router();

  // Ensure schema is built before any request hits Yoga
  await initSchema();

  router.use("/update-schema", middleware.handleAuthorization(["DEVELOPER"]));
  router.post("/update-schema", handlers.handleGraphQLUpdateSchema);
  router.use(
    middleware.handleAuthorization([
      "DEVELOPER",
      "ADMINISTRATOR",
      "SUPERUSER",
      "USER",
    ]),
  );
  router.use(yoga);

  return router;
}
