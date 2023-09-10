"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildAppNode = void 0;
const esbuild_1 = __importDefault(require("esbuild"));
const promises_1 = require("node:fs/promises");
const node_path_1 = __importStar(require("node:path"));
const constants_1 = require("../constants");
const enums_1 = require("../enums");
const build_app_deps_1 = require("./build-app-deps");
async function buildAppNode(info, config, publicMap, routeInfos, typeMap) {
    const isProd = info.env === enums_1.Environment.PRODUCTION;
    const cwd = node_path_1.default.join(node_path_1.default.resolve(__dirname), "../../..");
    const buildDir = config.buildDir;
    const tempDir = node_path_1.posix.join(cwd, `.tmp_${Date.now()}`);
    try {
        await (0, promises_1.mkdir)(tempDir, {
            recursive: true,
        });
        await (0, build_app_deps_1.buildAppDeps)(info, publicMap, routeInfos, typeMap, cwd, tempDir);
        //// APP TEMPLATE
        const templateName = isProd ? "app-node.ts" : "app-node-dev.ts";
        const templateDir = node_path_1.posix.join(cwd, constants_1.APP_TEMPLATE_DIR);
        const templatePath = node_path_1.posix.join(templateDir, templateName);
        const template = await (0, promises_1.readFile)(templatePath, "utf8");
        const appName = constants_1.APP_FILE_NAME;
        const appPathTmp = node_path_1.posix.join(tempDir, templateName);
        const appPath = node_path_1.posix.join(buildDir, appName);
        await (0, promises_1.writeFile)(appPathTmp, template, "utf8");
        await esbuild_1.default.build({
            entryPoints: [appPathTmp],
            outfile: appPath,
            format: "cjs",
            loader: {
                ".js": "ts",
                ".ts": "ts",
            },
            bundle: true,
            platform: "node",
            minifyWhitespace: isProd,
        });
    }
    finally {
        await (0, promises_1.rm)(tempDir, {
            force: true,
            recursive: true,
        });
    }
}
exports.buildAppNode = buildAppNode;
