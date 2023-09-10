import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  VERCEL_OUTPUT_DIR,
  VERCEL_SERVERLESS_DIR,
  VERCEL_SERVERLESS_NAME,
} from "../constants";
import { Config } from "./create-config";

function getCommand() {
  if (existsSync("pnpm-lock.yaml")) {
    return "pnpm install --prod";
  }

  return "npm install --omit=dev";
}

async function createPackageJson(config: Config) {
  const pkg = await readFile("package.json", "utf8");
  const pkgJson = JSON.parse(pkg);
  const pkgDeps = pkgJson.dependencies ?? {};
  const deps: Record<string, string> = {};

  for (const external of config.externals) {
    if (pkgDeps[external]) {
      deps[external] = pkgDeps[external];
    }
  }

  return {
    dependencies: deps,
  };
}

export async function buildVercelDeps(config: Config) {
  const pkgJson = await createPackageJson(config);

  const funcDir = path.posix.join(
    VERCEL_OUTPUT_DIR,
    VERCEL_SERVERLESS_DIR,
    VERCEL_SERVERLESS_NAME
  );

  const dstPath = path.posix.join(funcDir, "package.json");

  await writeFile(dstPath, JSON.stringify(pkgJson), "utf8");

  const cmd = `cd ${funcDir} && ${getCommand()}`;

  console.log();
  console.log(">", cmd);
  console.log();

  execSync(cmd, {
    stdio: "inherit",
  });

  console.log();
}
