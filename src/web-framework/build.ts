import { rm } from "node:fs/promises";
import { posix } from "node:path";
import { BUILD_TEMP_DIR } from "./constants";
import { Builder, Environment } from "./enums";
import { BuildInfo, StaticMap } from "./types";
import { buildAppNode } from "./utils/build-app-node";
import { buildAppVercel } from "./utils/build-app-vercel";
import { buildClientScripts } from "./utils/build-client-scripts";
import { buildServerScripts } from "./utils/build-server-scripts";
import { buildTailwind } from "./utils/build-tailwind";
import { buildVercelDeps } from "./utils/build-vercel-deps";
import { buildVercelRoutes } from "./utils/build-vercel-routes";
import { buildVercelStatic } from "./utils/build-vercel-static";
import { Config } from "./utils/create-config";
import { getSourcePaths } from "./utils/get-source-paths";
import { getTsConfig } from "./utils/get-ts-config";
import { prepareScripts } from "./utils/prepare-scripts";

export async function build(
  env: Environment,
  builder: Builder,
  config: Config
) {
  const info: BuildInfo = {
    builder,
    env,
    id: Date.now().toString(10),
  };

  const buildDir = config.buildDir;
  const tsConfig = await getTsConfig(config.tsconfig);
  const sourcePaths = await getSourcePaths(tsConfig);

  const staticMap: StaticMap = {
    private: {},
    public: {},
    types: {},
  };

  if (config.tailwind.length > 0) {
    await buildTailwind(env, config, staticMap);
  }

  const clientPaths: string[] = [];
  const serverPaths: string[] = [];

  for (const sourcePath of sourcePaths) {
    const key = `> prepare: ${sourcePath}`;
    console.time(key);

    const prepareResult = await prepareScripts(config, tsConfig, staticMap, sourcePath);

    if (prepareResult.clientPath) {
      clientPaths.push(prepareResult.clientPath);
    }

    if (prepareResult.serverPath) {
      serverPaths.push(prepareResult.serverPath);
    }

    console.timeEnd(key);
  }

  console.time("> build: client scripts");
  await buildClientScripts(env, config, tsConfig, staticMap, clientPaths);
  console.timeEnd("> build: client scripts");

  console.time("> build: server scripts");
  const routeInfos = await buildServerScripts(
    info,
    config,
    tsConfig,
    staticMap,
    serverPaths
  );
  console.timeEnd("> build: server scripts");

  console.time("> build: app");

  if (builder === Builder.NODE) {
    await buildAppNode(
      info,
      config,
      staticMap.public,
      routeInfos,
      staticMap.types
    );
  } else {
    await buildVercelStatic(config, staticMap.public);
    await buildVercelRoutes(config);
    await buildVercelDeps(config);

    await buildAppVercel(info, routeInfos);

    // cleanup build dir
    await rm(buildDir, {
      force: true,
      recursive: true,
    });
  }

  console.timeEnd("> build: app");

  await rm(posix.join(buildDir, BUILD_TEMP_DIR), {
    force: true,
    recursive: true,
  });

  if (env === Environment.PRODUCTION) {
    console.log();
    console.log(staticMap);
    console.log();
  }
}
