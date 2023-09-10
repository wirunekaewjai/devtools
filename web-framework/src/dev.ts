import { glob } from "glob";
import { posix } from "node:path";
import nodemon from "nodemon";
import { build } from "./build";
import { APP_FILE_NAME } from "./constants";
import { Builder, Environment } from "./enums";
import { Config } from "./utils/create-config";
import { createHashFromFile } from "./utils/create-hash";

const POLLING_INTERVAL = 1_000;

let server: typeof nodemon | null = null;

function start(script: string) {
  if (server) {
    return server.restart();
  }

  server = nodemon({
    script,
    stdout: true,
  });

  server.once("crash", () => {
    process.exit();
  });
}

export async function dev(builder: Builder, config: Config) {
  const env = Environment.DEVELOPMENT;
  const buildDir = config.buildDir;

  const script = posix.join(buildDir, APP_FILE_NAME);
  const hashmap: Record<string, string> = {};

  let isInitialized = false;
  let previousFilePaths: string[] = [];

  async function compare() {
    const filePaths = await glob("**/*", {
      posix: true,
      nodir: true,
      ignore: [
        ".vscode/**/*",
        "node_modules/**/*",
        posix.join(buildDir, "**/*"),
      ],
    });

    let isChanged = false;

    const pendings: string[] = [];

    // check adds
    if (!isChanged) {
      const adds: string[] = [];

      for (const filePath of filePaths) {
        if (previousFilePaths.includes(filePath)) {
          pendings.push(filePath);
        } else {
          hashmap[filePath] = await createHashFromFile(filePath).catch(
            () => ""
          );
          adds.push(filePath);
        }
      }

      isChanged = adds.length > 0;
    }

    // check removes
    if (!isChanged) {
      const removes: string[] = [];

      for (const previousFilePath of previousFilePaths) {
        if (!filePaths.includes(previousFilePath)) {
          delete hashmap[previousFilePath];
          removes.push(previousFilePath);
        }
      }

      isChanged = removes.length > 0;
    }

    // check updates
    if (!isChanged) {
      const updates: string[] = [];

      for (const filePath of pendings) {
        const previous = hashmap[filePath];
        const current = await createHashFromFile(filePath).catch(() => "");

        if (previous !== current) {
          hashmap[filePath] = current;
          updates.push(filePath);
        }
      }

      isChanged = updates.length > 0;
    }

    previousFilePaths = filePaths;

    if (isChanged) {
      if (isInitialized) {
        console.log();
        console.log("> restarting...");
        console.log();
      } else {
        isInitialized = true;
      }

      console.time("> build time");
      await build(env, builder, config);
      console.timeEnd("> build time");
      console.log();

      start(script);
    }

    await new Promise((resolve) => setTimeout(resolve, POLLING_INTERVAL));
    await compare();
  }

  await compare();
}
