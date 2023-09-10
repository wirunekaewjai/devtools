import { mkdir, readFile, writeFile } from "node:fs/promises";
import { posix } from "node:path";
import { VERCEL_OUTPUT_DIR, VERCEL_STATIC_DIR } from "../constants";
import { Config } from "./create-config";

export async function buildVercelStatic(
  config: Config,
  publicMap: Record<string, string>
) {
  const buildDir = config.buildDir;

  for (const key in publicMap) {
    const prev = publicMap[key];
    const next = posix.join(
      VERCEL_OUTPUT_DIR,
      VERCEL_STATIC_DIR,
      prev.slice(buildDir.length + 1)
    );
    const nextDir = posix.dirname(next);

    await mkdir(nextDir, {
      recursive: true,
    });

    const data = await readFile(prev);
    await writeFile(next, data);

    publicMap[key] = next;

    console.log("> copy", next);
  }
}
