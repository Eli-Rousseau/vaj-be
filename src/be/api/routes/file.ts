import { Router } from "express";

import * as handlers from "@/src/be/api/service/file/handlers";

const router = Router();

router.get("/:sequentialId", handlers.getFile);
router.post("/", handlers.uploadFile);
router.delete("/", handlers.deleteFile);

export default router;
