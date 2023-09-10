"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildVercelRoutes = void 0;
const glob_1 = require("glob");
const promises_1 = require("node:fs/promises");
const node_path_1 = require("node:path");
const constants_1 = require("../constants");
async function buildVercelRoutes(config) {
    const buildDir = config.buildDir;
    const srcDir = node_path_1.posix.join(buildDir, constants_1.BUILD_ROUTE_DIR);
    const dstDir = node_path_1.posix.join(constants_1.VERCEL_OUTPUT_DIR, constants_1.VERCEL_SERVERLESS_DIR, constants_1.VERCEL_SERVERLESS_NAME, constants_1.BUILD_ROUTE_DIR);
    const srcPaths = await (0, glob_1.glob)(`${srcDir}/**/*`, {
        posix: true,
        nodir: true,
    });
    for (const prev of srcPaths) {
        const next = node_path_1.posix.join(dstDir, prev.slice(srcDir.length + 1));
        const nextDir = node_path_1.posix.dirname(next);
        await (0, promises_1.mkdir)(nextDir, {
            recursive: true,
        });
        const data = await (0, promises_1.readFile)(prev);
        await (0, promises_1.writeFile)(next, data);
        console.log("> copy", next);
    }
}
exports.buildVercelRoutes = buildVercelRoutes;
