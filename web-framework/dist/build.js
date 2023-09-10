"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.build = void 0;
const promises_1 = require("node:fs/promises");
const node_path_1 = require("node:path");
const constants_1 = require("./constants");
const enums_1 = require("./enums");
const build_app_node_1 = require("./utils/build-app-node");
const build_app_vercel_1 = require("./utils/build-app-vercel");
const build_client_scripts_1 = require("./utils/build-client-scripts");
const build_server_scripts_1 = require("./utils/build-server-scripts");
const build_tailwind_1 = require("./utils/build-tailwind");
const build_vercel_deps_1 = require("./utils/build-vercel-deps");
const build_vercel_routes_1 = require("./utils/build-vercel-routes");
const build_vercel_static_1 = require("./utils/build-vercel-static");
const get_source_paths_1 = require("./utils/get-source-paths");
const get_ts_config_1 = require("./utils/get-ts-config");
const prepare_scripts_1 = require("./utils/prepare-scripts");
async function build(env, builder, config) {
    const info = {
        builder,
        env,
        id: Date.now().toString(10),
    };
    const buildDir = config.buildDir;
    const tsConfig = await (0, get_ts_config_1.getTsConfig)(config.tsconfig);
    const sourcePaths = await (0, get_source_paths_1.getSourcePaths)(tsConfig);
    const staticMap = {
        private: {},
        public: {},
        types: {},
    };
    if (config.tailwind.length > 0) {
        await (0, build_tailwind_1.buildTailwind)(env, config, staticMap);
    }
    const clientPaths = [];
    const serverPaths = [];
    for (const sourcePath of sourcePaths) {
        const key = `> prepare: ${sourcePath}`;
        console.time(key);
        const prepareResult = await (0, prepare_scripts_1.prepareScripts)(config, tsConfig, staticMap, sourcePath);
        if (prepareResult.clientPath) {
            clientPaths.push(prepareResult.clientPath);
        }
        if (prepareResult.serverPath) {
            serverPaths.push(prepareResult.serverPath);
        }
        console.timeEnd(key);
    }
    console.time("> build: client scripts");
    await (0, build_client_scripts_1.buildClientScripts)(env, config, tsConfig, staticMap, clientPaths);
    console.timeEnd("> build: client scripts");
    console.time("> build: server scripts");
    const routeInfos = await (0, build_server_scripts_1.buildServerScripts)(info, config, tsConfig, staticMap, serverPaths);
    console.timeEnd("> build: server scripts");
    console.time("> build: app");
    if (builder === enums_1.Builder.NODE) {
        await (0, build_app_node_1.buildAppNode)(info, config, staticMap.public, routeInfos, staticMap.types);
    }
    else {
        await (0, build_vercel_static_1.buildVercelStatic)(config, staticMap.public);
        await (0, build_vercel_routes_1.buildVercelRoutes)(config);
        await (0, build_vercel_deps_1.buildVercelDeps)(config);
        await (0, build_app_vercel_1.buildAppVercel)(info, routeInfos);
        // cleanup build dir
        await (0, promises_1.rm)(buildDir, {
            force: true,
            recursive: true,
        });
    }
    console.timeEnd("> build: app");
    await (0, promises_1.rm)(node_path_1.posix.join(buildDir, constants_1.BUILD_TEMP_DIR), {
        force: true,
        recursive: true,
    });
    if (env === enums_1.Environment.PRODUCTION) {
        console.log();
        console.log(staticMap);
        console.log();
    }
}
exports.build = build;
