import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { posix } from "node:path";

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

function adjustRelativePath(value: string) {
  if (value.startsWith("/")) {
    return value.slice(1);
  }

  return value;
}

export async function getTsConfig(configPath: string) {
  const config: TsConfig = {
    aliases: {},
    excludes: ["node_modules"],
    includes: [],
    root: ".",
  };

  if (!existsSync(configPath)) {
    return config;
  }

  const raw = await readFile(configPath, "utf8");
  const src: TsConfigSource = JSON.parse(raw);

  if (src.compilerOptions?.baseUrl) {
    config.root = src.compilerOptions.baseUrl;
  }

  if (src.compilerOptions?.jsxImportSource) {
    config.jsxImportSource = src.compilerOptions.jsxImportSource;
  }

  const configDir = posix.dirname(configPath);
  config.root = posix.join(configDir, config.root);

  if (src.compilerOptions?.paths) {
    const paths: Record<string, string> = {};

    Object.entries(src.compilerOptions.paths).forEach(([key, values]) => {
      if (values.length > 0) {
        const parsedKey = key.endsWith("*") ? key.slice(0, -1) : key;
        paths[parsedKey] = posix.join(
          config.root,
          values[0].endsWith("*") ? values[0].slice(0, -1) : values[0]
        );
      }
    });

    config.aliases = paths;
  }

  if (src.exclude) {
    config.excludes.push(...src.exclude);
    config.excludes = Array.from(new Set(config.excludes));
  }

  if (src.include) {
    config.includes.push(...src.include);
    config.includes = Array.from(new Set(config.includes));
  }

  config.excludes = config.excludes.map((exludePath) => {
    return adjustRelativePath(posix.join(config.root, exludePath));
  });

  config.includes = config.includes.map((includePath) => {
    return adjustRelativePath(posix.join(config.root, includePath));
  });

  return config;
}
