import { UTIL_FUNCTION_NAME } from '@/src/utils/constants';
import { Config } from '@/src/utils/create-config';
import { stringifyObject } from '@/src/utils/stringify-object';
import { mkdir, writeFile } from 'node:fs/promises';
import { posix } from 'node:path';

export async function generateAssetUtil(config: Config, map: Record<string, string>) {
  const semicolons = config.semicolons ? ';' : '';
  const assetUtilCode = [
    `const map = {`,
       stringifyObject(config, map),
    `}${semicolons}`,
    '',
    `export function ${UTIL_FUNCTION_NAME}(assetPath: keyof typeof map): string {`,
    `${config.indent}return map[assetPath]${semicolons}`,
    `}`,
  ].join('\n');

  const assetUtilDir = posix.dirname(config.assetUtilPath);

  await mkdir(assetUtilDir, {
    recursive: true,
  });

  await writeFile(config.assetUtilPath, assetUtilCode, 'utf8');
}
