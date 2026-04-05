import { Router } from "express";
import * as handlers from "../../authentication/handlers";

const router = Router();

router.post("/register", handlers.handleInternalRegister);
router.post("/login", handlers.handleInternalLogin);
router.post("/refreshToken", handlers.handleRefreshToken);

export default router;