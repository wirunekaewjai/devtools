"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildVercelStatic = void 0;
const promises_1 = require("node:fs/promises");
const node_path_1 = require("node:path");
const constants_1 = require("../constants");
async function buildVercelStatic(config, publicMap) {
    const buildDir = config.buildDir;
    for (const key in publicMap) {
        const prev = publicMap[key];
        const next = node_path_1.posix.join(constants_1.VERCEL_OUTPUT_DIR, constants_1.VERCEL_STATIC_DIR, prev.slice(buildDir.length + 1));
        const nextDir = node_path_1.posix.dirname(next);
        await (0, promises_1.mkdir)(nextDir, {
            recursive: true,
        });
        const data = await (0, promises_1.readFile)(prev);
        await (0, promises_1.writeFile)(next, data);
        publicMap[key] = next;
        console.log("> copy", next);
    }
}
exports.buildVercelStatic = buildVercelStatic;
