const fs = require('fs');
const path = require('path');

/** @param {string} path  */
const waitForFileUpdate = (path) =>
  new Promise((resolve, reject) => {
    const interval = setInterval(() => console.log('still waiting for db...'), 5000);
    const watcher = fs.watch(path, (e) => {
      clearInterval(interval);
      watcher.close();
      resolve();
    });

    watcher.on('error', (e) => {
      clearInterval(interval);
      watcher.close();
      reject(e);
    });
  });

const dbPath = path.resolve(__dirname, 'db.sqlite');
console.log(`waiting for ${dbPath} to be updated...`);
waitForFileUpdate(dbPath).then(() => console.log('db.sqlite got updated!'));
