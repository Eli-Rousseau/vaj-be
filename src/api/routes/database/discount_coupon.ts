import { Router } from "express";
import initializeDatabaseRouter from "../../database-router";

import { DiscountCoupon } from "../../../classes/transformer-classes";

export const discountCoupon: Router = initializeDatabaseRouter(
  "discount_coupon",
  DiscountCoupon
);
