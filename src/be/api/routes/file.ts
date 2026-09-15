import { Router } from "express";

import * as handlers from "@/src/be/api/service/file/handlers";

const router = Router();

router.get("/:sequentialId", handlers.handleGet);
router.post("/", handlers.handleUpload);
router.delete("/:sequentialId", handlers.handleDelete);

export default router;
