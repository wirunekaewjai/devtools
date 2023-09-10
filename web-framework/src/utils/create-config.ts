import { z } from "zod";

const tailwindSchema = z.object({
  config: z.string().nonempty(),
  css: z.string().nonempty(),
});

const configSchema = z.object({
  assetPrefix: z.string().nonempty().optional(),
  externals: z.string().nonempty().array().optional().default([]),
  buildDir: z.string().optional().default(".reactr"),
  routeDir: z.string().optional().default("src/routes"),
  tailwind: tailwindSchema.array().optional().default([]),
  tsconfig: z.string().optional().default("tsconfig.json"),
});

export type ConfigInput = z.input<typeof configSchema>;
export type Config = z.output<typeof configSchema>;

export function createConfig(configInput: ConfigInput): Config {
  return configSchema.parse(configInput);
}
