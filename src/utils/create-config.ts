import z from 'zod';

const configSchema = z.object({
  assetOutDir: z.string().nonempty(),
  assetPublicDir: z.string().nonempty(),
  assetUtilPath: z.string().nonempty(),

  codeDir: z.string().nonempty(),
  codeExts: z.string().nonempty().array().min(1),

  indent: z.string().nonempty().optional().default('  '),
  semicolons: z.boolean().optional().default(true),
  singleQuotes: z.boolean().optional().default(true),
});

export type ConfigInput = z.input<typeof configSchema>;
export type Config = z.output<typeof configSchema>;

export function createConfig(configInput: ConfigInput): Config {
  return configSchema.parse(configInput);
}