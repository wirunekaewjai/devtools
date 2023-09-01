import { Config } from '@/src/utils/create-config';

export function stringifyObject(config: Config, map: Record<string, string>) {
  const quote = config.singleQuotes ? "'" : '"';
  return Object.entries(map).map(([key, value]) => {
    return `${config.indent}${quote}${key}${quote}: ${quote}${value}${quote},`;
  }).join('\n');
}