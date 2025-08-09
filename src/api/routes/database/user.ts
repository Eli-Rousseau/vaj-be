import { Router } from "express";
import initializeDatabaseRouter from "../../database_router";

import { User } from "../../../classes/transformer-classes";

export const databaseUserRoute: Router = initializeDatabaseRouter("user", User);
