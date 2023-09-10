"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveImport = void 0;
const node_path_1 = require("node:path");
const babel_traverse_1 = require("./babel-traverse");
const resolve_alias_1 = require("./resolve-alias");
async function resolveImport(tsConfig, sourcePath, ast) {
    const sourceDir = node_path_1.posix.dirname(sourcePath);
    const aliases = Object.keys(tsConfig.aliases);
    (0, babel_traverse_1.babelTraverse)(ast, {
        enter(item) {
            if (item.node.type !== "StringLiteral") {
                return;
            }
            const parentType = item.parentPath?.node.type;
            if (parentType === "ImportDeclaration") {
                const importPath = item.node.value;
                for (const alias of aliases) {
                    if (importPath.startsWith(alias)) {
                        const absolutePath = (0, resolve_alias_1.resolveAlias)(tsConfig, item.node.value);
                        const relativePath = "./" + node_path_1.posix.relative(sourceDir, absolutePath);
                        item.node.value = relativePath;
                        break;
                    }
                }
            }
        },
    });
}
exports.resolveImport = resolveImport;
