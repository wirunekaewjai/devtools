"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBuilder = void 0;
const enums_1 = require("../enums");
function getBuilder() {
    const v = process.env.VERCEL_DEPLOYMENT_ID;
    if (typeof v === "string" && v.length > 3) {
        return enums_1.Builder.VERCEL;
    }
    return enums_1.Builder.NODE;
}
exports.getBuilder = getBuilder;
