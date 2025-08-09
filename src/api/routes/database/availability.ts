import { Router } from "express";
import initializeDatabaseRouter from "../../database_router";

import { Availability } from "../../../classes/transformer-classes";

export const databaseAvailabilityRoute: Router = initializeDatabaseRouter(
  "availability",
  Availability
);
