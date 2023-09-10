"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VERCEL_OUTPUT_DIR = exports.VERCEL_SERVERLESS_NAME = exports.VERCEL_SERVERLESS_DIR = exports.VERCEL_STATIC_DIR = exports.SERVER_RESERVED_NAMES = exports.CLIENT_SCRIPT_INJECTION_TARGET = exports.CLIENT_EXTENSION = exports.CLIENT_RESERVED_NAME = exports.BUILD_TEMP_DIR = exports.BUILD_STATIC_DIR = exports.BUILD_SCRIPT_DIR = exports.BUILD_ROUTE_DIR = exports.APP_TEMPLATE_DIR = exports.APP_DEPENDENCY_DIR = exports.APP_FILE_NAME = void 0;
exports.APP_FILE_NAME = "app.js";
exports.APP_DEPENDENCY_DIR = "dependencies";
exports.APP_TEMPLATE_DIR = "templates";
exports.BUILD_ROUTE_DIR = "routes";
exports.BUILD_SCRIPT_DIR = "scripts";
exports.BUILD_STATIC_DIR = "static";
exports.BUILD_TEMP_DIR = "temp";
exports.CLIENT_RESERVED_NAME = "SCRIPT";
exports.CLIENT_EXTENSION = ".client.ts";
exports.CLIENT_SCRIPT_INJECTION_TARGET = "head";
exports.SERVER_RESERVED_NAMES = [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "HEAD",
    "OPTIONS",
    "DELETE",
];
exports.VERCEL_STATIC_DIR = "static";
exports.VERCEL_SERVERLESS_DIR = "functions";
exports.VERCEL_SERVERLESS_NAME = "index.func";
exports.VERCEL_OUTPUT_DIR = ".vercel/output";
