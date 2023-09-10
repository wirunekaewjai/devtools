import esbuild from "esbuild";
import { readFile, writeFile } from "node:fs/promises";
import { posix } from "node:path";
import { BUILD_ROUTE_DIR, BUILD_TEMP_DIR } from "../constants";
import {
  BuildInfo,
  EsbuildEntryPoint,
  RouteInfo,
  StaticMap,
} from "../types";
import { babelGenerate } from "./babel-generate";
import { babelParse } from "./babel-parse";
import { buildServerRoutes } from "./build-server-routes";
import { Config } from "./create-config";
import { createRouteInfo } from "./create-route-info";
import { TsConfig } from "./get-ts-config";
import { resolveAsset } from "./resolve-asset";
import { sortRouteInfos } from "./sort-route-infos";

export async function buildServerScripts(
  info: BuildInfo,
  config: Config,
  tsConfig: TsConfig,
  staticMap: StaticMap,
  sourcePaths: string[]
) {
  const { buildDir, routeDir } = config;

  const routePrefix = posix.join(buildDir, BUILD_TEMP_DIR, routeDir) + "/";
  const routeInfos: RouteInfo[] = [];

  const entryPoints: EsbuildEntryPoint[] = [];

  for (const sourcePath of sourcePaths) {
    const sourceCode = await readFile(sourcePath, "utf8");
    const ast = babelParse(sourceCode, {
      sourceType: "module",
      plugins: ["jsx", "typescript"],
    });

    await resolveAsset(config, staticMap, ast);

    const out = babelGenerate(ast);
    await writeFile(sourcePath, out.code, 'utf8');

    if (!sourcePath.startsWith(routePrefix)) {
      continue;
    }

    // const sourceCode = await readFile(sourcePath, "utf8");
    const routeInfo = createRouteInfo(routePrefix, sourcePath, sourceCode);

    if (!routeInfo) {
      continue;
    }

    routeInfos.push(routeInfo);

    const sourceDir = posix.dirname(sourcePath).slice(routePrefix.length);
    const sourceExt = posix.extname(sourcePath);
    const sourceName = posix.basename(sourcePath, sourceExt);
    const entryPoint = {
      in: sourcePath,
      out: posix.join(BUILD_ROUTE_DIR, sourceDir, sourceName),
    };

    entryPoints.push(entryPoint);
  }

  const result = await esbuild.build({
    entryPoints,
    outdir: buildDir,
    bundle: true,
    format: "esm",
    platform: "node",
    packages: "external",
    treeShaking: true,
    metafile: true,
    jsx: "preserve",
  });

  await buildServerRoutes(info, config, tsConfig, staticMap, result);
  return sortRouteInfos(routeInfos);
}
