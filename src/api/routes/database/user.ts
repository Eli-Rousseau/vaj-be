import express, { Router } from "express";

import { User } from "../../../classes/transformer-classes";
import {
  routParametersHandler,
  getPgClientHandler,
  getRequestOnParamRouteHandlerWrapper,
  postRequestOnParamRouteHandlerWrapper,
  putRequestOnParamRouteHandlerWrapper,
  deleteRequestOnParamRouteHandlerWrapper,
  getRequestOnMainRouteHandlerWrapper,
  postRequestOnMainRouteHandlerWrapper,
  putRequestOnMainRouteHandlerWrapper,
  deleteRequestOnMainRouteHandlerWrapper,
} from "../../request-handlers";

const databaseUserRoute: Router = express.Router();

// Handeling the route parameters
databaseUserRoute.param("id", routParametersHandler);

// Handle the retrieval of the pgClient
databaseUserRoute.use(getPgClientHandler);

// Handle request on the param route
databaseUserRoute
  .route("/:id")
  .get(getRequestOnParamRouteHandlerWrapper<User>("user", User))
  .post(postRequestOnParamRouteHandlerWrapper<User>("user", User))
  .put(putRequestOnParamRouteHandlerWrapper<User>("user", User))
  .delete(deleteRequestOnParamRouteHandlerWrapper<User>("user", User));

// Handle request on the main route
databaseUserRoute
  .route("/")
  .get(getRequestOnMainRouteHandlerWrapper<User>("user", User))
  .post(postRequestOnMainRouteHandlerWrapper<User>("user", User))
  .put(putRequestOnMainRouteHandlerWrapper<User>("user", User))
  .delete(deleteRequestOnMainRouteHandlerWrapper<User>("user", User));

export default databaseUserRoute;
