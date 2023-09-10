import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { posix } from "node:path";
import { APP_DEPENDENCY_DIR, APP_TEMPLATE_DIR } from "../constants";
import { BuildInfo, RouteInfo } from "../types";

export async function buildAppDeps(
  info: BuildInfo,
  publicMap: Record<string, string>,
  routeInfos: RouteInfo[],
  typeMap: Record<string, string>,
  cwd: string,
  tempDir: string
) {
  const appInfoName = "app-info.ts";
  const appInfoPath = posix.join(tempDir, appInfoName);
  const appInfoCode = [
    `export const env = ${JSON.stringify({ id: info.id }, null, 2)};`,
    `export const publicMap = ${JSON.stringify(publicMap, null, 2)};`,
    `export const routeInfos = ${JSON.stringify(routeInfos, null, 2)};`,
    `export const typeMap = ${JSON.stringify(typeMap, null, 2)};`,
  ].join("\n");

  await writeFile(appInfoPath, appInfoCode, "utf8");

  const templateDir = posix.join(cwd, APP_TEMPLATE_DIR);

  const srcDir = posix.join(templateDir, APP_DEPENDENCY_DIR);
  const srcNames = await readdir(srcDir);

  for (const srcName of srcNames) {
    const srcPath = posix.join(srcDir, srcName);
    const dstPath = posix.join(tempDir, APP_DEPENDENCY_DIR, srcName);
    const dstDir = posix.dirname(dstPath);

    await mkdir(dstDir, {
      recursive: true,
    });

    const data = await readFile(srcPath);
    await writeFile(dstPath, data);
  }
}
