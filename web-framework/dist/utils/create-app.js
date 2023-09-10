"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = void 0;
const promises_1 = require("node:fs/promises");
const build_1 = require("../build");
const constants_1 = require("../constants");
const dev_1 = require("../dev");
const enums_1 = require("../enums");
const create_config_1 = require("./create-config");
const get_builder_1 = require("./get-builder");
const get_command_1 = require("./get-command");
async function createApp(configInput, targetBuilder) {
    const config = (0, create_config_1.createConfig)(configInput);
    const builder = targetBuilder ?? (0, get_builder_1.getBuilder)();
    const command = (0, get_command_1.getCommand)();
    console.log("> command:", command);
    console.log("> builder:", builder);
    if (!command) {
        console.log("> command is not provided.");
        return;
    }
    await (0, promises_1.rm)(config.buildDir, {
        force: true,
        recursive: true,
    });
    await (0, promises_1.rm)(constants_1.VERCEL_OUTPUT_DIR, {
        force: true,
        recursive: true,
    });
    if (command === enums_1.Command.BUILD) {
        console.time("> build time");
        await (0, build_1.build)(enums_1.Environment.PRODUCTION, builder, config);
        console.timeEnd("> build time");
        return;
    }
    if (command === enums_1.Command.DEV) {
        await (0, dev_1.dev)(builder, config);
        return;
    }
}
exports.createApp = createApp;
