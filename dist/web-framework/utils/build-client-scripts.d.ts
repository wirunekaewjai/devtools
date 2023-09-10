import { Environment } from "../enums";
import { StaticMap } from "../types";
import { Config } from "./create-config";
import { TsConfig } from "./get-ts-config";
export declare function buildClientScripts(env: Environment, config: Config, tsConfig: TsConfig, staticMap: StaticMap, sourcePaths: string[]): Promise<void>;
