import { Route, RouterType } from "itty-router";
import { routeInfos } from "../app-info";
import { RouteHandlers } from "./types";

export function createDynamicRoutes(
  router: RouterType<Route, any[]>,
  interceptor?: (res: Response) => Promise<Response>
) {
  for (let i = 0; i < routeInfos.length; i++) {
    const routeInfo = routeInfos[i];

    routeInfo.methods.forEach((method) => {
      const m = method.toLowerCase() as "get" | "post" | "put" | "delete";

      router[m](routeInfo.path, async (req) => {
        const handlers: RouteHandlers = require(routeInfo.modulePath);
        const handler = handlers[method];

        if (interceptor) {
          const res = await handler(req);
          return await interceptor(res);
        }

        return await handler(req);
      });
    });
  }
}
