import { createHashFromFile } from '@/src/utils/create-hash';
import { glob } from 'glob';
import z from 'zod';

const configSchema = z.object({
  action: z.function(),
  interval: z.number().positive().optional().default(1000),
  ignore: z.string().nonempty().array().optional().default([]),
  pattern: z.string().nonempty().or(z.string().nonempty().array().min(1)),
});

export type Unsubscribe = () => void;

export function createWatcher(configInput: z.input<typeof configSchema>): Unsubscribe {
  const config = configSchema.parse(configInput);
  const hashmap: Record<string, string> = {};

  let isRunning = true;
  let previousFilePaths: string[] = [];

  async function compare() {
    if (!isRunning) {
      return;
    }

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

    if (!isRunning) {
      return;
    }

    if (isChanged) {
      await config.action();
    }

    if (!isRunning) {
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, config.interval));
    await compare();
  }

  compare();
  return () => {
    isRunning = false;
  };
}