import { existsSync, readFileSync } from "fs";
import { posix } from "path";
import sharp from "sharp";
import { getAssetSourcePath } from '../utils/asset.mjs';

/** @type {Record<string, string>} */
const MIMES = {
  ".avif": 'image/avif',
  ".css": 'text/css',
  ".gif": 'image/gif',
  ".ico": 'image/x-icon',
  ".jpeg": 'image/jpeg',
  ".jpg": 'image/jpeg',
  ".js": 'text/javascript',
  ".json": 'application/json',
  ".mjs": 'text/javascript',
  ".mp4": 'video/mp4',
  ".png": 'image/png',
  ".svg": 'image/svg+xml',
  ".tif": 'image/tiff',
  ".tiff": 'image/tiff',
  ".webm": 'video/webm',
  ".weba": 'audio/webm',
  ".webp": 'image/webp',
  ".woff": 'font/woff',
  ".woff2": 'font/woff2',
};

const IMAGE_EXTENSIONS = [
  ".avif",
  ".jpeg",
  ".jpg",
  ".png",
  ".tif",
  ".tiff",
  ".webp",
];

/**
 * 
 * @param {string | null} value 
 * @returns 
 */
function parseNumber(value) {
  if (value) {
    const n = Number(value);

    if (n > 0) {
      return n;
    }
  }

  return null;
}

/**
 * 
 * @param {number} value 
 * @returns 
 */
function isValidWidth(value) {
  return value >= 16 && value <= 4096 && value % 16 === 0;
}

/**
 * 
 * @param {number} value 
 * @returns 
 */
function isValidQualtity(value) {
  return value >= 10 && value <= 100;
}

/**
 * 
 * @param {import('itty-router').IRequest} req 
 * @returns 
 */
export const GET = async (req) => {
  const url = new URL(req.url);
  const src = getAssetSourcePath(url.pathname);

  if (!existsSync(src)) {
    return new Response(null, {
      status: 404,
    });
  }

  const ext = posix.extname(src).toLowerCase();
  
  let buffer = readFileSync(src);
  let mime = MIMES[ext];

  if (IMAGE_EXTENSIONS.includes(ext)) {
    const isWebp = req.headers.get("Accept")?.includes("webp");
    const w = url.searchParams.get("w");
    const q = url.searchParams.get("q");

    const width = parseNumber(w);
    const quality = parseNumber(q);

    if (quality && width) {
      if (!isValidWidth(width) || !isValidQualtity(quality)) {
        return new Response(null, {
          status: 404,
        });
      }

      const t = sharp(buffer).resize({
        width,
        withoutEnlargement: true,
      });

      if (isWebp) {
        buffer = await t.webp({ quality }).toBuffer();
        mime = MIMES[".webp"];
      } else if (ext === ".jpg" || ext === ".jpeg") {
        buffer = await t.jpeg({ quality }).toBuffer();
      } else {
        buffer = await t.png({ quality }).toBuffer();
        mime = MIMES[".png"];
      }
    } else if (width) {
      if (!isValidWidth(width)) {
        return new Response(null, {
          status: 404,
        });
      }

      const t = sharp(buffer).resize({
        width,
        withoutEnlargement: true,
      });

      if (isWebp) {
        buffer = await t.webp().toBuffer();
        mime = MIMES[".webp"];
      } else if (ext === ".jpg" || ext === ".jpeg") {
        buffer = await t.toBuffer();
      } else {
        buffer = await t.toBuffer();
      }
    }
  }

  return new Response(buffer, {
    headers: {
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Type": mime,
    },
  });
};