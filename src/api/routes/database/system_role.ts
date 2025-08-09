import { Router } from "express";
import initializeDatabaseRouter from "../../database_router";

import { SystemRole } from "../../../classes/transformer-classes";

export const databaseSystemRoleRoute: Router = initializeDatabaseRouter(
  "system_role",
  SystemRole
);
