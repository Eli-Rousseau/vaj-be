import { Router } from "express";
import initializeDatabaseRouter from "../../database-router";

import { Address } from "../../../classes/transformer-classes";

export const address: Router = initializeDatabaseRouter("address", Address);
