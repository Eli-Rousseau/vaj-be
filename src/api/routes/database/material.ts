import { Router } from "express";
import initializeDatabaseRouter from "../../database-router";

import { Material } from "../../../classes/transformer-classes";

export const material: Router = initializeDatabaseRouter("material", Material);
