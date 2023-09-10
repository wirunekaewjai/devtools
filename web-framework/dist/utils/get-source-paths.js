"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSourcePaths = void 0;
const glob_1 = require("glob");
async function getSourcePaths(tsConfig) {
    const filePaths = await (0, glob_1.glob)(tsConfig.includes, {
        posix: true,
        nodir: true,
    });
    return filePaths
        .map((filePath) => filePath.startsWith("/") ? filePath.slice(1) : filePath)
        .filter((filePath) => !tsConfig.excludes.some((exclude) => filePath.startsWith(exclude)));
}
exports.getSourcePaths = getSourcePaths;
