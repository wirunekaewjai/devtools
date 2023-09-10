import { ParseResult } from "@babel/parser";
import { File } from "@babel/types";
import { TsConfig } from "./get-ts-config";
export declare function resolveImport(tsConfig: TsConfig, sourcePath: string, ast: ParseResult<File>): Promise<void>;
