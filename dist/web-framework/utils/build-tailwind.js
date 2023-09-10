"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildTailwind = void 0;
const autoprefixer_1 = __importDefault(require("autoprefixer"));
const cssnano_1 = __importDefault(require("cssnano"));
const promises_1 = require("node:fs/promises");
const node_path_1 = __importDefault(require("node:path"));
const postcss_1 = __importDefault(require("postcss"));
const tailwindcss_1 = __importDefault(require("tailwindcss"));
const constants_1 = require("../constants");
const enums_1 = require("../enums");
const collect_content_type_1 = require("./collect-content-type");
const create_hash_1 = require("./create-hash");
const posix = node_path_1.default.posix;
async function buildTailwind(env, config, staticMap) {
    if (!config.tailwind || config.tailwind.length === 0) {
        return;
    }
    const buildDir = config.buildDir;
    for (const item of config.tailwind) {
        const config = require(node_path_1.default.resolve(item.config));
        const postcssPlugins = [
            (0, tailwindcss_1.default)(config),
            (0, autoprefixer_1.default)(),
        ];
        if (env === enums_1.Environment.PRODUCTION) {
            postcssPlugins.push((0, cssnano_1.default)());
        }
        let sourcePath = item.css;
        if (sourcePath.startsWith("./")) {
            sourcePath.slice(2);
        }
        if (sourcePath.startsWith("../")) {
            sourcePath.slice(3);
        }
        const key = `> build: ${sourcePath} (${item.config})`;
        console.time(key);
        const cssData = await (0, promises_1.readFile)(item.css, "utf8");
        const cssResult = await (0, postcss_1.default)(postcssPlugins).process(cssData, {
            from: item.css,
        });
        const sourceExt = node_path_1.default.extname(sourcePath);
        const sourceName = node_path_1.default.basename(sourcePath, sourceExt);
        const outData = cssResult.css;
        const outDir = posix.join(buildDir, constants_1.BUILD_STATIC_DIR);
        const outHash = await (0, create_hash_1.createHash)(outData);
        const outName = `${sourceName}.${outHash}${sourceExt}`;
        const outPath = posix.join(outDir, outName);
        await (0, promises_1.mkdir)(outDir, {
            recursive: true,
        });
        await (0, promises_1.writeFile)(outPath, outData, "utf8");
        const publicPath = `/${constants_1.BUILD_STATIC_DIR}/${outName}`;
        const privatePath = `/${sourcePath}`;
        staticMap.private[privatePath] = publicPath;
        staticMap.public[publicPath] = outPath;
        (0, collect_content_type_1.collectContentType)(staticMap, outPath);
        console.timeEnd(key);
    }
}
exports.buildTailwind = buildTailwind;
