"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Environment = exports.Command = exports.Builder = void 0;
var Builder;
(function (Builder) {
    Builder["NODE"] = "node";
    Builder["VERCEL"] = "vercel";
})(Builder || (exports.Builder = Builder = {}));
var Command;
(function (Command) {
    Command["BUILD"] = "build";
    Command["DEV"] = "dev";
})(Command || (exports.Command = Command = {}));
var Environment;
(function (Environment) {
    Environment["DEVELOPMENT"] = "development";
    Environment["PRODUCTION"] = "production";
})(Environment || (exports.Environment = Environment = {}));
