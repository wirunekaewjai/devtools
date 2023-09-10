import { Environment } from "../enums";
import { StaticMap } from "../types";
import { Config } from "./create-config";
export declare function buildTailwind(env: Environment, config: Config, staticMap: StaticMap): Promise<void>;
