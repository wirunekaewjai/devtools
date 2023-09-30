import { $ } from 'execa';

async function main() {
  await $({ stdio: "inherit" })`node src/script/build.mjs`;
  await $({ stdio: "inherit" })`node src/server/app.mjs`;
}

main();