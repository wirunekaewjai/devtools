import z from 'zod';
declare const configSchema: z.ZodObject<{
    interval: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    ignore: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
    pattern: z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>;
    script: z.ZodUnion<[z.ZodString, z.ZodFunction<z.ZodTuple<[], z.ZodUnknown>, z.ZodUnknown>]>;
}, "strip", z.ZodTypeAny, {
    interval: number;
    script: (string | ((...args: unknown[]) => unknown)) & (string | ((...args: unknown[]) => unknown) | undefined);
    pattern: (string | string[]) & (string | string[] | undefined);
    ignore: string[];
}, {
    script: (string | ((...args: unknown[]) => unknown)) & (string | ((...args: unknown[]) => unknown) | undefined);
    pattern: (string | string[]) & (string | string[] | undefined);
    interval?: number | undefined;
    ignore?: string[] | undefined;
}>;
export declare function createWatcher(configInput: z.input<typeof configSchema>): Promise<void>;
export {};
