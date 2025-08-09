import { Router } from "express";
import initializeDatabaseRouter from "../../database_router";

import { SystemPermission } from "../../../classes/transformer-classes";

export const systemPermission: Router = initializeDatabaseRouter(
  "system_permission",
  SystemPermission
);
