import mime from "mime-types";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { posix } from "node:path";
import { URLSearchParams } from "node:url";
import sharp from "sharp";
import z from "zod";
import { StaticMap } from "../types";
import { Config } from "./create-config";
import { createHash } from "./create-hash";

const IMAGE_TRANSFORMABLE_TYPES = [
  "image/avif",
  "image/jpeg",
  "image/png",
  "image/tiff",
  "image/webp",
];

const querySchema = z.object({
  w: z.preprocess(Number, z.number().min(16).max(4096)).optional(),
  q: z.preprocess(Number, z.number().min(10).max(100)).optional(),
});

export async function collectAsset(
  config: Config,
  staticMap: StaticMap,
  queryPath: string
) {
  if (staticMap.private[queryPath]) {
    return;
  }

  const [privatePath, query] = queryPath.split("?");
  const assetPath = privatePath.slice(1);

  if (!existsSync(assetPath)) {
    return;
  }

  const contentType = mime.lookup(assetPath);

  if (query && contentType && IMAGE_TRANSFORMABLE_TYPES.includes(contentType)) {
    const key = `> transform: ${queryPath.slice(1)}`;
    console.time(key);

    const params = querySchema.safeParse(
      Object.fromEntries(new URLSearchParams(query).entries())
    );

    let data = await readFile(assetPath);
    let transform = sharp(assetPath);

    if (params.success && (params.data.w || params.data.q)) {
      const formatter = contentType === "image/jpeg" ? "jpeg" : "png";

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

      const assetHash = await createHash(data);
      const assetExt = posix.extname(assetPath);
      const assetName = posix.basename(assetPath, assetExt);

      const resourcePath = `${config.output}/${assetName}.${assetHash}${assetExt}`;
      const resourceDir = posix.dirname(resourcePath);

      const publicPath = `/${resourcePath}`;

      await mkdir(resourceDir, {
        recursive: true,
      });

      await writeFile(resourcePath, data);

      staticMap.private[queryPath] = publicPath;
      // staticMap.public[publicPath] = resourcePath;

      console.timeEnd(key);
      return;
    }
  }

  const key = `> collect: ${queryPath.slice(1)}`;
  console.time(key);

  const assetData = await readFile(assetPath);
  const assetHash = await createHash(assetData);
  const assetExt = posix.extname(assetPath);
  const assetName = posix.basename(assetPath, assetExt);

  const resourcePath = `${config.output}/${assetName}.${assetHash}${assetExt}`;
  const resourceDir = posix.dirname(resourcePath);

  const publicPath = `/${resourcePath}`;

  await mkdir(resourceDir, {
    recursive: true,
  });

  await writeFile(resourcePath, assetData);

  staticMap.private[privatePath] = publicPath;
  // staticMap.public[publicPath] = resourcePath;

  console.timeEnd(key);
}
