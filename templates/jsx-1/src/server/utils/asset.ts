import { existsSync, readFileSync } from "fs";
import { posix } from "path";

interface AssetMap {
  SOURCE_TO_ROUTE_PATHS: Record<string, string>;
  ROUTE_TO_SOURCE_PATHS: Record<string, string>;
}

interface Config {
  DIST_DIR: string;
  PUBLIC_DIR: string;
  STATIC_MAP_PATH: string;
  STATIC_ROUTE: string;
}

const CONFIG: Config = JSON.parse(readFileSync("src/config.json", "utf8"));
const MAP: AssetMap = existsSync(CONFIG.STATIC_MAP_PATH) ? JSON.parse(readFileSync(CONFIG.STATIC_MAP_PATH, "utf8")) : {
  SOURCE_TO_ROUTE_PATHS: {},
  ROUTE_TO_SOURCE_PATHS: {},
};

export function $dist(srcPath: string) {
  return getAssetRoutePath(posix.join(CONFIG.DIST_DIR, srcPath));
}

export function $public(srcPath: string) {
  return getAssetRoutePath(posix.join(CONFIG.PUBLIC_DIR, srcPath));
}

export function getAssetRoutePath(srcPath: string) {
  const [rawPath, querystring] = srcPath.split("?");
  const filePath = posix.join(".", rawPath);

  const routePath = MAP.SOURCE_TO_ROUTE_PATHS[filePath];
  const routeQuery = querystring ? `?${querystring}` : "";

  return routePath + routeQuery;
}

export function getAssetSourcePath(routePath: string) {
  return MAP.ROUTE_TO_SOURCE_PATHS[routePath];
}
