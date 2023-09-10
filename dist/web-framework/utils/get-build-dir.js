"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBuildDir = void 0;
const node_path_1 = require("node:path");
const enums_1 = require("../enums");
function getBuildDir(builder, config, ...paths) {
    if (builder === enums_1.Builder.VERCEL) {
        return node_path_1.posix.join(".vercel/output", ...paths);
    }
    return node_path_1.posix.join(config.buildDir, ...paths);
}
exports.getBuildDir = getBuildDir;
