export interface TsConfigSource {
    compilerOptions?: {
        baseUrl?: string;
        paths?: Record<string, string[]>;
        jsxImportSource?: string;
    };
    exclude?: string[];
    include?: string[];
}
export interface TsConfig {
    aliases: Record<string, string>;
    excludes: string[];
    includes: string[];
    root: string;
    jsxImportSource?: string;
}
export declare function getTsConfig(configPath: string): Promise<TsConfig>;
