#!/usr/bin/env node

import { spawn } from 'node:child_process';
import chalk from 'chalk';

/** @type {keyof chalk} */
const COLORS = ['green', 'yellow', 'blue', 'magenta', 'cyan'];
/** @type {{[prefix:string]: keyof chalk}} */
const prefixToColor = {};
let colorIndex = 0;

/**
 * @param {string} prefix
 * @param {NodeJS.WriteStream} target
 */
const prefixedWriteStream =
  (prefix, target) =>
  /** @param {Buffer} buffer */
  (buffer) => {
    let color = prefixToColor[prefix];
    if (!color) {
      color = prefixToColor[prefix] = COLORS[colorIndex++];
      colorIndex = colorIndex % COLORS.length;
    }
    target.write(buffer.toString().replace(/(.*)\n/g, `${chalk[color](`[${prefix}]`)} $1\n`));
  };

/**
 *
 * @param {string} prefix
 * @param {string} processName
 * @param {string[]} args
 * @param {import('node:child_process').SpawnOptions} opts
 * @returns
 */
const sspawn = (prefix, processName, args, opts) => {
  /** @type {import('node:child_process').ChildProcessWithoutNullStreams} */
  const child = spawn(processName, args, {
    ...opts,
    env: { ...process.env, ...opts?.env },
  });
  child.stdout.on('data', prefixedWriteStream(prefix, process.stdout));
  child.stderr.on('data', prefixedWriteStream(prefix, process.stderr));
  return new Promise((resolve, reject) => {
    child.on('close', (code) => (code === 0 ? resolve() : reject(code)));
  });
};

process.on('unhandledRejection', (e) => {
  console.error(e);
  process.exit(1);
});
process.on('uncaughtException', (e) => {
  console.error(e);
  process.exit(1);
});

// migrate database
await sspawn('migrateToLatest', 'node', ['build/bin/migrateToLatest.js'], {
  cwd: 'packages/db',
  env: { LITEL_DISABLE: '1' },
});

// litel
sspawn('litel', 'node', ['build/server'], {
  cwd: 'packages/litel',
  env: { NODE_ENV: 'production' },
});

// db
sspawn('db', 'node', ['-r', 'dotenv/config', 'build'], {
  cwd: 'packages/db',
  env: { NODE_ENV: 'production' },
});

// dhcpd
sspawn('dhcpd', 'node', ['start.waitOnDb.js']).then(() =>
  sspawn('dhcpd', 'node', ['-r', 'dotenv/config', 'build'], {
    cwd: 'packages/dhcpd',
    env: { NODE_ENV: 'production' },
  })
);

// web-ui
sspawn('web-ui', 'node', ['start.waitOnDb.js']).then(() =>
  sspawn('web-ui', 'node', ['-r', 'dotenv/config', 'build'], {
    cwd: 'packages/web-ui',
    env: { NODE_ENV: 'production' },
  })
);
