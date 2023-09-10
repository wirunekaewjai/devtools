"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRouteInfo = void 0;
const node_path_1 = __importDefault(require("node:path"));
const constants_1 = require("../constants");
function createRouteInfo(routePrefix, sourcePath, sourceCode) {
    const sourceExt = node_path_1.default.extname(sourcePath);
    const routePattern = "/" +
        sourcePath
            .slice(routePrefix.length, -sourceExt.length)
            .replace(/\[[^\]]+\]/g, (text) => `:${text.slice(1, -1)}`)
            .replace("/index", "")
            .replace("index", "");
    const methods = [];
    for (const SERVER_RESERVED_NAME of constants_1.SERVER_RESERVED_NAMES) {
        if (sourceCode.includes(`export const ${SERVER_RESERVED_NAME}`)) {
            methods.push(SERVER_RESERVED_NAME);
        }
    }
    if (methods.length === 0) {
        return null;
    }
    const moduleName = sourcePath.slice(routePrefix.length, -sourceExt.length);
    return {
        path: routePattern,
        methods,
        modulePath: `./${constants_1.BUILD_ROUTE_DIR}/` + moduleName,
    };
}
exports.createRouteInfo = createRouteInfo;
