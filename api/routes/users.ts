import express from "express";
import { Router } from "express";

import { pgClient } from "../server";
import { User, Address } from "../types/types";

const usersRouter: Router = express.Router();

usersRouter
  .route("/:id")
  .get((req, res) => {})
  .post((req, res) => {})
  .put((req, res) => {})
  .delete((req, res) => {});

usersRouter
  .route("/")
  .get((req, res) => {})
  .post((req, res) => {})
  .put((req, res) => {})
  .delete((req, res) => {});

export default usersRouter;
