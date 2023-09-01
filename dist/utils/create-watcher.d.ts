import z from 'zod';
declare const configSchema: z.ZodObject<{
    action: z.ZodFunction<z.ZodTuple<[], z.ZodUnknown>, z.ZodUnknown>;
    interval: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    ignore: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
    pattern: z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>;
}, "strip", z.ZodTypeAny, {
    interval: number;
    pattern: (string | string[]) & (string | string[] | undefined);
    action: (...args: unknown[]) => unknown;
    ignore: string[];
}, {
    pattern: (string | string[]) & (string | string[] | undefined);
    action: (...args: unknown[]) => unknown;
    interval?: number | undefined;
    ignore?: string[] | undefined;
}>;
export type Unsubscribe = () => void;
export declare function createWatcher(configInput: z.input<typeof configSchema>): Unsubscribe;
export {};
