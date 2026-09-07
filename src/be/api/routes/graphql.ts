import { Router } from "express";
import { yoga, initSchema } from "@/src/be/graphql/yoga";
import * as handlers from "@/src/be/api/service/graphql/handlers";
import * as middleware from "@/src/be/api/middleware/handlers";

export async function getGraphQlRouter() {
  const router = Router();

  // Ensure schema is built before any request hits Yoga
  await initSchema();

  router.use("/update-schema", (req, res, next) =>
    middleware.handleAuthorization(req, res, next, ["DEVELOPER"]),
  );
  router.post("/update-schema", handlers.handleUpdateSchema);
  router.use(yoga);

  return router;
}
