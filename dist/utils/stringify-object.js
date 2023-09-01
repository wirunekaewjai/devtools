"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stringifyObject = void 0;
function stringifyObject(config, map) {
    const quote = config.singleQuotes ? "'" : '"';
    return Object.entries(map).map(([key, value]) => {
        return `${config.indent}${quote}${key}${quote}: ${quote}${value}${quote},`;
    }).join('\n');
}
exports.stringifyObject = stringifyObject;
