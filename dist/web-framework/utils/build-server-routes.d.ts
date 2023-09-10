import esbuild from "esbuild";
import { BuildInfo, StaticMap } from "../types";
import { Config } from "./create-config";
import { TsConfig } from "./get-ts-config";
export declare function buildServerRoutes(info: BuildInfo, config: Config, tsConfig: TsConfig, staticMap: StaticMap, result: esbuild.BuildResult<{
    metafile: true;
}>): Promise<void>;
