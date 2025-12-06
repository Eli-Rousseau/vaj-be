// import express, { Router } from "express";

// import {
//   routeParametersHandler,
//   getPgClientHandler,
//   getRequestOnParamRouteHandlerWrapper,
//   postRequestOnParamRouteHandlerWrapper,
//   putRequestOnParamRouteHandlerWrapper,
//   deleteRequestOnParamRouteHandlerWrapper,
//   getRequestOnMainRouteHandlerWrapper,
//   postRequestOnMainRouteHandlerWrapper,
//   putRequestOnMainRouteHandlerWrapper,
//   deleteRequestOnMainRouteHandlerWrapper,
// } from "./request-handlers";

// const initializeDatabaseRouter = function (
//   clsName: string,
//   cls: new (...args: any[]) => any
// ): Router {
//   let router: Router;

//   // Create the new router
//   router = express.Router();

//   // Handeling the route parameters
//   router.param("id", routeParametersHandler);

//   // Handle the retrieval of the pgClient
//   router.use(getPgClientHandler);

//   // Handle request on the param route
//   router
//     .route("/:id")
//     .get(getRequestOnParamRouteHandlerWrapper<typeof cls>(clsName, cls))
//     .post(postRequestOnParamRouteHandlerWrapper<typeof cls>(clsName, cls))
//     .put(putRequestOnParamRouteHandlerWrapper<typeof cls>(clsName, cls))
//     .delete(deleteRequestOnParamRouteHandlerWrapper<typeof cls>(clsName, cls));

//   // Handle request on the main route
//   router
//     .route("/")
//     .get(getRequestOnMainRouteHandlerWrapper<typeof cls>(clsName, cls))
//     .post(postRequestOnMainRouteHandlerWrapper<typeof cls>(clsName, cls))
//     .put(putRequestOnMainRouteHandlerWrapper<typeof cls>(clsName, cls))
//     .delete(deleteRequestOnMainRouteHandlerWrapper<typeof cls>(clsName, cls));

//   return router;
// };

// export default initializeDatabaseRouter;
