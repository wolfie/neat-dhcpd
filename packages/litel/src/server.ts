import { createServer } from 'net';
import SuperJSON from 'superjson';
import type { HierarchicalTrace } from './client.js';
import type { TraceStub } from './index.js';
import express from 'express';
import partition from './lib/partition.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// TODO if not disabled, show link to the output in the UI

if (process.env.LITEL_DISABLE) {
  console.error('litel is disabled, not starting server');
  process.exit(1);
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const HTML_TEMPLATE = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
const createHtmlText = (data: unknown) =>
  HTML_TEMPLATE.replace('window.data = [];', `window.data = ${JSON.stringify(data)};`);

const traces: HierarchicalTrace[] = [];
const MAX_ENTRIES = 1000;

setInterval(() => traces.splice(0, traces.length - MAX_ENTRIES), 2000);

const server = createServer((socket) => {
  socket.on('data', (data) => {
    const trace = SuperJSON.parse<HierarchicalTrace>(data.toString('utf8'));
    traces.push(trace);
  });
  socket.on('connect', () => {
    console.log('connection!');
  });
});

const PORT = 12345;
server.listen(PORT, 'localhost', () => {
  console.log(`Server started on port ${PORT}`);
});

const getDuration = (trace: TraceStub) =>
  trace.duration.length === 1 ? 0 : Number((trace.duration[2] * 1000n) / 1000000n) / 1000;

type DisplayTrace = {
  id: string;
  name: string;
  start: number;
  system: string;
  durationMs: number;
  remote: string | undefined;
  children: DisplayTrace[];
};
const foo =
  (remoteRoots: HierarchicalTrace[]) =>
  (trace: HierarchicalTrace): DisplayTrace => ({
    id: trace.id,
    name: trace.name,
    start: trace.start,
    system: trace.system,
    durationMs: getDuration(trace),
    remote: trace.remote?.parentId,
    children: [
      ...trace.children.map(foo(remoteRoots)),
      ...remoteRoots
        .filter((remoteRoot) => remoteRoot.remote?.parentId === trace.id)
        .map(foo(remoteRoots)),
    ],
  });

const httpServer = express();
httpServer.get('/', (_req, res) => {
  const { pass: remoteRoots, fail: roots } = partition(
    traces,
    (trace) => trace.parentId === null && !!trace.remote
  );

  const tree = roots.map(foo(remoteRoots)).sort((a, b) => b.start - a.start);

  res.header({ 'content-type': 'text/html; charset=utf-8' }).send(createHtmlText(tree));
});
httpServer.listen(12346, () => {
  console.log('HTTP server started on port 12346');
});
