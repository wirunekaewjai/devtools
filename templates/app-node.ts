import dotenv from "dotenv";
import { Router } from "itty-router";
import { createDynamicRoutes } from "./dependencies/create-dynamic-routes";
import { createHttpServer } from "./dependencies/create-http-server";
import { createStaticRoute } from "./dependencies/create-static-route";
import { startHttpServer } from "./dependencies/start-http-server";

dotenv.config();

const router = Router();

createStaticRoute(router);
createDynamicRoutes(router);

const server = createHttpServer(router);

startHttpServer(server);
