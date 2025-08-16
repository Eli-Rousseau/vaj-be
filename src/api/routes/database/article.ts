import { Router } from "express";
import initializeDatabaseRouter from "../../database-router";

import { Article } from "../../../classes/transformer-classes";

export const article: Router = initializeDatabaseRouter("article", Article);
