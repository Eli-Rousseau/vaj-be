import { Router } from "express";
import initializeDatabaseRouter from "../../database-router";

import { SystemPermission } from "../../../classes/transformer-classes";

export const systemPermission: Router = initializeDatabaseRouter(
  "system_permission",
  SystemPermission
);
