"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAssetUtil = void 0;
const constants_1 = require("../utils/constants");
const stringify_object_1 = require("../utils/stringify-object");
const promises_1 = require("node:fs/promises");
const node_path_1 = require("node:path");
async function generateAssetUtil(config, map) {
    const semicolons = config.semicolons ? ';' : '';
    const assetUtilCode = [
        `const map = {`,
        (0, stringify_object_1.stringifyObject)(config, map),
        `}${semicolons}`,
        '',
        `export function ${constants_1.UTIL_FUNCTION_NAME}(assetPath: keyof typeof map): string {`,
        `${config.indent}return map[assetPath]${semicolons}`,
        `}`,
    ].join('\n');
    const assetUtilDir = node_path_1.posix.dirname(config.assetUtilPath);
    await (0, promises_1.mkdir)(assetUtilDir, {
        recursive: true,
    });
    await (0, promises_1.writeFile)(config.assetUtilPath, assetUtilCode, 'utf8');
}
exports.generateAssetUtil = generateAssetUtil;
