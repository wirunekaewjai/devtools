"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWatcher = void 0;
const create_hash_1 = require("../utils/create-hash");
const glob_1 = require("glob");
const nodemon_1 = __importDefault(require("nodemon"));
const zod_1 = __importDefault(require("zod"));
const configSchema = zod_1.default.object({
    interval: zod_1.default.number().positive().optional().default(1000),
    ignore: zod_1.default.string().nonempty().array().optional().default([]),
    pattern: zod_1.default.string().nonempty().or(zod_1.default.string().nonempty().array().min(1)),
    script: zod_1.default.string().nonempty().or(zod_1.default.function()),
});
async function createWatcher(configInput) {
    const config = configSchema.parse(configInput);
    const hashmap = {};
    let server = null;
    function start(script) {
        if (server) {
            return server.restart();
        }
        server = (0, nodemon_1.default)({
            script,
            stdout: true,
        });
        server.once('crash', () => {
            process.exit();
        });
    }
    let isInitialized = false;
    let previousFilePaths = [];
    async function compare() {
        const filePaths = await (0, glob_1.glob)(config.pattern, {
            ignore: config.ignore,
            posix: true,
            nodir: true,
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
                    hashmap[filePath] = await (0, create_hash_1.createHashFromFile)(filePath).catch(() => '');
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
                const current = await (0, create_hash_1.createHashFromFile)(filePath).catch(() => '');
                if (previous !== current) {
                    hashmap[filePath] = current;
                    updates.push(filePath);
                }
            }
            isChanged = updates.length > 0;
        }
        previousFilePaths = filePaths;
        if (isChanged) {
            if (typeof config.script === 'string') {
                if (isInitialized) {
                    console.log();
                    console.log('> restarting...');
                    console.log();
                }
                else {
                    isInitialized = true;
                }
                start(config.script);
            }
            else {
                await config.script();
            }
        }
        await new Promise((resolve) => setTimeout(resolve, config.interval));
        await compare();
    }
    await compare();
}
exports.createWatcher = createWatcher;
