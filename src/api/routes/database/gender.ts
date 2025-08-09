import { Router } from "express";
import initializeDatabaseRouter from "../../database_router";

import { Gender } from "../../../classes/transformer-classes";

export const gender: Router = initializeDatabaseRouter("gender", Gender);
