import { Router } from "express";
import initializeDatabaseRouter from "../../database-router";

import { Brand } from "../../../classes/transformer-classes";

export const brand: Router = initializeDatabaseRouter("brand", Brand);
