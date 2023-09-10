import { Builder, Environment } from "./enums";

export interface BuildInfo {
  builder: Builder;
  env: Environment;
  id: string;
}

export interface StaticMap {
  private: Record<string, string>;
  public: Record<string, string>;
  types: Record<string, string>;
}

export interface EsbuildEntryPoint {
  in: string;
  out: string;
}

export interface RouteInfo {
  path: string;
  methods: string[];
  modulePath: string;
}
