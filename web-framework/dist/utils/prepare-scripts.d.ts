import { StaticMap } from "../types";
import { Config } from "./create-config";
import { TsConfig } from "./get-ts-config";
interface Result {
    serverPath: string;
    clientPath: string | null;
}
export declare function prepareScripts(config: Config, tsConfig: TsConfig, staticMap: StaticMap, sourcePath: string): Promise<Result>;
export {};
