import { Router } from "express";
import initializeDatabaseRouter from "../../database-router";

import { Availability } from "../../../classes/transformer-classes";

export const availability: Router = initializeDatabaseRouter(
  "availability",
  Availability
);
