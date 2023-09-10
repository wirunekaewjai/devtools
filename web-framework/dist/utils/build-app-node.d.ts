import { BuildInfo, RouteInfo } from "../types";
import { Config } from "./create-config";
export declare function buildAppNode(info: BuildInfo, config: Config, publicMap: Record<string, string>, routeInfos: RouteInfo[], typeMap: Record<string, string>): Promise<void>;
