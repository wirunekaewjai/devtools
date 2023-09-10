import { Route, RouterType, error } from "itty-router";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { publicMap, typeMap } from "../app-info";

export function createStaticRoute(router: RouterType<Route, any[]>) {
  router.get("/(static|scripts)/*", async (req) => {
    const url = new URL(req.url);
    const publicPath = url.pathname;
    const sourcePath = publicMap[publicPath];
    const sourceExt = path.extname(sourcePath);
    const contentType = typeMap[sourceExt];

    if (!contentType) {
      return error(404);
    }

    const isExists = existsSync(sourcePath);

    if (!isExists) {
      return error(404);
    }

    const data = await readFile(sourcePath);

    return new Response(data, {
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Type": contentType,
      },
    });
  });
}
