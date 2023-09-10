"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildVercelDeps = void 0;
const node_child_process_1 = require("node:child_process");
const node_fs_1 = require("node:fs");
const promises_1 = require("node:fs/promises");
const node_path_1 = __importDefault(require("node:path"));
const constants_1 = require("../constants");
function getCommand() {
    if ((0, node_fs_1.existsSync)("pnpm-lock.yaml")) {
        return "pnpm install --prod";
    }
    return "npm install --omit=dev";
}
async function createPackageJson(config) {
    const pkg = await (0, promises_1.readFile)("package.json", "utf8");
    const pkgJson = JSON.parse(pkg);
    const pkgDeps = pkgJson.dependencies ?? {};
    const deps = {};
    for (const external of config.externals) {
        if (pkgDeps[external]) {
            deps[external] = pkgDeps[external];
        }
    }
    return {
        dependencies: deps,
    };
}
async function buildVercelDeps(config) {
    const pkgJson = await createPackageJson(config);
    const funcDir = node_path_1.default.posix.join(constants_1.VERCEL_OUTPUT_DIR, constants_1.VERCEL_SERVERLESS_DIR, constants_1.VERCEL_SERVERLESS_NAME);
    const dstPath = node_path_1.default.posix.join(funcDir, "package.json");
    await (0, promises_1.writeFile)(dstPath, JSON.stringify(pkgJson), "utf8");
    const cmd = `cd ${funcDir} && ${getCommand()}`;
    console.log();
    console.log(">", cmd);
    console.log();
    (0, node_child_process_1.execSync)(cmd, {
        stdio: "inherit",
    });
    console.log();
}
exports.buildVercelDeps = buildVercelDeps;
