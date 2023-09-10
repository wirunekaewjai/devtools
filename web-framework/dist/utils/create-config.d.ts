import { z } from "zod";
declare const configSchema: z.ZodObject<{
    assetPrefix: z.ZodOptional<z.ZodString>;
    externals: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
    buildDir: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    routeDir: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    tailwind: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodObject<{
        config: z.ZodString;
        css: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        css: string;
        config: string;
    }, {
        css: string;
        config: string;
    }>, "many">>>;
    tsconfig: z.ZodDefault<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    tsconfig: string;
    externals: string[];
    buildDir: string;
    routeDir: string;
    tailwind: {
        css: string;
        config: string;
    }[];
    assetPrefix?: string | undefined;
}, {
    assetPrefix?: string | undefined;
    externals?: string[] | undefined;
    buildDir?: string | undefined;
    routeDir?: string | undefined;
    tailwind?: {
        css: string;
        config: string;
    }[] | undefined;
    tsconfig?: string | undefined;
}>;
export type ConfigInput = z.input<typeof configSchema>;
export type Config = z.output<typeof configSchema>;
export declare function createConfig(configInput: ConfigInput): Config;
export {};
