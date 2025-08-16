import { Router } from "express";
import initializeDatabaseRouter from "../../database-router";

import { OrderArticle } from "../../../classes/transformer-classes";

export const orderArticle: Router = initializeDatabaseRouter(
  "order_article",
  OrderArticle
);
