import { Command } from "../enums";

export function getCommand() {
  const command = process.argv[2];

  if (command === Command.BUILD) {
    return Command.BUILD;
  }

  if (command === Command.DEV) {
    return Command.DEV;
  }

  return null;
}
