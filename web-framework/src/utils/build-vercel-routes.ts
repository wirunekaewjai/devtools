import { glob } from "glob";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { posix } from "node:path";
import {
  BUILD_ROUTE_DIR,
  VERCEL_OUTPUT_DIR,
  VERCEL_SERVERLESS_DIR,
  VERCEL_SERVERLESS_NAME,
} from "../constants";
import { Config } from "./create-config";

export async function buildVercelRoutes(config: Config) {
  const buildDir = config.buildDir;

  const srcDir = posix.join(buildDir, BUILD_ROUTE_DIR);
  const dstDir = posix.join(
    VERCEL_OUTPUT_DIR,
    VERCEL_SERVERLESS_DIR,
    VERCEL_SERVERLESS_NAME,
    BUILD_ROUTE_DIR
  );

  const srcPaths = await glob(`${srcDir}/**/*`, {
    posix: true,
    nodir: true,
  });

  for (const prev of srcPaths) {
    const next = posix.join(dstDir, prev.slice(srcDir.length + 1));
    const nextDir = posix.dirname(next);

    await mkdir(nextDir, {
      recursive: true,
    });

    const data = await readFile(prev);
    await writeFile(next, data);

    console.log("> copy", next);
  }
}
