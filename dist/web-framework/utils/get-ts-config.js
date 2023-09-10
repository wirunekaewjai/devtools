"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTsConfig = void 0;
const node_fs_1 = require("node:fs");
const promises_1 = require("node:fs/promises");
const node_path_1 = require("node:path");
function adjustRelativePath(value) {
    if (value.startsWith("/")) {
        return value.slice(1);
    }
    return value;
}
async function getTsConfig(configPath) {
    const config = {
        aliases: {},
        excludes: ["node_modules"],
        includes: [],
        root: ".",
    };
    if (!(0, node_fs_1.existsSync)(configPath)) {
        return config;
    }
    const raw = await (0, promises_1.readFile)(configPath, "utf8");
    const src = JSON.parse(raw);
    if (src.compilerOptions?.baseUrl) {
        config.root = src.compilerOptions.baseUrl;
    }
    if (src.compilerOptions?.jsxImportSource) {
        config.jsxImportSource = src.compilerOptions.jsxImportSource;
    }
    const configDir = node_path_1.posix.dirname(configPath);
    config.root = node_path_1.posix.join(configDir, config.root);
    if (src.compilerOptions?.paths) {
        const paths = {};
        Object.entries(src.compilerOptions.paths).forEach(([key, values]) => {
            if (values.length > 0) {
                const parsedKey = key.endsWith("*") ? key.slice(0, -1) : key;
                paths[parsedKey] = node_path_1.posix.join(config.root, values[0].endsWith("*") ? values[0].slice(0, -1) : values[0]);
            }
        });
        config.aliases = paths;
    }
    if (src.exclude) {
        config.excludes.push(...src.exclude);
        config.excludes = Array.from(new Set(config.excludes));
    }
    if (src.include) {
        config.includes.push(...src.include);
        config.includes = Array.from(new Set(config.includes));
    }
    config.excludes = config.excludes.map((exludePath) => {
        return adjustRelativePath(node_path_1.posix.join(config.root, exludePath));
    });
    config.includes = config.includes.map((includePath) => {
        return adjustRelativePath(node_path_1.posix.join(config.root, includePath));
    });
    return config;
}
exports.getTsConfig = getTsConfig;
