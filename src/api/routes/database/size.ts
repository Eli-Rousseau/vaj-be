import { Router } from "express";
import initializeDatabaseRouter from "../../database-router";

import { Size } from "../../../classes/transformer-classes";

export const size: Router = initializeDatabaseRouter("size", Size);
