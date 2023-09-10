import dotenv from "dotenv";
import { Router } from "itty-router";
import { createDynamicRoutes } from "./dependencies/create-dynamic-routes";
import { createHttpServer } from "./dependencies/create-http-server";

dotenv.config();

const router = Router();

createDynamicRoutes(router);

const server = createHttpServer(router);
export default server;
