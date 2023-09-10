import { ParseResult } from "@babel/parser";
import { Node, NodePath } from "@babel/traverse";
import { File } from "@babel/types";
import { StaticMap } from "../types";
import { babelParse } from "./babel-parse";
import { babelTraverse } from "./babel-traverse";
import { collectAsset } from "./collect-asset";
import { Config } from "./create-config";

export async function resolveAsset(
  config: Config,
  staticMap: StaticMap,
  ast: ParseResult<File>
) {
  const transformables: {
    queryPath: string;
    item: NodePath<Node>;
  }[] = [];

  babelTraverse(ast, {
    enter(item) {
      if (item.node.type !== "StringLiteral") {
        return;
      }

      const parentType = item.parentPath?.node.type;

      if (parentType === "ImportDeclaration") {
        return;
      }

      const value = item.node.value;

      if (value.startsWith("/")) {
        transformables.push({
          queryPath: value,
          item: item.parentPath!,
        });
      }
    },
  });

  for await (const { queryPath, item } of transformables) {
    await collectAsset(config, staticMap, queryPath);

    const publicPath = staticMap.private[queryPath];

    if (!publicPath) {
      continue;
    }

    const next = `\`${config.assetPrefix ?? ""}${publicPath}\``;
    const nextAst = babelParse(next);
    const statement = nextAst.program.body[0];

    if (statement.type === "ExpressionStatement") {
      if (item.node.type === "VariableDeclarator") {
        item.node.init = statement.expression;
      } else if (item.node.type === "JSXAttribute") {
        item.node.value = {
          type: "JSXExpressionContainer",
          expression: statement.expression,
        };
      } else if (item.node.type === "ObjectProperty") {
        item.node.value = statement.expression;
      } else if (item.node.type === 'CallExpression') {
        item.node.arguments = item.node.arguments.map((arg) => {
          if (arg.type !== 'StringLiteral') {
            return arg;
          }

          if (arg.value !== queryPath) {
            return arg;
          }

          return statement.expression;
        });
      } else {
        console.log(item);
      }
    }
  }
}
