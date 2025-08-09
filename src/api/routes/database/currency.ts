import { Router } from "express";
import initializeDatabaseRouter from "../../database_router";

import { Currency } from "../../../classes/transformer-classes";

export const currency: Router = initializeDatabaseRouter("currency", Currency);
