import { Router } from "express";
import initializeDatabaseRouter from "../../database_router";

import { OrderStatus } from "../../../classes/transformer-classes";

export const orderStatus: Router = initializeDatabaseRouter(
  "order_status",
  OrderStatus
);
