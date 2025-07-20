"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const transformer_classes_1 = require("../../../classes/transformer-classes");
const request_handlers_1 = require("../../request-handlers");
const databaseSystemAuthenticationRoute = express_1.default.Router();
// Handeling the route parameters
databaseSystemAuthenticationRoute.param("id", request_handlers_1.routParametersHandler);
// Handle the retrieval of the pgClient
databaseSystemAuthenticationRoute.use(request_handlers_1.getPgClientHandler);
// Handle request on the param route
databaseSystemAuthenticationRoute
    .route("/:id")
    .get((0, request_handlers_1.getRequestOnParamRouteHandlerWrapper)("system_authentication", transformer_classes_1.SystemAuthentication))
    .post((0, request_handlers_1.postRequestOnParamRouteHandlerWrapper)("system_authentication", transformer_classes_1.SystemAuthentication))
    .put((0, request_handlers_1.putRequestOnParamRouteHandlerWrapper)("system_authentication", transformer_classes_1.SystemAuthentication))
    .delete((0, request_handlers_1.deleteRequestOnParamRouteHandlerWrapper)("system_authentication", transformer_classes_1.SystemAuthentication));
// Handle request on the main route
databaseSystemAuthenticationRoute
    .route("/")
    .get((0, request_handlers_1.getRequestOnMainRouteHandlerWrapper)("system_authentication", transformer_classes_1.SystemAuthentication))
    .post((0, request_handlers_1.postRequestOnMainRouteHandlerWrapper)("system_authentication", transformer_classes_1.SystemAuthentication))
    .put((0, request_handlers_1.putRequestOnMainRouteHandlerWrapper)("system_authentication", transformer_classes_1.SystemAuthentication))
    .delete((0, request_handlers_1.deleteRequestOnMainRouteHandlerWrapper)("system_authentication", transformer_classes_1.SystemAuthentication));
exports.default = databaseSystemAuthenticationRoute;
//# sourceMappingURL=system_authentication.js.map