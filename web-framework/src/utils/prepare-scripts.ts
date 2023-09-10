import { mkdir, readFile, writeFile } from "node:fs/promises";
import { posix } from "node:path";
import {
  BUILD_TEMP_DIR,
  CLIENT_EXTENSION,
  CLIENT_RESERVED_NAME,
} from "../constants";
import { StaticMap } from "../types";
import { babelGenerate } from "./babel-generate";
import { babelParse } from "./babel-parse";
import { Config } from "./create-config";
import { TsConfig } from "./get-ts-config";
import { resolveImport } from "./resolve-import";

interface Result {
  serverPath: string;
  clientPath: string | null;
}

export async function prepareScripts(
  config: Config,
  tsConfig: TsConfig,
  staticMap: StaticMap,
  sourcePath: string
) {
  const buildDir = config.buildDir;

  const sourceCode = await readFile(sourcePath, "utf8");
  const ast = babelParse(sourceCode, {
    sourceType: "module",
    plugins: ["jsx", "typescript"],
  });

  await resolveImport(tsConfig, sourcePath, ast);
  // await resolveAsset(config, staticMap, ast);

  const statementClients: typeof ast.program.body = [];
  const statementServers: typeof ast.program.body = [];

  let hasClientScript = false;

  ast.program.body.forEach((statement) => {
    if (statement.type.startsWith("TS")) {
      return;
    }

    if (statement.type === "ImportDeclaration") {
      statementClients.push(statement);
      statementServers.push(statement);
      return;
    }

    if (statement.type !== "ExportNamedDeclaration") {
      statementServers.push(statement);
      return;
    }

    if (statement.declaration?.type !== "VariableDeclaration") {
      statementServers.push(statement);
      return;
    }

    const declarators: typeof statement.declaration.declarations = [];

    statement.declaration.declarations.forEach((declarator) => {
      if (declarator.id.type !== "Identifier") {
        declarators.push(declarator);
        return;
      }

      const name = declarator.id.name;

      if (CLIENT_RESERVED_NAME !== name) {
        declarators.push(declarator);
        return;
      }

      const expression = declarator.init;

      if (expression?.type !== "ArrowFunctionExpression") {
        return;
      }

      if (expression.body.type !== "BlockStatement") {
        return;
      }

      statementClients.push(...expression.body.body);
      hasClientScript = true;
    });

    if (declarators.length === 0) {
      return;
    }

    // client-side script removed
    statement.declaration.declarations = declarators;
    statementServers.push(statement);
  });

  const result: Result = {
    serverPath: "",
    clientPath: null,
  };

  // SERVER
  {
    ast.program.body = statementServers;

    const out = babelGenerate(ast);
    const outPath = posix.join(buildDir, BUILD_TEMP_DIR, sourcePath);
    const outDir = posix.dirname(outPath);

    await mkdir(outDir, {
      recursive: true,
    });

    await writeFile(outPath, out.code, "utf8");
    result.serverPath = outPath;
  }

  // CLIENT
  {
    ast.program.body = statementClients;

    if (hasClientScript && statementClients.length > 0) {
      const sourceDir = posix.dirname(sourcePath);
      const sourceExt = posix.extname(sourcePath);
      const sourceName = posix.basename(sourcePath, sourceExt);

      const out = babelGenerate(ast);
      const outExt = CLIENT_EXTENSION;
      const outName = `${sourceName}${outExt}`;
      const outPath = posix.join(buildDir, BUILD_TEMP_DIR, sourceDir, outName);

      const outDir = posix.dirname(outPath);

      await mkdir(outDir, {
        recursive: true,
      });

      await writeFile(outPath, out.code, "utf8");
      result.clientPath = outPath;
    }
  }

  return result;
}
