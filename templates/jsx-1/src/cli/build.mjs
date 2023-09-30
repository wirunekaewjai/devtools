import createHash from "@emotion/hash";
import esbuild from "esbuild";
import { $ } from "execa";
import { readFileSync } from 'fs';
import { mkdir, readFile, rm, writeFile } from "fs/promises";
import { glob } from "glob";
import { posix } from "path";

const IS_PROD = process.env.NODE_ENV === "production";

/** @type {Record<string, string>} */
const {
  DIST_DIR,
  PUBLIC_DIR,
  STATIC_MAP_PATH,
  STATIC_ROUTE,
} = JSON.parse(readFileSync("src/config.json", "utf8"));

async function cleanup() {
  await rm("dist", {
    force: true,
    recursive: true,
  });
  
  await mkdir("dist", {
    recursive: true,
  });
}

async function buildCss() {
  if (IS_PROD) {
    await $({ stdio: "inherit" })`tailwindcss -i src/style.css -o dist/style.css --minify`;
  } else {
    await $({ stdio: "inherit" })`tailwindcss -i src/style.css -o dist/style.css`;
  }
}

async function buildStaticMap() {
  const filePaths = await glob([
    `${PUBLIC_DIR}/**/*`,
    `${DIST_DIR}/**/*.css`,
  ], {
    nodir: true,
    posix: true,
  });
  
  /** @types {Record<string, string>} */
  const SOURCE_TO_ROUTE_PATHS = {};
  
  /** @types {Record<string, string>} */
  const ROUTE_TO_SOURCE_PATHS = {};
  
  for (const rawPath of filePaths) {
    const filePath = posix.join(".", rawPath);
    const fileData = await readFile(filePath);
    const fileHash = createHash(fileData.toString("utf8"));
    const { base } = posix.parse(filePath);
  
    const routePath = posix.join(STATIC_ROUTE, fileHash, base);
  
    SOURCE_TO_ROUTE_PATHS[filePath] = routePath;
    ROUTE_TO_SOURCE_PATHS[routePath] = filePath;
  }
  
  const map = {
    SOURCE_TO_ROUTE_PATHS,
    ROUTE_TO_SOURCE_PATHS,
  };
  
  await writeFile(STATIC_MAP_PATH, JSON.stringify(map, null, 2), "utf8");
  console.log(map);
}

async function buildCode() {
  await esbuild.build({
    entryPoints: [
      {
        in: "src/server/app.ts",
        out: "server/app",
      },
    ],
    outdir: "dist",
    format: "cjs",
    bundle: true,
    packages: "external",
  });
}

async function main() {
  await cleanup();

  await buildCss();
  await buildStaticMap();
  await buildCode();
}

main();