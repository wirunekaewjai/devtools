import { createHashFromFile } from '@/src/utils/create-hash';
import { glob } from 'glob';
import nodemon from 'nodemon';
import z from 'zod';

const configSchema = z.object({
  interval: z.number().positive().optional().default(1000),
  ignore: z.string().nonempty().array().optional().default([]),
  pattern: z.string().nonempty().or(z.string().nonempty().array().min(1)),
  script: z.string().nonempty().or(z.function()),
});

export async function createWatcher(configInput: z.input<typeof configSchema>) {
  const config = configSchema.parse(configInput);
  const hashmap: Record<string, string> = {};

  let server: typeof nodemon | null = null;

  function start(script: string) {
    if (server) {
      return server.restart();
    }
  
    server = nodemon({
      script,
      stdout: true,
    });
  
    server.once('crash', () => {
      process.exit();
    });
  }
  
  let isInitialized = false;
  let previousFilePaths: string[] = [];

  async function compare() {
    const filePaths = await glob(config.pattern, {
      ignore: config.ignore,
      posix: true,
      nodir: true,
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
          hashmap[filePath] = await createHashFromFile(filePath).catch(() => '');
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
        const current = await createHashFromFile(filePath).catch(() => '');

        if (previous !== current) {
          hashmap[filePath] = current;
          updates.push(filePath);
        }
      }

      isChanged = updates.length > 0;
    }

    previousFilePaths = filePaths;

    if (isChanged) {
      if (typeof config.script === 'string') {
        if (isInitialized) {
          console.log();
          console.log('> restarting...');
          console.log();
        } else {
          isInitialized = true;
        }
  
        start(config.script);
      } else {
        await config.script();
      }
    }

    await new Promise((resolve) => setTimeout(resolve, config.interval));
    await compare();
  }

  await compare();
}