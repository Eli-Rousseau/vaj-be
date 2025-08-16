import { Router } from "express";
import initializeDatabaseRouter from "../../database-router";

import { Color } from "../../../classes/transformer-classes";

export const color: Router = initializeDatabaseRouter("color", Color);
