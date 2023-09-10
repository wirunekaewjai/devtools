"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dev = void 0;
const glob_1 = require("glob");
const node_path_1 = require("node:path");
const nodemon_1 = __importDefault(require("nodemon"));
const build_1 = require("./build");
const constants_1 = require("./constants");
const enums_1 = require("./enums");
const create_hash_1 = require("./utils/create-hash");
const POLLING_INTERVAL = 1_000;
let server = null;
function start(script) {
    if (server) {
        return server.restart();
    }
    server = (0, nodemon_1.default)({
        script,
        stdout: true,
    });
    server.once("crash", () => {
        process.exit();
    });
}
async function dev(builder, config) {
    const env = enums_1.Environment.DEVELOPMENT;
    const buildDir = config.buildDir;
    const script = node_path_1.posix.join(buildDir, constants_1.APP_FILE_NAME);
    const hashmap = {};
    let isInitialized = false;
    let previousFilePaths = [];
    async function compare() {
        const filePaths = await (0, glob_1.glob)("**/*", {
            posix: true,
            nodir: true,
            ignore: [
                ".vscode/**/*",
                "node_modules/**/*",
                node_path_1.posix.join(buildDir, "**/*"),
            ],
        });
        let isChanged = false;
        const pendings = [];
        // check adds
        if (!isChanged) {
            const adds = [];
            for (const filePath of filePaths) {
                if (previousFilePaths.includes(filePath)) {
                    pendings.push(filePath);
                }
                else {
                    hashmap[filePath] = await (0, create_hash_1.createHashFromFile)(filePath).catch(() => "");
                    adds.push(filePath);
                }
            }
            isChanged = adds.length > 0;
        }
        // check removes
        if (!isChanged) {
            const removes = [];
            for (const previousFilePath of previousFilePaths) {
                if (!filePaths.includes(previousFilePath)) {
                    delete hashmap[previousFilePath];
                    removes.push(previousFilePath);
                }
            }
            isChanged = removes.length > 0;
        }
        // check updates
        if (!isChanged) {
            const updates = [];
            for (const filePath of pendings) {
                const previous = hashmap[filePath];
                const current = await (0, create_hash_1.createHashFromFile)(filePath).catch(() => "");
                if (previous !== current) {
                    hashmap[filePath] = current;
                    updates.push(filePath);
                }
            }
            isChanged = updates.length > 0;
        }
        previousFilePaths = filePaths;
        if (isChanged) {
            if (isInitialized) {
                console.log();
                console.log("> restarting...");
                console.log();
            }
            else {
                isInitialized = true;
            }
            console.time("> build time");
            await (0, build_1.build)(env, builder, config);
            console.timeEnd("> build time");
            console.log();
            start(script);
        }
        await new Promise((resolve) => setTimeout(resolve, POLLING_INTERVAL));
        await compare();
    }
    await compare();
}
exports.dev = dev;
