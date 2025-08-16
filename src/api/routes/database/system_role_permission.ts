import { Router } from "express";
import initializeDatabaseRouter from "../../database-router";

import { SystemRolePermission } from "../../../classes/transformer-classes";

export const systemRolePermission: Router = initializeDatabaseRouter(
  "system_role_permission",
  SystemRolePermission
);
