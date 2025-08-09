import { Router } from "express";
import initializeDatabaseRouter from "../../database_router";

import { Condition } from "../../../classes/transformer-classes";

export const databaseConditionRoute: Router = initializeDatabaseRouter(
  "condition",
  Condition
);
