import { rm } from "node:fs/promises";
import { build } from "../build";
import { VERCEL_OUTPUT_DIR } from "../constants";
import { dev } from "../dev";
import { Builder, Command, Environment } from "../enums";
import { ConfigInput, createConfig } from "./create-config";
import { getBuilder } from "./get-builder";
import { getCommand } from "./get-command";

export async function createApp(
  configInput: ConfigInput,
  targetBuilder?: Builder
) {
  const config = createConfig(configInput);

  const builder = targetBuilder ?? getBuilder();
  const command = getCommand();

  console.log("> command:", command);
  console.log("> builder:", builder);

  if (!command) {
    console.log("> command is not provided.");
    return;
  }

  await rm(config.buildDir, {
    force: true,
    recursive: true,
  });

  await rm(VERCEL_OUTPUT_DIR, {
    force: true,
    recursive: true,
  });

  if (command === Command.BUILD) {
    console.time("> build time");
    await build(Environment.PRODUCTION, builder, config);
    console.timeEnd("> build time");
    return;
  }

  if (command === Command.DEV) {
    await dev(builder, config);
    return;
  }
}
