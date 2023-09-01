"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildAndWatchAssets = void 0;
const build_assets_1 = require("./utils/build-assets");
const create_config_1 = require("./utils/create-config");
const create_watcher_1 = require("./utils/create-watcher");
const node_path_1 = require("node:path");
function buildAndWatchAssets(configInput) {
    const config = (0, create_config_1.createConfig)(configInput);
    return (0, create_watcher_1.createWatcher)({
        ignore: [
            node_path_1.posix.join(config.assetOutDir, '**/*'),
            config.assetUtilPath,
        ],
        pattern: node_path_1.posix.join(config.codeDir, '**/*'),
        action: async () => await (0, build_assets_1.buildAssets)(config),
    });
}
exports.buildAndWatchAssets = buildAndWatchAssets;
