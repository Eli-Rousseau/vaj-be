import { Router } from "express";
import initializeDatabaseRouter from "../../database-router";

import { ArticleParentCategory } from "../../../classes/transformer-classes";

export const articleParentCategory: Router = initializeDatabaseRouter(
  "article_parent_category",
  ArticleParentCategory
);
