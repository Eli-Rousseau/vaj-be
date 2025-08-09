import { Router } from "express";
import initializeDatabaseRouter from "../../database_router";

import { Address } from "../../../classes/transformer-classes";

export const address: Router = initializeDatabaseRouter("address", Address);
