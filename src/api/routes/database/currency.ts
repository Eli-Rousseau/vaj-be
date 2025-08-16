import { Router } from "express";
import initializeDatabaseRouter from "../../database-router";

import { Currency } from "../../../classes/transformer-classes";

export const currency: Router = initializeDatabaseRouter("currency", Currency);
