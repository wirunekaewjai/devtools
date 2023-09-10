import esbuild from "esbuild";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { posix } from "node:path";
import {
  BUILD_SCRIPT_DIR,
  BUILD_TEMP_DIR,
  CLIENT_EXTENSION,
} from "../constants";
import { Environment } from "../enums";
import { EsbuildEntryPoint, StaticMap } from "../types";
import { babelGenerate } from "./babel-generate";
import { babelParse } from "./babel-parse";
import { collectContentType } from "./collect-content-type";
import { Config } from "./create-config";
import { createHash } from "./create-hash";
import { TsConfig } from "./get-ts-config";
import { resolveAsset } from "./resolve-asset";

export async function buildClientScripts(
  env: Environment,
  config: Config,
  tsConfig: TsConfig,
  staticMap: StaticMap,
  sourcePaths: string[]
) {
  const buildDir = config.buildDir;
  const entryPoints: EsbuildEntryPoint[] = [];

  for (const sourcePath of sourcePaths) {
    const sourceCode = await readFile(sourcePath, "utf8");
    const ast = babelParse(sourceCode, {
      sourceType: "module",
      plugins: ["jsx", "typescript"],
    });

    await resolveAsset(config, staticMap, ast);

    const out = babelGenerate(ast);
    await writeFile(sourcePath, out.code, 'utf8');

    const sourceDir = posix.dirname(sourcePath);
    const sourceExt = CLIENT_EXTENSION;
    const sourceName = posix.basename(sourcePath, sourceExt);

    if (env === Environment.PRODUCTION) {
      const outHash = await createHash(posix.join(sourceDir, sourceName));
      const outName = `chunk-${outHash.toUpperCase()}`;

      const entryPoint = {
        in: sourcePath,
        out: outName,
      };

      entryPoints.push(entryPoint);
    } else {
      const outName = posix.join(sourceDir, sourceName).replaceAll("/", "_");

      const entryPoint = {
        in: sourcePath,
        out: outName,
      };

      entryPoints.push(entryPoint);
    }
  }

  const publicDir = BUILD_SCRIPT_DIR;

  const outDir = posix.join(buildDir, publicDir);
  const result = await esbuild.build({
    entryPoints,
    outdir: outDir,
    bundle: true,
    format: "esm",
    platform: "browser",
    treeShaking: true,
    splitting: true,
    minifyWhitespace: env === Environment.PRODUCTION,
    metafile: true,
    loader: {
      ".js": "tsx",
      ".ts": "tsx",
    },
    jsx: "automatic",
    jsxImportSource: tsConfig.jsxImportSource,
    jsxSideEffects: true,
  });

  for (const outputPath in result.metafile.outputs) {
    const scriptMeta = result.metafile.outputs[outputPath];
    const scriptExt = posix.extname(outputPath);
    const scriptPath = outputPath.slice(outDir.length + 1);

    if (scriptMeta.entryPoint) {
      const privateDir = posix.join(buildDir, BUILD_TEMP_DIR);

      if (scriptMeta.entryPoint.startsWith(privateDir)) {
        const privateBuildPath = scriptMeta.entryPoint.slice(privateDir.length);
        const privatePath = privateBuildPath.slice(0, -CLIENT_EXTENSION.length) + '.ts';

        const scriptData = await readFile(outputPath);
        const scriptHash = await createHash(scriptData);
        const scriptDir = posix.dirname(scriptPath);
        const scriptName = posix.basename(scriptPath, scriptExt);

        const publicName = `${scriptName}.${scriptHash}${scriptExt}`;
        const publicPath = "/" + posix.join(publicDir, scriptDir, publicName);

        const resourcePath =
          outputPath.slice(0, -scriptExt.length) + `.${scriptHash}${scriptExt}`;
        const resourceDir = posix.dirname(resourcePath);

        await mkdir(resourceDir, {
          recursive: true,
        });

        await writeFile(resourcePath, scriptData);
        await rm(outputPath, {
          force: true,
        });

        staticMap.private[privatePath] = publicPath;
        staticMap.public[publicPath] = resourcePath;

        collectContentType(staticMap, resourcePath);
        continue;
      }
    }

    const privatePath = "/" + posix.join(publicDir, scriptPath);
    const publicPath = "/" + posix.join(publicDir, scriptPath);

    staticMap.private[privatePath] = publicPath;
    staticMap.public[publicPath] = outputPath;

    collectContentType(staticMap, outputPath);
  }
}
