import { Node, NodePath } from "@babel/traverse";
import { readFile, writeFile } from "fs/promises";
import { glob } from "glob";
import z from "zod";
import { StaticMap } from "./types";
import { babelParse } from "./utils/babel-parse";
import { babelTraverse } from "./utils/babel-traverse";
import { collectAsset } from "./utils/collect-asset";
import { babelGenerate } from "./utils/babel-generate";

const configSchema = z.object({
  content: z.string().nonempty().array(),
  output: z.string().nonempty().default("static"),
});

export async function buildAssets(input: z.input<typeof configSchema>) {
  const config = configSchema.parse(input);
  const sourcePaths = await glob(config.content, {
    posix: true,
    nodir: true,
  });

  const staticMap: StaticMap = {
    private: {},
    // public: {},
    // types: {},
  };

  for (const sourcePath of sourcePaths) {
    const sourceCode = await readFile(sourcePath, "utf8");
    const sourceAst = babelParse(sourceCode);

    const transformables: {
      queryPath: string;
      item: NodePath<Node>;
    }[] = [];
  
    babelTraverse(sourceAst, {
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
            item,
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

      if (item.node.type === "StringLiteral") {
        item.node.value = publicPath;
      }
  
      // const next = `\`${config.assetPrefix ?? ""}${publicPath}\``;
      // const nextAst = babelParse(next);
      // const statement = nextAst.program.body[0];
  
      // if (statement.type === "ExpressionStatement") {
      //   if (item.node.type === "VariableDeclarator") {
      //     item.node.init = statement.expression;
      //   } else if (item.node.type === "JSXAttribute") {
      //     item.node.value = {
      //       type: "JSXExpressionContainer",
      //       expression: statement.expression,
      //     };
      //   } else if (item.node.type === "ObjectProperty") {
      //     item.node.value = statement.expression;
      //   } else if (item.node.type === 'CallExpression') {
      //     item.node.arguments = item.node.arguments.map((arg) => {
      //       if (arg.type !== 'StringLiteral') {
      //         return arg;
      //       }
  
      //       if (arg.value !== queryPath) {
      //         return arg;
      //       }
  
      //       return statement.expression;
      //     });
      //   } else {
      //     console.log(item);
      //   }
      // }
    }

    const out = babelGenerate(sourceAst);
    await writeFile(sourcePath, out.code, 'utf8');
  }
}