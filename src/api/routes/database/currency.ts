import { Router } from "express";
import initializeDatabaseRouter from "../../database_router";

import { Currency } from "../../../classes/transformer-classes";

export const databaseCurrencyRoute: Router = initializeDatabaseRouter(
  "currency",
  Currency
);
