import { readFileSync } from "fs";
import { posix } from "path";

/**
 * @typedef AssetMap
 * @property {Record<string, string>} SOURCE_TO_ROUTE_PATHS
 * @property {Record<string, string>} ROUTE_TO_SOURCE_PATHS
 */

/** @type {AssetMap} */
const MAP = JSON.parse(readFileSync("dist/static.json", "utf8"));

/**
 * @param {string} srcPath 
 * @returns {string}
 */
export function $dist(srcPath) {
  return getAssetRoutePath(posix.join("dist", srcPath));
}

/**
 * @param {string} srcPath 
 * @returns {string}
 */
export function $public(srcPath) {
  return getAssetRoutePath(posix.join("public", srcPath));
}

/**
 * @param {string} srcPath 
 * @returns {string}
 */
export function getAssetRoutePath(srcPath) {
  const [rawPath, querystring] = srcPath.split("?");
  const filePath = posix.join(".", rawPath);

  const routePath = MAP.SOURCE_TO_ROUTE_PATHS[filePath];
  const routeQuery = querystring ? `?${querystring}` : "";

  return routePath + routeQuery;
}

/**
 * @param {string} routePath 
 * @returns {string}
 */
export function getAssetSourcePath(routePath) {
  return MAP.ROUTE_TO_SOURCE_PATHS[routePath];
}
