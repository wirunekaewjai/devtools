"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildServerRoutes = void 0;
const esbuild_1 = __importDefault(require("esbuild"));
const node_fs_1 = require("node:fs");
const promises_1 = require("node:fs/promises");
const node_path_1 = require("node:path");
const constants_1 = require("../constants");
const enums_1 = require("../enums");
const babel_generate_1 = require("./babel-generate");
const babel_parse_1 = require("./babel-parse");
const babel_traverse_1 = require("./babel-traverse");
async function buildServerRoutes(info, config, tsConfig, staticMap, result) {
    const buildDir = config.buildDir;
    const entryPoints = [];
    for (const outputPath in result.metafile.outputs) {
        const meta = result.metafile.outputs[outputPath];
        const inputPaths = Object.keys(meta.inputs);
        const scriptElements = [];
        for (const inputPath of inputPaths) {
            const inputExt = node_path_1.posix.extname(inputPath);
            const inputScript = inputPath.slice(0, -inputExt.length) + '.ts';
            if ((0, node_fs_1.existsSync)(inputScript)) {
                const privatePathPrefix = node_path_1.posix.join(buildDir, constants_1.BUILD_TEMP_DIR);
                const privatePath = inputScript.slice(privatePathPrefix.length);
                const publicPath = staticMap.private[privatePath];
                if (!publicPath) {
                    continue;
                }
                const scriptTag = `<script type="module" src="${publicPath}"></script>`;
                const scriptAst = (0, babel_parse_1.babelParse)(scriptTag, {
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
        const sourceCode = await (0, promises_1.readFile)(outputPath, "utf8");
        const ast = (0, babel_parse_1.babelParse)(sourceCode, {
            sourceType: "module",
            plugins: ["jsx", "typescript"],
        });
        (0, babel_traverse_1.babelTraverse)(ast, {
            enter(item) {
                if (item.node.type !== "JSXElement") {
                    return;
                }
                const identifier = item.node.openingElement.name;
                if (identifier.type === "JSXIdentifier" &&
                    identifier.name === constants_1.CLIENT_SCRIPT_INJECTION_TARGET) {
                    item.node.children.push(...scriptElements);
                }
            },
        });
        const out = (0, babel_generate_1.babelGenerate)(ast);
        await (0, promises_1.writeFile)(outputPath, out.code, "utf8");
        const outputExt = node_path_1.posix.extname(outputPath);
        entryPoints.push({
            in: outputPath,
            out: outputPath.slice(0, -outputExt.length),
        });
    }
    await esbuild_1.default.build({
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
        minifyWhitespace: info.env === enums_1.Environment.PRODUCTION,
    });
}
exports.buildServerRoutes = buildServerRoutes;
