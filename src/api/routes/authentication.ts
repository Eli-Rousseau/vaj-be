import { Router } from "express";
import { handleInternalRegister } from "../../authentication/handlers";

const router = Router();

router.post("/internal/register", handleInternalRegister);

export default router;