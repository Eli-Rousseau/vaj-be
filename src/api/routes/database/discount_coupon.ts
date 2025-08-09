import { Router } from "express";
import initializeDatabaseRouter from "../../database_router";

import { DiscountCoupon } from "../../../classes/transformer-classes";

export const databaseDiscountCouponRoute: Router = initializeDatabaseRouter(
  "discount_coupon",
  DiscountCoupon
);
