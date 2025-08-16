import { Router } from "express";
import initializeDatabaseRouter from "../../database-router";

import { SystemRole } from "../../../classes/transformer-classes";

export const systemRole: Router = initializeDatabaseRouter(
  "system_role",
  SystemRole
);
