import { Router } from "express";
import initializeDatabaseRouter from "../../database_router";

import { Season } from "../../../classes/transformer-classes";

export const databaseSeasonRoute: Router = initializeDatabaseRouter(
  "season",
  Season
);
