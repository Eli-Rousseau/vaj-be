import { Router } from "express";
import * as handlers from "@/src/be/api/service/authentication/handlers";

const router = Router();

router.post("/register", handlers.handleRegister);
router.post("/login", handlers.handleLogin);
router.post("/refresh-token", handlers.handleRefresh);

export default router;
