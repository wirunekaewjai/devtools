"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createConfig = void 0;
const zod_1 = __importDefault(require("zod"));
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
function createConfig(configInput) {
    return configSchema.parse(configInput);
}
exports.createConfig = createConfig;
