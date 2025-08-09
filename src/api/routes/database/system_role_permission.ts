import { Router } from "express";
import initializeDatabaseRouter from "../../database_router";

import { SystemRolePermission } from "../../../classes/transformer-classes";

export const databaseSystemRolePermissionRoute: Router =
  initializeDatabaseRouter("system_role_permission", SystemRolePermission);
