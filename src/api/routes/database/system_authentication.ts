import express, { Router } from "express";

import { SystemAuthentication } from "../../../classes/transformer-classes";
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

const databaseSystemAuthenticationRoute: Router = express.Router();

// Handeling the route parameters
databaseSystemAuthenticationRoute.param("id", routParametersHandler);

// Handle the retrieval of the pgClient
databaseSystemAuthenticationRoute.use(getPgClientHandler);

// Handle request on the param route
databaseSystemAuthenticationRoute
  .route("/:id")
  .get(
    getRequestOnParamRouteHandlerWrapper<SystemAuthentication>(
      "system_authentication",
      SystemAuthentication
    )
  )
  .post(
    postRequestOnParamRouteHandlerWrapper<SystemAuthentication>(
      "system_authentication",
      SystemAuthentication
    )
  )
  .put(
    putRequestOnParamRouteHandlerWrapper<SystemAuthentication>(
      "system_authentication",
      SystemAuthentication
    )
  )
  .delete(
    deleteRequestOnParamRouteHandlerWrapper<SystemAuthentication>(
      "system_authentication",
      SystemAuthentication
    )
  );

// Handle request on the main route
databaseSystemAuthenticationRoute
  .route("/")
  .get(
    getRequestOnMainRouteHandlerWrapper<SystemAuthentication>(
      "system_authentication",
      SystemAuthentication
    )
  )
  .post(
    postRequestOnMainRouteHandlerWrapper<SystemAuthentication>(
      "system_authentication",
      SystemAuthentication
    )
  )
  .put(
    putRequestOnMainRouteHandlerWrapper<SystemAuthentication>(
      "system_authentication",
      SystemAuthentication
    )
  )
  .delete(
    deleteRequestOnMainRouteHandlerWrapper<SystemAuthentication>(
      "system_authentication",
      SystemAuthentication
    )
  );

export default databaseSystemAuthenticationRoute;
