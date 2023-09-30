import { $ } from 'execa';

async function main() {
  await $({ stdio: "inherit" })`node src/cli/build.mjs`;
  await $({ stdio: "inherit" })`node dist/server/app.js`;
}

main();