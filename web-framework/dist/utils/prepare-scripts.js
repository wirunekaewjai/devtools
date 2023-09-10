"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prepareScripts = void 0;
const promises_1 = require("node:fs/promises");
const node_path_1 = require("node:path");
const constants_1 = require("../constants");
const babel_generate_1 = require("./babel-generate");
const babel_parse_1 = require("./babel-parse");
const resolve_import_1 = require("./resolve-import");
async function prepareScripts(config, tsConfig, staticMap, sourcePath) {
    const buildDir = config.buildDir;
    const sourceCode = await (0, promises_1.readFile)(sourcePath, "utf8");
    const ast = (0, babel_parse_1.babelParse)(sourceCode, {
        sourceType: "module",
        plugins: ["jsx", "typescript"],
    });
    await (0, resolve_import_1.resolveImport)(tsConfig, sourcePath, ast);
    // await resolveAsset(config, staticMap, ast);
    const statementClients = [];
    const statementServers = [];
    let hasClientScript = false;
    ast.program.body.forEach((statement) => {
        if (statement.type.startsWith("TS")) {
            return;
        }
        if (statement.type === "ImportDeclaration") {
            statementClients.push(statement);
            statementServers.push(statement);
            return;
        }
        if (statement.type !== "ExportNamedDeclaration") {
            statementServers.push(statement);
            return;
        }
        if (statement.declaration?.type !== "VariableDeclaration") {
            statementServers.push(statement);
            return;
        }
        const declarators = [];
        statement.declaration.declarations.forEach((declarator) => {
            if (declarator.id.type !== "Identifier") {
                declarators.push(declarator);
                return;
            }
            const name = declarator.id.name;
            if (constants_1.CLIENT_RESERVED_NAME !== name) {
                declarators.push(declarator);
                return;
            }
            const expression = declarator.init;
            if (expression?.type !== "ArrowFunctionExpression") {
                return;
            }
            if (expression.body.type !== "BlockStatement") {
                return;
            }
            statementClients.push(...expression.body.body);
            hasClientScript = true;
        });
        if (declarators.length === 0) {
            return;
        }
        // client-side script removed
        statement.declaration.declarations = declarators;
        statementServers.push(statement);
    });
    const result = {
        serverPath: "",
        clientPath: null,
    };
    // SERVER
    {
        ast.program.body = statementServers;
        const out = (0, babel_generate_1.babelGenerate)(ast);
        const outPath = node_path_1.posix.join(buildDir, constants_1.BUILD_TEMP_DIR, sourcePath);
        const outDir = node_path_1.posix.dirname(outPath);
        await (0, promises_1.mkdir)(outDir, {
            recursive: true,
        });
        await (0, promises_1.writeFile)(outPath, out.code, "utf8");
        result.serverPath = outPath;
    }
    // CLIENT
    {
        ast.program.body = statementClients;
        if (hasClientScript && statementClients.length > 0) {
            const sourceDir = node_path_1.posix.dirname(sourcePath);
            const sourceExt = node_path_1.posix.extname(sourcePath);
            const sourceName = node_path_1.posix.basename(sourcePath, sourceExt);
            const out = (0, babel_generate_1.babelGenerate)(ast);
            const outExt = constants_1.CLIENT_EXTENSION;
            const outName = `${sourceName}${outExt}`;
            const outPath = node_path_1.posix.join(buildDir, constants_1.BUILD_TEMP_DIR, sourceDir, outName);
            const outDir = node_path_1.posix.dirname(outPath);
            await (0, promises_1.mkdir)(outDir, {
                recursive: true,
            });
            await (0, promises_1.writeFile)(outPath, out.code, "utf8");
            result.clientPath = outPath;
        }
    }
    return result;
}
exports.prepareScripts = prepareScripts;
