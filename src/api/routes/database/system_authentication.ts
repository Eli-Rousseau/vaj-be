import { Router } from "express";
import initializeDatabaseRouter from "../../database_router";

import { SystemAuthentication } from "../../../classes/transformer-classes";

export const databaseSystemAuthenticationRoute: Router =
  initializeDatabaseRouter("system_authentication", SystemAuthentication);
