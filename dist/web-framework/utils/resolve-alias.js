"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveAlias = void 0;
function resolveAlias(tsConfig, targetPath) {
    const aliasEntries = Object.entries(tsConfig.aliases);
    for (const [alias, absolutePath] of aliasEntries) {
        if (targetPath.startsWith(alias)) {
            return `${absolutePath}${targetPath.slice(alias.length)}`;
        }
    }
    return targetPath;
}
exports.resolveAlias = resolveAlias;
