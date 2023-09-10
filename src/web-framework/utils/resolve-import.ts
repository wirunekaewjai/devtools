import { ParseResult } from "@babel/parser";
import { File } from "@babel/types";
import { posix } from "node:path";
import { babelTraverse } from "./babel-traverse";
import { TsConfig } from "./get-ts-config";
import { resolveAlias } from "./resolve-alias";

export async function resolveImport(
  tsConfig: TsConfig,
  sourcePath: string,
  ast: ParseResult<File>
) {
  const sourceDir = posix.dirname(sourcePath);
  const aliases = Object.keys(tsConfig.aliases);

  babelTraverse(ast, {
    enter(item) {
      if (item.node.type !== "StringLiteral") {
        return;
      }

      const parentType = item.parentPath?.node.type;

      if (parentType === "ImportDeclaration") {
        const importPath = item.node.value;

        for (const alias of aliases) {
          if (importPath.startsWith(alias)) {
            const absolutePath = resolveAlias(tsConfig, item.node.value);
            const relativePath = "./" + posix.relative(sourceDir, absolutePath);

            item.node.value = relativePath;
            break;
          }
        }
      }
    },
  });
}
