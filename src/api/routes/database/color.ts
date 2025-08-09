import { Router } from "express";
import initializeDatabaseRouter from "../../database_router";

import { Color } from "../../../classes/transformer-classes";

export const color: Router = initializeDatabaseRouter("color", Color);
