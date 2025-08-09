import { Router } from "express";
import initializeDatabaseRouter from "../../database_router";

import { PaymentMethod } from "../../../classes/transformer-classes";

export const databasePaymentMethodRoute: Router = initializeDatabaseRouter(
  "payment_method",
  PaymentMethod
);
