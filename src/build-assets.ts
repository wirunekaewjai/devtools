import { buildAssets as baseBuildAssets } from '@/src/utils/build-assets';
import { ConfigInput, createConfig } from '@/src/utils/create-config';

export async function buildAssets(configInput: ConfigInput) {
  const config = createConfig(configInput);
  await baseBuildAssets(config);
}