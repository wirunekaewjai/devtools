import { BuildInfo, RouteInfo, StaticMap } from "../types";
import { Config } from "./create-config";
import { TsConfig } from "./get-ts-config";
export declare function buildServerScripts(info: BuildInfo, config: Config, tsConfig: TsConfig, staticMap: StaticMap, sourcePaths: string[]): Promise<RouteInfo[]>;
