import { Router } from "express";
import * as middleware from "@/src/middleware/handlers";
import * as handlers from "@/src/authentication/handlers";

const router = Router();

router.use(middleware.setAccessTokenOnContext);
router.post("/register", handlers.handleInternalRegister);
router.post("/login", handlers.handleInternalLogin);
router.post("/refresh-token", handlers.handleRefreshToken);

export default router;