import { ParseResult } from "@babel/parser";
import { File } from "@babel/types";
import { StaticMap } from "../types";
import { Config } from "./create-config";
export declare function resolveAsset(config: Config, staticMap: StaticMap, ast: ParseResult<File>): Promise<void>;
