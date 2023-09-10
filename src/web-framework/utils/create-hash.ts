import hash from "@emotion/hash";
import { readFile } from "node:fs/promises";

export async function createHash(fileData: string | Buffer) {
  if (typeof fileData === "string") {
    return hash(fileData);
  }

  return hash(fileData.toString("utf8"));
}

export async function createHashFromFile(filePath: string) {
  const fileData = await readFile(filePath);
  return createHash(fileData);
}
