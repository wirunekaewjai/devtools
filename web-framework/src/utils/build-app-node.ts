import esbuild from "esbuild";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path, { posix } from "node:path";
import { APP_FILE_NAME, APP_TEMPLATE_DIR } from "../constants";
import { Environment } from "../enums";
import { BuildInfo, RouteInfo } from "../types";
import { buildAppDeps } from "./build-app-deps";
import { Config } from "./create-config";

export async function buildAppNode(
  info: BuildInfo,
  config: Config,
  publicMap: Record<string, string>,
  routeInfos: RouteInfo[],
  typeMap: Record<string, string>
) {
  const isProd = info.env === Environment.PRODUCTION;

  const cwd = path.join(path.resolve(__dirname), "../..");

  const buildDir = config.buildDir;
  const tempDir = posix.join(cwd, `.tmp_${Date.now()}`);

  try {
    await mkdir(tempDir, {
      recursive: true,
    });

    await buildAppDeps(info, publicMap, routeInfos, typeMap, cwd, tempDir);

    //// APP TEMPLATE
    const templateName = isProd ? "app-node.ts" : "app-node-dev.ts";

    const templateDir = posix.join(cwd, APP_TEMPLATE_DIR);
    const templatePath = posix.join(templateDir, templateName);
    const template = await readFile(templatePath, "utf8");

    const appName = APP_FILE_NAME;

    const appPathTmp = posix.join(tempDir, templateName);
    const appPath = posix.join(buildDir, appName);

    await writeFile(appPathTmp, template, "utf8");

    await esbuild.build({
      entryPoints: [appPathTmp],
      outfile: appPath,
      format: "cjs",
      loader: {
        ".js": "ts",
        ".ts": "ts",
      },
      bundle: true,
      platform: "node",
      minifyWhitespace: isProd,
    });
  } finally {
    await rm(tempDir, {
      force: true,
      recursive: true,
    });
  }
}
