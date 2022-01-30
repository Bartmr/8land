const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const mkDir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);

async function run() {
  await mkDir(path.resolve('node_modules', '@types', 'mocha'), {
    recursive: true,
  });
  await writeFile(
    path.resolve('node_modules', '@types', 'mocha', 'index.d.ts'),
    `
declare namespace Mocha {
  interface MochaOptions {}
}`,
  );
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
