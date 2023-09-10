"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createHashFromFile = exports.createHash = void 0;
const hash_1 = __importDefault(require("@emotion/hash"));
const promises_1 = require("node:fs/promises");
async function createHash(fileData) {
    if (typeof fileData === "string") {
        return (0, hash_1.default)(fileData);
    }
    return (0, hash_1.default)(fileData.toString("utf8"));
}
exports.createHash = createHash;
async function createHashFromFile(filePath) {
    const fileData = await (0, promises_1.readFile)(filePath);
    return createHash(fileData);
}
exports.createHashFromFile = createHashFromFile;
