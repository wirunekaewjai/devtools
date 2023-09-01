"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWatcher = void 0;
const create_hash_1 = require("../utils/create-hash");
const glob_1 = require("glob");
const zod_1 = __importDefault(require("zod"));
const configSchema = zod_1.default.object({
    action: zod_1.default.function(),
    interval: zod_1.default.number().positive().optional().default(1000),
    ignore: zod_1.default.string().nonempty().array().optional().default([]),
    pattern: zod_1.default.string().nonempty().or(zod_1.default.string().nonempty().array().min(1)),
});
function createWatcher(configInput) {
    const config = configSchema.parse(configInput);
    const hashmap = {};
    let isRunning = true;
    let previousFilePaths = [];
    async function compare() {
        if (!isRunning) {
            return;
        }
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
        if (!isRunning) {
            return;
        }
        if (isChanged) {
            await config.action();
        }
        if (!isRunning) {
            return;
        }
        await new Promise((resolve) => setTimeout(resolve, config.interval));
        await compare();
    }
    compare();
    return () => {
        isRunning = false;
    };
}
exports.createWatcher = createWatcher;
