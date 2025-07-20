"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const transformer_classes_1 = require("../../../classes/transformer-classes");
const request_handlers_1 = require("../../request-handlers");
const databaseUserRoute = express_1.default.Router();
// Handeling the route parameters
databaseUserRoute.param("id", request_handlers_1.routParametersHandler);
// Handle the retrieval of the pgClient
databaseUserRoute.use(request_handlers_1.getPgClientHandler);
// Handle request on the param route
databaseUserRoute
    .route("/:id")
    .get((0, request_handlers_1.getRequestOnParamRouteHandlerWrapper)("user", transformer_classes_1.User))
    .post((0, request_handlers_1.postRequestOnParamRouteHandlerWrapper)("user", transformer_classes_1.User))
    .put((0, request_handlers_1.putRequestOnParamRouteHandlerWrapper)("user", transformer_classes_1.User))
    .delete((0, request_handlers_1.deleteRequestOnParamRouteHandlerWrapper)("user", transformer_classes_1.User));
// Handle request on the main route
databaseUserRoute
    .route("/")
    .get((0, request_handlers_1.getRequestOnMainRouteHandlerWrapper)("user", transformer_classes_1.User))
    .post((0, request_handlers_1.postRequestOnMainRouteHandlerWrapper)("user", transformer_classes_1.User))
    .put((0, request_handlers_1.putRequestOnMainRouteHandlerWrapper)("user", transformer_classes_1.User))
    .delete((0, request_handlers_1.deleteRequestOnMainRouteHandlerWrapper)("user", transformer_classes_1.User));
exports.default = databaseUserRoute;
//# sourceMappingURL=user.js.map