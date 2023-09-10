"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveAsset = void 0;
const babel_parse_1 = require("./babel-parse");
const babel_traverse_1 = require("./babel-traverse");
const collect_asset_1 = require("./collect-asset");
async function resolveAsset(config, staticMap, ast) {
    const transformables = [];
    (0, babel_traverse_1.babelTraverse)(ast, {
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
                    item: item.parentPath,
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
        const next = `\`${config.assetPrefix ?? ""}${publicPath}\``;
        const nextAst = (0, babel_parse_1.babelParse)(next);
        const statement = nextAst.program.body[0];
        if (statement.type === "ExpressionStatement") {
            if (item.node.type === "VariableDeclarator") {
                item.node.init = statement.expression;
            }
            else if (item.node.type === "JSXAttribute") {
                item.node.value = {
                    type: "JSXExpressionContainer",
                    expression: statement.expression,
                };
            }
            else if (item.node.type === "ObjectProperty") {
                item.node.value = statement.expression;
            }
            else if (item.node.type === 'CallExpression') {
                item.node.arguments = item.node.arguments.map((arg) => {
                    if (arg.type !== 'StringLiteral') {
                        return arg;
                    }
                    if (arg.value !== queryPath) {
                        return arg;
                    }
                    return statement.expression;
                });
            }
            else {
                console.log(item);
            }
        }
    }
}
exports.resolveAsset = resolveAsset;
