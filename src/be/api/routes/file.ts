import { Router } from "express";

import * as handlers from "@/src/be/api/service/file/handlers";
import * as middleware from "@/src/be/api/middleware/handlers";

const router = Router();

router.get("/:sequentialId", handlers.handleGet);
router.use("/", (req, res, next) =>
  middleware.handleAuthorization(req, res, next, [
    "ADMINISTRATOR","DEVELOPER"
  ]),
);
router.post("/", handlers.handleUpload);
router.delete("/:sequentialId", handlers.handleDelete);

export default router;
