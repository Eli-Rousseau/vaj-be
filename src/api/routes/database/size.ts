import { Router } from "express";
import initializeDatabaseRouter from "../../database_router";

import { Size } from "../../../classes/transformer-classes";

export const databaseSizeRoute: Router = initializeDatabaseRouter("size", Size);
