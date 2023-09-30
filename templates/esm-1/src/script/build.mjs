import createHash from "@emotion/hash";
import { $ } from "execa";
import { mkdir, readFile, rm, writeFile } from "fs/promises";
import { glob } from "glob";
import { posix } from "path";

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
  await $({ stdio: "inherit" })`tailwindcss -i src/style.css -o dist/style.css --minify`;
}

async function buildStaticMap() {
  const filePaths = await glob([
    "public/**/*",
    "dist/**/*.css",
  ], {
    nodir: true,
    posix: true,
  });
  
  /** @type {Record<string, string>} */
  const SOURCE_TO_ROUTE_PATHS = {};
  
  /** @type {Record<string, string>} */
  const ROUTE_TO_SOURCE_PATHS = {};
  
  for (const rawPath of filePaths) {
    const filePath = posix.join(".", rawPath);
    const fileData = await readFile(filePath);
    const fileHash = createHash(fileData.toString("utf8"));
    const { base } = posix.parse(filePath);
  
    const routePath = posix.join("/static", fileHash, base);
  
    SOURCE_TO_ROUTE_PATHS[filePath] = routePath;
    ROUTE_TO_SOURCE_PATHS[routePath] = filePath;
  }
  
  const map = {
    SOURCE_TO_ROUTE_PATHS,
    ROUTE_TO_SOURCE_PATHS,
  };
  
  await writeFile("dist/static.json", JSON.stringify(map, null, 2), "utf8");
  // console.log(map);
}

async function main() {
  await cleanup();

  await buildCss();
  await buildStaticMap();
}

main();