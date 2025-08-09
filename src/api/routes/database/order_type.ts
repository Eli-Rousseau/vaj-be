import { Router } from "express";
import initializeDatabaseRouter from "../../database_router";

import { OrderType } from "../../../classes/transformer-classes";

export const databaseOrderTypeRoute: Router = initializeDatabaseRouter(
  "order_type",
  OrderType
);
