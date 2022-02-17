const { promisify } = require('util');
const fs = require('fs');

const writeFile = promisify(fs.writeFile);

const firebaseJSON = (process.env.FIREBASE_JSON || '').trim();

if (!firebaseJSON) {
  throw new Error();
}

async function run() {
  await writeFile('/usr/src/app/service-account-file.json', firebaseJSON);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
