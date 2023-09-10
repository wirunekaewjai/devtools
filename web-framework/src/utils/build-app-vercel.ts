import esbuild from "esbuild";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path, { posix } from "node:path";
import {
  APP_FILE_NAME,
  APP_TEMPLATE_DIR,
  VERCEL_OUTPUT_DIR,
  VERCEL_SERVERLESS_DIR,
  VERCEL_SERVERLESS_NAME,
} from "../constants";
import { BuildInfo, RouteInfo } from "../types";
import { buildAppDeps } from "./build-app-deps";

export async function buildAppVercel(info: BuildInfo, routeInfos: RouteInfo[]) {
  const cwd = path.join(path.resolve(__dirname), "../..");
  const tempDir = posix.join(cwd, `.tmp_${Date.now()}`);

  const serverDir = posix.join(
    VERCEL_OUTPUT_DIR,
    VERCEL_SERVERLESS_DIR,
    VERCEL_SERVERLESS_NAME
  );

  try {
    await mkdir(tempDir, {
      recursive: true,
    });

    await mkdir(serverDir, {
      recursive: true,
    });

    await buildAppDeps(info, {}, routeInfos, {}, cwd, tempDir);

    //// APP TEMPLATE
    const templateName = "app-vercel.ts";

    const templateDir = posix.join(cwd, APP_TEMPLATE_DIR);
    const templatePath = posix.join(templateDir, templateName);
    const template = await readFile(templatePath, "utf8");

    const appName = APP_FILE_NAME;

    const appPathTmp = posix.join(tempDir, templateName);
    const appPath = posix.join(serverDir, appName);

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
      minifyWhitespace: true,
    });
  } finally {
    await rm(tempDir, {
      force: true,
      recursive: true,
    });
  }

  const vcConfig = {
    runtime: "nodejs18.x",
    handler: "app.js",
    launcherType: "Nodejs",
    shouldAddHelpers: true,
  };

  await writeFile(
    posix.join(serverDir, ".vc-config.json"),
    JSON.stringify(vcConfig),
    "utf8"
  );

  await writeFile(
    posix.join(VERCEL_OUTPUT_DIR, "config.json"),
    JSON.stringify({
      version: 3,
    }),
    "utf8"
  );
}
