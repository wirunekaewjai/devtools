import { createServerAdapter } from "@whatwg-node/server";
import { Route, RouterType } from "itty-router";
import { createServer } from "node:http";

export function createHttpServer(router: RouterType<Route, any[]>) {
  const adapter = createServerAdapter(async (req) => {
    try {
      return await router.handle(req);
    } catch (err) {
      console.log(err);
      return new Response(null, {
        status: 500,
      });
    }
  });

  return createServer(adapter);
}
