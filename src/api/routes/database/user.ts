import { Router } from "express";
import initializeDatabaseRouter from "../../database-router";

import { User } from "../../../classes/transformer-classes";

export const user: Router = initializeDatabaseRouter("user", User);
