import { glob } from "glob";
import { TsConfig } from "./get-ts-config";

export async function getSourcePaths(tsConfig: TsConfig) {
  const filePaths = await glob(tsConfig.includes, {
    posix: true,
    nodir: true,
  });

  return filePaths
    .map((filePath) =>
      filePath.startsWith("/") ? filePath.slice(1) : filePath
    )
    .filter(
      (filePath) =>
        !tsConfig.excludes.some((exclude) => filePath.startsWith(exclude))
    );
}
