"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildAssets = void 0;
const create_hash_1 = require("./utils/create-hash");
const glob_1 = require("glob");
const mime_types_1 = __importDefault(require("mime-types"));
const node_fs_1 = require("node:fs");
const promises_1 = require("node:fs/promises");
const node_path_1 = require("node:path");
const sharp_1 = __importDefault(require("sharp"));
const zod_1 = __importDefault(require("zod"));
const UTIL_FUNCTION_NAME = '$asset';
const IMAGE_TRANSFORMABLE_TYPES = [
    'image/avif',
    'image/jpeg',
    'image/png',
    'image/tiff',
    'image/webp',
];
const configSchema = zod_1.default.object({
    assetDir: zod_1.default.string().nonempty().or(zod_1.default.string().nonempty().array().min(1)),
    assetOutDir: zod_1.default.string().nonempty(),
    assetPublicDir: zod_1.default.string().nonempty(),
    assetUtilPath: zod_1.default.string().nonempty(),
    codeDir: zod_1.default.string().nonempty(),
    codeExts: zod_1.default.string().nonempty().array().min(1),
    indent: zod_1.default.string().nonempty().optional().default('  '),
    semicolons: zod_1.default.boolean().optional().default(true),
    singleQuotes: zod_1.default.boolean().optional().default(true),
});
const querySchema = zod_1.default.object({
    w: zod_1.default.preprocess(Number, zod_1.default.number().min(16).max(4096)).optional(),
    q: zod_1.default.preprocess(Number, zod_1.default.number().min(10).max(100)).optional(),
});
function stringifyObject(config, map) {
    const quote = config.singleQuotes ? "'" : '"';
    return Object.entries(map).map(([key, value]) => {
        return `${config.indent}${quote}${key}${quote}: ${quote}${value}${quote},`;
    }).join('\n');
}
async function createAssetUtil(config, map) {
    const semicolons = config.semicolons ? ';' : '';
    const assetUtilCode = [
        `const map = {`,
        stringifyObject(config, map),
        `}${semicolons}`,
        '',
        `export function ${UTIL_FUNCTION_NAME}(assetPath: keyof typeof map): string {`,
        `${config.indent}return map[assetPath]${semicolons}`,
        `}`,
    ].join('\n');
    const assetUtilDir = node_path_1.posix.dirname(config.assetUtilPath);
    await (0, promises_1.mkdir)(assetUtilDir, {
        recursive: true,
    });
    await (0, promises_1.writeFile)(config.assetUtilPath, assetUtilCode, 'utf8');
}
async function resolveAsset(config, map, assetPath, assetData) {
    const [absolutePath] = assetPath.split('?');
    const assetHash = await (0, create_hash_1.createHash)(assetData);
    const assetExt = node_path_1.posix.extname(absolutePath);
    const assetBaseName = node_path_1.posix.basename(absolutePath, assetExt);
    const assetName = `${assetBaseName}.${assetHash}${assetExt}`;
    const outPath = node_path_1.posix.join(config.assetOutDir, assetName);
    const outDir = node_path_1.posix.dirname(outPath);
    const publicPath = node_path_1.posix.join(config.assetPublicDir, assetName);
    if (!(0, node_fs_1.existsSync)(outPath)) {
        await (0, promises_1.mkdir)(outDir, {
            recursive: true,
        });
        await (0, promises_1.writeFile)(outPath, assetData);
    }
    map[assetPath] = publicPath;
    return outPath;
}
async function collectAssets(config) {
    const map = {};
    const outPaths = [];
    const filePaths = await (0, glob_1.glob)(config.codeExts.map((ext) => {
        return node_path_1.posix.join(config.codeDir, `**/*${ext}`);
    }), {
        posix: true,
        nodir: true,
    });
    const regex1 = `\\${UTIL_FUNCTION_NAME}\\(\\'\\/[^'\\n\\t]+\\'\\)`;
    const regex2 = `\\${UTIL_FUNCTION_NAME}\\(\\"\\/[^"\\n\\t]+\\"\\)`;
    const regex = new RegExp(`(${regex1})|(${regex2})`, 'g');
    const assetPaths = [];
    for (const filePath of filePaths) {
        const fileText = await (0, promises_1.readFile)(filePath, 'utf8');
        fileText.replace(regex, (text) => {
            assetPaths.push(text.slice(UTIL_FUNCTION_NAME.length + 2, -2));
            return text;
        });
    }
    for (const assetPath of assetPaths) {
        if (map[assetPath]) {
            continue;
        }
        const [absolutePath, query] = assetPath.split('?');
        const sourcePath = absolutePath.slice(1);
        if (!(0, node_fs_1.existsSync)(sourcePath)) {
            continue;
        }
        const contentType = mime_types_1.default.lookup(sourcePath);
        if (query && contentType && IMAGE_TRANSFORMABLE_TYPES.includes(contentType)) {
            const params = querySchema.safeParse(Object.fromEntries(new URLSearchParams(query).entries()));
            if (params.success && (params.data.w || params.data.q)) {
                const key = `> transform: ${assetPath}`;
                console.time(key);
                const formatter = contentType === 'image/jpeg' ? 'jpeg' : 'png';
                let data = await (0, promises_1.readFile)(sourcePath);
                let transform = (0, sharp_1.default)(data);
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
                const outPath = await resolveAsset(config, map, assetPath, data);
                outPaths.push(outPath);
                console.timeEnd(key);
                continue;
            }
        }
        const key = `> copy: ${assetPath}`;
        console.time(key);
        const data = await (0, promises_1.readFile)(sourcePath);
        const outPath = await resolveAsset(config, map, assetPath, data);
        outPaths.push(outPath);
        console.timeEnd(key);
    }
    return {
        map,
        outPaths,
    };
}
async function buildAssets(configInput) {
    const config = configSchema.parse(configInput);
    const { map, outPaths } = await collectAssets(config);
    await createAssetUtil(config, map);
    const previous = await (0, glob_1.glob)(node_path_1.posix.join(config.assetOutDir, '**/*'), {
        posix: true,
        nodir: true,
    });
    for (const previousPath of previous) {
        if (outPaths.includes(previousPath)) {
            continue;
        }
        await (0, promises_1.rm)(previousPath);
        // console.log('> delete', previousPath);
    }
}
exports.buildAssets = buildAssets;
