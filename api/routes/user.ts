import express from "express";
import { Router } from "express";

import { pgClient } from "../server";

// import { User, Address } from "../types/classes";

const userRouter: Router = express.Router();

userRouter.param("id", (req, res, next, value) => {
  (req as any).id = value;
  next();
});

userRouter
  .route("/:id")
  .get((req, res) => {})
  .post((req, res) => {})
  .put((req, res) => {})
  .delete((req, res) => {});

userRouter
  .route("/")
  .get((req, res) => {})
  .post((req, res) => {})
  .put((req, res) => {})
  .delete((req, res) => {});

export default userRouter;
