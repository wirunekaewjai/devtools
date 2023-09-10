import { TsConfig } from "./get-ts-config";

export function resolveAlias(tsConfig: TsConfig, targetPath: string) {
  const aliasEntries = Object.entries(tsConfig.aliases);

  for (const [alias, absolutePath] of aliasEntries) {
    if (targetPath.startsWith(alias)) {
      return `${absolutePath}${targetPath.slice(alias.length)}`;
    }
  }

  return targetPath;
}
