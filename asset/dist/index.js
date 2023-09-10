"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildAssets = void 0;
const promises_1 = require("fs/promises");
const glob_1 = require("glob");
const zod_1 = __importDefault(require("zod"));
const babel_parse_1 = require("./utils/babel-parse");
const babel_traverse_1 = require("./utils/babel-traverse");
const collect_asset_1 = require("./utils/collect-asset");
const babel_generate_1 = require("./utils/babel-generate");
const configSchema = zod_1.default.object({
    content: zod_1.default.string().nonempty().array(),
    output: zod_1.default.string().nonempty().default("static"),
});
async function buildAssets(input) {
    const config = configSchema.parse(input);
    const sourcePaths = await (0, glob_1.glob)(config.content, {
        posix: true,
        nodir: true,
    });
    const staticMap = {
        private: {},
        // public: {},
        // types: {},
    };
    for (const sourcePath of sourcePaths) {
        const sourceCode = await (0, promises_1.readFile)(sourcePath, "utf8");
        const sourceAst = (0, babel_parse_1.babelParse)(sourceCode);
        const transformables = [];
        (0, babel_traverse_1.babelTraverse)(sourceAst, {
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
            await (0, collect_asset_1.collectAsset)(config, staticMap, queryPath);
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
        const out = (0, babel_generate_1.babelGenerate)(sourceAst);
        await (0, promises_1.writeFile)(sourcePath, out.code, 'utf8');
    }
}
exports.buildAssets = buildAssets;
