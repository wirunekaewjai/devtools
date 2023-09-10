import { BuildInfo, RouteInfo } from "../types";
export declare function buildAppDeps(info: BuildInfo, publicMap: Record<string, string>, routeInfos: RouteInfo[], typeMap: Record<string, string>, cwd: string, tempDir: string): Promise<void>;
