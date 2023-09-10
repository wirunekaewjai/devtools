import { Builder, Environment } from "./enums";
import { Config } from "./utils/create-config";
export declare function build(env: Environment, builder: Builder, config: Config): Promise<void>;
