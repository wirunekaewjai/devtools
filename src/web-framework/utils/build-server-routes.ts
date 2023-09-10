import { JSXElement } from "@babel/types";
import esbuild from "esbuild";
import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { posix } from "node:path";
import {
  BUILD_TEMP_DIR,
  CLIENT_SCRIPT_INJECTION_TARGET,
} from "../constants";
import { Environment } from "../enums";
import { BuildInfo, EsbuildEntryPoint, StaticMap } from "../types";
import { babelGenerate } from "./babel-generate";
import { babelParse } from "./babel-parse";
import { babelTraverse } from "./babel-traverse";
import { Config } from "./create-config";
import { TsConfig } from "./get-ts-config";

export async function buildServerRoutes(
  info: BuildInfo,
  config: Config,
  tsConfig: TsConfig,
  staticMap: StaticMap,
  result: esbuild.BuildResult<{ metafile: true }>
) {
  const buildDir = config.buildDir;
  const entryPoints: EsbuildEntryPoint[] = [];

  for (const outputPath in result.metafile.outputs) {
    const meta = result.metafile.outputs[outputPath];
    const inputPaths = Object.keys(meta.inputs);
    const scriptElements: JSXElement[] = [];

    for (const inputPath of inputPaths) {
      const inputExt = posix.extname(inputPath);
      const inputScript =
        inputPath.slice(0, -inputExt.length) + '.ts';

      if (existsSync(inputScript)) {
        const privatePathPrefix = posix.join(buildDir, BUILD_TEMP_DIR);

        const privatePath = inputScript.slice(privatePathPrefix.length);
        const publicPath = staticMap.private[privatePath];

        if (!publicPath) {
          continue;
        }

        const scriptTag = `<script type="module" src="${publicPath}"></script>`;
        const scriptAst = babelParse(scriptTag, {
          plugins: ["jsx"],
        });

        const statement = scriptAst.program.body[0];

        if (statement?.type !== "ExpressionStatement") {
          continue;
        }

        if (statement.expression.type !== "JSXElement") {
          continue;
        }

        scriptElements.push(statement.expression);
      }
    }

    const sourceCode = await readFile(outputPath, "utf8");

    const ast = babelParse(sourceCode, {
      sourceType: "module",
      plugins: ["jsx", "typescript"],
    });

    babelTraverse(ast, {
      enter(item) {
        if (item.node.type !== "JSXElement") {
          return;
        }

        const identifier = item.node.openingElement.name;

        if (
          identifier.type === "JSXIdentifier" &&
          identifier.name === CLIENT_SCRIPT_INJECTION_TARGET
        ) {
          item.node.children.push(...scriptElements);
        }
      },
    });

    const out = babelGenerate(ast);

    await writeFile(outputPath, out.code, "utf8");

    const outputExt = posix.extname(outputPath);

    entryPoints.push({
      in: outputPath,
      out: outputPath.slice(0, -outputExt.length),
    });
  }

  await esbuild.build({
    entryPoints,
    outdir: ".",
    allowOverwrite: true,
    bundle: true,
    format: "cjs",
    loader: {
      ".js": "tsx",
    },
    jsx: "automatic",
    jsxImportSource: tsConfig.jsxImportSource,
    jsxSideEffects: true,
    platform: "node",
    treeShaking: true,
    external: config.externals,
    minifyWhitespace: info.env === Environment.PRODUCTION,
  });
}
