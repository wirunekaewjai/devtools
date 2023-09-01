import { UTIL_FUNCTION_NAME } from '@/src/utils/constants';
import { Config } from '@/src/utils/create-config';
import { createHash } from '@/src/utils/create-hash';
import { generateAssetUtil } from '@/src/utils/generate-asset-util';
import { glob } from 'glob';
import mime from 'mime-types';
import { existsSync } from 'node:fs';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { posix } from 'node:path';
import sharp from 'sharp';
import z from 'zod';

const IMAGE_TRANSFORMABLE_TYPES = [
  'image/avif',
  'image/jpeg',
  'image/png',
  'image/tiff',
  'image/webp',
];

const querySchema = z.object({
  w: z.preprocess(Number, z.number().min(16).max(4096)).optional(),
  q: z.preprocess(Number, z.number().min(10).max(100)).optional(),
});

async function resolveAsset(config: Config, map: Record<string, string>, assetPath: string, assetData: Buffer) {
  const [absolutePath] = assetPath.split('?');

  const assetHash = await createHash(assetData);
  const assetExt = posix.extname(absolutePath);
  const assetBaseName = posix.basename(absolutePath, assetExt);
  const assetName = `${assetBaseName}.${assetHash}${assetExt}`;

  const outPath = posix.join(config.assetOutDir, assetName);
  const outDir = posix.dirname(outPath);

  const publicPath = posix.join(config.assetPublicDir, assetName);

  if (!existsSync(outPath)) {
    await mkdir(outDir, {
      recursive: true,
    });
  
    await writeFile(outPath, assetData);
  }

  map[assetPath] = publicPath;
  return outPath;
}

async function collectAssets(config: Config) {
  const map: Record<string, string> = {};
  const outPaths: string[] = [];

  const filePaths = await glob(config.codeExts.map((ext) => {
    return posix.join(config.codeDir, `**/*${ext}`);
  }), {
    posix: true,
    nodir: true,
  });

  const regex1 = `\\${UTIL_FUNCTION_NAME}\\(\\'\\/[^'\\n\\t]+\\'\\)`;
  const regex2 = `\\${UTIL_FUNCTION_NAME}\\(\\"\\/[^"\\n\\t]+\\"\\)`;
  const regex = new RegExp(`(${regex1})|(${regex2})`, 'g');

  const assetPaths: string[] = [];

  for (const filePath of filePaths) {
    const fileText = await readFile(filePath, 'utf8');

    fileText.replace(regex, (text) => {
      assetPaths.push(text.slice(UTIL_FUNCTION_NAME.length + 2, -2));
      return text;
    });
  }

  for (const assetPath of assetPaths) {
    if (map[assetPath]) {
      continue;
    }

    const [absolutePath, query] = assetPath.split('?');
    const sourcePath = absolutePath.slice(1);

    if (!existsSync(sourcePath)) {
      continue;
    }

    const contentType = mime.lookup(sourcePath);

    if (query && contentType && IMAGE_TRANSFORMABLE_TYPES.includes(contentType)) {
      const params = querySchema.safeParse(
        Object.fromEntries(new URLSearchParams(query).entries()),
      );

      if (params.success && (params.data.w || params.data.q)) {
        const key = `> transform: ${assetPath}`;
        console.time(key);
    
        const formatter = contentType === 'image/jpeg' ? 'jpeg' : 'png';

        let data = await readFile(sourcePath);
        let transform = sharp(data);

        if (params.data.w) {
          transform = transform.resize({
            width: params.data.w,
            withoutEnlargement: true,
          });
        }

        transform = transform[formatter]({
          quality: params.data.q ?? 100,
        });

        data = await transform.toBuffer();

        const outPath = await resolveAsset(config, map, assetPath, data);
        outPaths.push(outPath);
        console.timeEnd(key);
        continue;
      }
    }

    const key = `> copy: ${assetPath}`;
    console.time(key);

    const data = await readFile(sourcePath);
    const outPath = await resolveAsset(config, map, assetPath, data);
    outPaths.push(outPath);
    console.timeEnd(key);
  }

  return {
    map,
    outPaths,
  };
}

export async function buildAssets(config: Config) {
  const { map, outPaths } = await collectAssets(config);

  await generateAssetUtil(config, map);

  const previous = await glob(posix.join(config.assetOutDir, '**/*'), {
    posix: true,
    nodir: true,
  });

  for (const previousPath of previous) {
    if (outPaths.includes(previousPath)) {
      continue;
    }

    await rm(previousPath);
    // console.log('> delete', previousPath);
  }
}