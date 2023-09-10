import path from "node:path";
import { BUILD_ROUTE_DIR, SERVER_RESERVED_NAMES } from "../constants";
import { RouteInfo } from "../types";

export function createRouteInfo(
  routePrefix: string,
  sourcePath: string,
  sourceCode: string
): RouteInfo | null {
  const sourceExt = path.extname(sourcePath);
  const routePattern =
    "/" +
    sourcePath
      .slice(routePrefix.length, -sourceExt.length)
      .replace(/\[[^\]]+\]/g, (text) => `:${text.slice(1, -1)}`)
      .replace("/index", "")
      .replace("index", "");

  const methods: string[] = [];

  for (const SERVER_RESERVED_NAME of SERVER_RESERVED_NAMES) {
    if (sourceCode.includes(`export const ${SERVER_RESERVED_NAME}`)) {
      methods.push(SERVER_RESERVED_NAME);
    }
  }

  if (methods.length === 0) {
    return null;
  }

  const moduleName = sourcePath.slice(routePrefix.length, -sourceExt.length);

  return {
    path: routePattern,
    methods,
    modulePath: `./${BUILD_ROUTE_DIR}/` + moduleName,
  };
}
