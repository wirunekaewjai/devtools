export interface Env {
  id: string;
}

export interface RouteInfo {
  path: string;
  methods: string[];
  modulePath: string;
}

export interface BuildInfo {
  env: Env;
  publicMap: Record<string, string>;
  routeInfos: RouteInfo[];
  typeMap: Record<string, string>;
}

export interface RouteHandlers {
  [method: string]: (req: Request) => Promise<Response>;
}
