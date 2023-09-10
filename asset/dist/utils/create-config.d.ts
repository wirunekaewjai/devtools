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
export type Config = z.output<typeof configSchema>;
export declare function createConfig(input: z.input<typeof configSchema>): {
    content: string[];
    output: string;
};
export {};
