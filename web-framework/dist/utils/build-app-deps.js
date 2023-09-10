"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildAppDeps = void 0;
const promises_1 = require("node:fs/promises");
const node_path_1 = require("node:path");
const constants_1 = require("../constants");
async function buildAppDeps(info, publicMap, routeInfos, typeMap, cwd, tempDir) {
    const appInfoName = "app-info.ts";
    const appInfoPath = node_path_1.posix.join(tempDir, appInfoName);
    const appInfoCode = [
        `export const env = ${JSON.stringify({ id: info.id }, null, 2)};`,
        `export const publicMap = ${JSON.stringify(publicMap, null, 2)};`,
        `export const routeInfos = ${JSON.stringify(routeInfos, null, 2)};`,
        `export const typeMap = ${JSON.stringify(typeMap, null, 2)};`,
    ].join("\n");
    await (0, promises_1.writeFile)(appInfoPath, appInfoCode, "utf8");
    const templateDir = node_path_1.posix.join(cwd, constants_1.APP_TEMPLATE_DIR);
    const srcDir = node_path_1.posix.join(templateDir, constants_1.APP_DEPENDENCY_DIR);
    const srcNames = await (0, promises_1.readdir)(srcDir);
    for (const srcName of srcNames) {
        const srcPath = node_path_1.posix.join(srcDir, srcName);
        const dstPath = node_path_1.posix.join(tempDir, constants_1.APP_DEPENDENCY_DIR, srcName);
        const dstDir = node_path_1.posix.dirname(dstPath);
        await (0, promises_1.mkdir)(dstDir, {
            recursive: true,
        });
        const data = await (0, promises_1.readFile)(srcPath);
        await (0, promises_1.writeFile)(dstPath, data);
    }
}
exports.buildAppDeps = buildAppDeps;
