import autoprefixer from "autoprefixer";
import cssnano from "cssnano";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import postcss from "postcss";
import tailwind from "tailwindcss";
import { BUILD_STATIC_DIR } from "../constants";
import { Environment } from "../enums";
import { StaticMap } from "../types";
import { collectContentType } from "./collect-content-type";
import { Config } from "./create-config";
import { createHash } from "./create-hash";

const posix = path.posix;

export async function buildTailwind(
  env: Environment,
  config: Config,
  staticMap: StaticMap
) {
  if (!config.tailwind || config.tailwind.length === 0) {
    return;
  }

  const buildDir = config.buildDir;

  for (const item of config.tailwind) {
    const config = require(path.resolve(item.config));
    const postcssPlugins: postcss.AcceptedPlugin[] = [
      tailwind(config),
      autoprefixer(),
    ];

    if (env === Environment.PRODUCTION) {
      postcssPlugins.push(cssnano());
    }

    let sourcePath = item.css;

    if (sourcePath.startsWith("./")) {
      sourcePath.slice(2);
    }

    if (sourcePath.startsWith("../")) {
      sourcePath.slice(3);
    }

    const key = `> build: ${sourcePath} (${item.config})`;
    console.time(key);

    const cssData = await readFile(item.css, "utf8");
    const cssResult = await postcss(postcssPlugins).process(cssData, {
      from: item.css,
    });

    const sourceExt = path.extname(sourcePath);
    const sourceName = path.basename(sourcePath, sourceExt);

    const outData = cssResult.css;
    const outDir = posix.join(buildDir, BUILD_STATIC_DIR);
    const outHash = await createHash(outData);
    const outName = `${sourceName}.${outHash}${sourceExt}`;
    const outPath = posix.join(outDir, outName);

    await mkdir(outDir, {
      recursive: true,
    });

    await writeFile(outPath, outData, "utf8");

    const publicPath = `/${BUILD_STATIC_DIR}/${outName}`;
    const privatePath = `/${sourcePath}`;

    staticMap.private[privatePath] = publicPath;
    staticMap.public[publicPath] = outPath;

    collectContentType(staticMap, outPath);
    console.timeEnd(key);
  }
}
