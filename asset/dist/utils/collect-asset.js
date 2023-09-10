"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.collectAsset = void 0;
const mime_types_1 = __importDefault(require("mime-types"));
const node_fs_1 = require("node:fs");
const promises_1 = require("node:fs/promises");
const node_path_1 = require("node:path");
const node_url_1 = require("node:url");
const sharp_1 = __importDefault(require("sharp"));
const zod_1 = __importDefault(require("zod"));
const create_hash_1 = require("./create-hash");
const IMAGE_TRANSFORMABLE_TYPES = [
    "image/avif",
    "image/jpeg",
    "image/png",
    "image/tiff",
    "image/webp",
];
const querySchema = zod_1.default.object({
    w: zod_1.default.preprocess(Number, zod_1.default.number().min(16).max(4096)).optional(),
    q: zod_1.default.preprocess(Number, zod_1.default.number().min(10).max(100)).optional(),
});
async function collectAsset(config, staticMap, queryPath) {
    if (staticMap.private[queryPath]) {
        return;
    }
    const [privatePath, query] = queryPath.split("?");
    const assetPath = privatePath.slice(1);
    if (!(0, node_fs_1.existsSync)(assetPath)) {
        return;
    }
    const contentType = mime_types_1.default.lookup(assetPath);
    if (query && contentType && IMAGE_TRANSFORMABLE_TYPES.includes(contentType)) {
        const key = `> transform: ${queryPath.slice(1)}`;
        console.time(key);
        const params = querySchema.safeParse(Object.fromEntries(new node_url_1.URLSearchParams(query).entries()));
        let data = await (0, promises_1.readFile)(assetPath);
        let transform = (0, sharp_1.default)(assetPath);
        if (params.success && (params.data.w || params.data.q)) {
            const formatter = contentType === "image/jpeg" ? "jpeg" : "png";
            if (params.data.w) {
                transform = transform.resize({
                    width: params.data.w,
                    withoutEnlargement: true,
                });
            }
            transform = transform[formatter]({
                quality: params.data.q ?? 100,
            });
            data = await transform.toBuffer();
            const assetHash = await (0, create_hash_1.createHash)(data);
            const assetExt = node_path_1.posix.extname(assetPath);
            const assetName = node_path_1.posix.basename(assetPath, assetExt);
            const resourcePath = `${config.output}/${assetName}.${assetHash}${assetExt}`;
            const resourceDir = node_path_1.posix.dirname(resourcePath);
            const publicPath = `/${resourcePath}`;
            await (0, promises_1.mkdir)(resourceDir, {
                recursive: true,
            });
            await (0, promises_1.writeFile)(resourcePath, data);
            staticMap.private[queryPath] = publicPath;
            // staticMap.public[publicPath] = resourcePath;
            console.timeEnd(key);
            return;
        }
    }
    const key = `> collect: ${queryPath.slice(1)}`;
    console.time(key);
    const assetData = await (0, promises_1.readFile)(assetPath);
    const assetHash = await (0, create_hash_1.createHash)(assetData);
    const assetExt = node_path_1.posix.extname(assetPath);
    const assetName = node_path_1.posix.basename(assetPath, assetExt);
    const resourcePath = `${config.output}/${assetName}.${assetHash}${assetExt}`;
    const resourceDir = node_path_1.posix.dirname(resourcePath);
    const publicPath = `/${resourcePath}`;
    await (0, promises_1.mkdir)(resourceDir, {
        recursive: true,
    });
    await (0, promises_1.writeFile)(resourcePath, assetData);
    staticMap.private[privatePath] = publicPath;
    // staticMap.public[publicPath] = resourcePath;
    console.timeEnd(key);
}
exports.collectAsset = collectAsset;
