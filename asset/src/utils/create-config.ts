import z from "zod";

const configSchema = z.object({
  content: z.string().nonempty().array(),
  output: z.string().nonempty().default("static"),
});

export type Config = z.output<typeof configSchema>;

export function createConfig(input: z.input<typeof configSchema>) {
  return configSchema.parse(input);
}