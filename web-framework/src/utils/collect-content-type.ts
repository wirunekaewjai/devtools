import mime from "mime-types";
import path from "node:path";
import { StaticMap } from "../types";

export function collectContentType(staticMap: StaticMap, filePath: string) {
  const type = mime.lookup(filePath);

  if (type) {
    const key = path.extname(filePath);
    staticMap.types[key] = type;
  }
}
