import { Router } from "express";
import initializeDatabaseRouter from "../../database-router";

import { Order } from "../../../classes/transformer-classes";

export const order: Router = initializeDatabaseRouter("order", Order);
