"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildServerScripts = void 0;
const esbuild_1 = __importDefault(require("esbuild"));
const promises_1 = require("node:fs/promises");
const node_path_1 = require("node:path");
const constants_1 = require("../constants");
const babel_generate_1 = require("./babel-generate");
const babel_parse_1 = require("./babel-parse");
const build_server_routes_1 = require("./build-server-routes");
const create_route_info_1 = require("./create-route-info");
const resolve_asset_1 = require("./resolve-asset");
const sort_route_infos_1 = require("./sort-route-infos");
async function buildServerScripts(info, config, tsConfig, staticMap, sourcePaths) {
    const { buildDir, routeDir } = config;
    const routePrefix = node_path_1.posix.join(buildDir, constants_1.BUILD_TEMP_DIR, routeDir) + "/";
    const routeInfos = [];
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
        if (!sourcePath.startsWith(routePrefix)) {
            continue;
        }
        // const sourceCode = await readFile(sourcePath, "utf8");
        const routeInfo = (0, create_route_info_1.createRouteInfo)(routePrefix, sourcePath, sourceCode);
        if (!routeInfo) {
            continue;
        }
        routeInfos.push(routeInfo);
        const sourceDir = node_path_1.posix.dirname(sourcePath).slice(routePrefix.length);
        const sourceExt = node_path_1.posix.extname(sourcePath);
        const sourceName = node_path_1.posix.basename(sourcePath, sourceExt);
        const entryPoint = {
            in: sourcePath,
            out: node_path_1.posix.join(constants_1.BUILD_ROUTE_DIR, sourceDir, sourceName),
        };
        entryPoints.push(entryPoint);
    }
    const result = await esbuild_1.default.build({
        entryPoints,
        outdir: buildDir,
        bundle: true,
        format: "esm",
        platform: "node",
        packages: "external",
        treeShaking: true,
        metafile: true,
        jsx: "preserve",
    });
    await (0, build_server_routes_1.buildServerRoutes)(info, config, tsConfig, staticMap, result);
    return (0, sort_route_infos_1.sortRouteInfos)(routeInfos);
}
exports.buildServerScripts = buildServerScripts;
