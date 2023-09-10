"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCommand = void 0;
const enums_1 = require("../enums");
function getCommand() {
    const command = process.argv[2];
    if (command === enums_1.Command.BUILD) {
        return enums_1.Command.BUILD;
    }
    if (command === enums_1.Command.DEV) {
        return enums_1.Command.DEV;
    }
    return null;
}
exports.getCommand = getCommand;
