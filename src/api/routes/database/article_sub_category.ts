import { Router } from "express";
import initializeDatabaseRouter from "../../database_router";

import { ArticleSubCategory } from "../../../classes/transformer-classes";

export const databaseArticleSubCategoryRoute: Router = initializeDatabaseRouter(
  "article_sub_category",
  ArticleSubCategory
);
