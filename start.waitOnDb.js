const fs = require("fs");
const path = require("path");

/** @param {string} path  */
const waitForFileUpdate = (path) =>
  new Promise((resolve, reject) => {
    const watcher = fs.watch(path, (e) => {
      if (e === "change") {
        watcher.close();
        resolve();
      }
    });

    watcher.on("error", (e) => {
      watcher.close();
      reject(e);
    });
  });

console.log("waiting for db.sqlite to be updated...");
waitForFileUpdate(path.resolve(__dirname, "db.sqlite"));
console.log("db.sqlite got updated!");
