import { buildAssets } from '@/src/utils/build-assets';
import { ConfigInput, createConfig } from '@/src/utils/create-config';
import { createWatcher } from '@/src/utils/create-watcher';
import { posix } from 'node:path';

export function buildAndWatchAssets(configInput: ConfigInput) {
  const config = createConfig(configInput);

  return createWatcher({
    ignore: [
      posix.join(config.assetOutDir, '**/*'),
      config.assetUtilPath,
    ],
    pattern: posix.join(config.codeDir, '**/*'),
    action: async () => await buildAssets(config),
  });
}