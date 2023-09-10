"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildClientScripts = void 0;
const esbuild_1 = __importDefault(require("esbuild"));
const promises_1 = require("node:fs/promises");
const node_path_1 = require("node:path");
const constants_1 = require("../constants");
const enums_1 = require("../enums");
const babel_generate_1 = require("./babel-generate");
const babel_parse_1 = require("./babel-parse");
const collect_content_type_1 = require("./collect-content-type");
const create_hash_1 = require("./create-hash");
const resolve_asset_1 = require("./resolve-asset");
async function buildClientScripts(env, config, tsConfig, staticMap, sourcePaths) {
    const buildDir = config.buildDir;
    const entryPoints = [];
    for (const sourcePath of sourcePaths) {
        const sourceCode = await (0, promises_1.readFile)(sourcePath, "utf8");
        const ast = (0, babel_parse_1.babelParse)(sourceCode, {
            sourceType: "module",
            plugins: ["jsx", "typescript"],
        });
        await (0, resolve_asset_1.resolveAsset)(config, staticMap, ast);
        const out = (0, babel_generate_1.babelGenerate)(ast);
        await (0, promises_1.writeFile)(sourcePath, out.code, 'utf8');
        const sourceDir = node_path_1.posix.dirname(sourcePath);
        const sourceExt = constants_1.CLIENT_EXTENSION;
        const sourceName = node_path_1.posix.basename(sourcePath, sourceExt);
        if (env === enums_1.Environment.PRODUCTION) {
            const outHash = await (0, create_hash_1.createHash)(node_path_1.posix.join(sourceDir, sourceName));
            const outName = `chunk-${outHash.toUpperCase()}`;
            const entryPoint = {
                in: sourcePath,
                out: outName,
            };
            entryPoints.push(entryPoint);
        }
        else {
            const outName = node_path_1.posix.join(sourceDir, sourceName).replaceAll("/", "_");
            const entryPoint = {
                in: sourcePath,
                out: outName,
            };
            entryPoints.push(entryPoint);
        }
    }
    const publicDir = constants_1.BUILD_SCRIPT_DIR;
    const outDir = node_path_1.posix.join(buildDir, publicDir);
    const result = await esbuild_1.default.build({
        entryPoints,
        outdir: outDir,
        bundle: true,
        format: "esm",
        platform: "browser",
        treeShaking: true,
        splitting: true,
        minifyWhitespace: env === enums_1.Environment.PRODUCTION,
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
        const scriptExt = node_path_1.posix.extname(outputPath);
        const scriptPath = outputPath.slice(outDir.length + 1);
        if (scriptMeta.entryPoint) {
            const privateDir = node_path_1.posix.join(buildDir, constants_1.BUILD_TEMP_DIR);
            if (scriptMeta.entryPoint.startsWith(privateDir)) {
                const privateBuildPath = scriptMeta.entryPoint.slice(privateDir.length);
                const privatePath = privateBuildPath.slice(0, -constants_1.CLIENT_EXTENSION.length) + '.ts';
                const scriptData = await (0, promises_1.readFile)(outputPath);
                const scriptHash = await (0, create_hash_1.createHash)(scriptData);
                const scriptDir = node_path_1.posix.dirname(scriptPath);
                const scriptName = node_path_1.posix.basename(scriptPath, scriptExt);
                const publicName = `${scriptName}.${scriptHash}${scriptExt}`;
                const publicPath = "/" + node_path_1.posix.join(publicDir, scriptDir, publicName);
                const resourcePath = outputPath.slice(0, -scriptExt.length) + `.${scriptHash}${scriptExt}`;
                const resourceDir = node_path_1.posix.dirname(resourcePath);
                await (0, promises_1.mkdir)(resourceDir, {
                    recursive: true,
                });
                await (0, promises_1.writeFile)(resourcePath, scriptData);
                await (0, promises_1.rm)(outputPath, {
                    force: true,
                });
                staticMap.private[privatePath] = publicPath;
                staticMap.public[publicPath] = resourcePath;
                (0, collect_content_type_1.collectContentType)(staticMap, resourcePath);
                continue;
            }
        }
        const privatePath = "/" + node_path_1.posix.join(publicDir, scriptPath);
        const publicPath = "/" + node_path_1.posix.join(publicDir, scriptPath);
        staticMap.private[privatePath] = publicPath;
        staticMap.public[publicPath] = outputPath;
        (0, collect_content_type_1.collectContentType)(staticMap, outputPath);
    }
}
exports.buildClientScripts = buildClientScripts;
