import { Router } from "express";
import initializeDatabaseRouter from "../../database_router";

import { OrderArticle } from "../../../classes/transformer-classes";

export const databaseOrderArticleRoute: Router = initializeDatabaseRouter(
  "order_article",
  OrderArticle
);
