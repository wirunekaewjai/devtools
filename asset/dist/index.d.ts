import z from "zod";
declare const configSchema: z.ZodObject<{
    content: z.ZodArray<z.ZodString, "many">;
    output: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    content: string[];
    output: string;
}, {
    content: string[];
    output?: string | undefined;
}>;
export declare function buildAssets(input: z.input<typeof configSchema>): Promise<void>;
export {};
