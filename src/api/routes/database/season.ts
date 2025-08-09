import { Router } from "express";
import initializeDatabaseRouter from "../../database_router";

import { Season } from "../../../classes/transformer-classes";

export const season: Router = initializeDatabaseRouter("season", Season);
