import { Router } from "express";
import initializeDatabaseRouter from "../../database-router";

import { OrderStatus } from "../../../classes/transformer-classes";

export const orderStatus: Router = initializeDatabaseRouter(
  "order_status",
  OrderStatus
);
