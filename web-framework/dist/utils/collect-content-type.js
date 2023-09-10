"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.collectContentType = void 0;
const mime_types_1 = __importDefault(require("mime-types"));
const node_path_1 = __importDefault(require("node:path"));
function collectContentType(staticMap, filePath) {
    const type = mime_types_1.default.lookup(filePath);
    if (type) {
        const key = node_path_1.default.extname(filePath);
        staticMap.types[key] = type;
    }
}
exports.collectContentType = collectContentType;
