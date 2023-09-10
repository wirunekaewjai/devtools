import { posix } from "node:path";
import { Builder } from "../enums";
import { Config } from "./create-config";

export function getBuildDir(
  builder: Builder,
  config: Config,
  ...paths: string[]
) {
  if (builder === Builder.VERCEL) {
    return posix.join(".vercel/output", ...paths);
  }

  return posix.join(config.buildDir, ...paths);
}
