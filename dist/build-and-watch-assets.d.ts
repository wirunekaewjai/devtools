import z from 'zod';
declare const configSchema: z.ZodObject<{
    assetDir: z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>;
    assetOutDir: z.ZodString;
    assetPublicDir: z.ZodString;
    assetUtilPath: z.ZodString;
    codeDir: z.ZodString;
    codeExts: z.ZodArray<z.ZodString, "many">;
    indent: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    semicolons: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    singleQuotes: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    assetDir: (string | string[]) & (string | string[] | undefined);
    assetOutDir: string;
    assetPublicDir: string;
    assetUtilPath: string;
    codeDir: string;
    codeExts: string[];
    indent: string;
    semicolons: boolean;
    singleQuotes: boolean;
}, {
    assetDir: (string | string[]) & (string | string[] | undefined);
    assetOutDir: string;
    assetPublicDir: string;
    assetUtilPath: string;
    codeDir: string;
    codeExts: string[];
    indent?: string | undefined;
    semicolons?: boolean | undefined;
    singleQuotes?: boolean | undefined;
}>;
export declare function buildAndWatchAssets(configInput: z.input<typeof configSchema>): Promise<void>;
export {};
