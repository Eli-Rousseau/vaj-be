import { Router } from "express";
import initializeDatabaseRouter from "../../database-router";

import { OrderType } from "../../../classes/transformer-classes";

export const orderType: Router = initializeDatabaseRouter(
  "order_type",
  OrderType
);
