"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildAssets = void 0;
const build_assets_1 = require("./utils/build-assets");
const create_config_1 = require("./utils/create-config");
async function buildAssets(configInput) {
    const config = (0, create_config_1.createConfig)(configInput);
    await (0, build_assets_1.buildAssets)(config);
}
exports.buildAssets = buildAssets;
