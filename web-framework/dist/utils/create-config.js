"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createConfig = void 0;
const zod_1 = require("zod");
const tailwindSchema = zod_1.z.object({
    config: zod_1.z.string().nonempty(),
    css: zod_1.z.string().nonempty(),
});
const configSchema = zod_1.z.object({
    assetPrefix: zod_1.z.string().nonempty().optional(),
    externals: zod_1.z.string().nonempty().array().optional().default([]),
    buildDir: zod_1.z.string().optional().default("dist"),
    routeDir: zod_1.z.string().optional().default("src/routes"),
    tailwind: tailwindSchema.array().optional().default([]),
    tsconfig: zod_1.z.string().optional().default("tsconfig.json"),
});
function createConfig(configInput) {
    return configSchema.parse(configInput);
}
exports.createConfig = createConfig;
