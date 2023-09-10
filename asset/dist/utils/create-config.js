"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createConfig = void 0;
const zod_1 = __importDefault(require("zod"));
const configSchema = zod_1.default.object({
    content: zod_1.default.string().nonempty().array(),
    output: zod_1.default.string().nonempty().default("static"),
});
function createConfig(input) {
    return configSchema.parse(input);
}
exports.createConfig = createConfig;
