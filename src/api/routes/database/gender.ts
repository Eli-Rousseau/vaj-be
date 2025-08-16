import { Router } from "express";
import initializeDatabaseRouter from "../../database-router";

import { Gender } from "../../../classes/transformer-classes";

export const gender: Router = initializeDatabaseRouter("gender", Gender);
