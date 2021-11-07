import anyTest, { TestInterface } from 'ava';
const test = anyTest as TestInterface<{}>;

import { join } from 'path';
import { once } from 'events';
import http from 'http';
import fs from 'fs-extra';

import {
  spawn,
  getConfig,
  getPort,
  getNextPort,
  loadEnv,
  filterBuilds,
  isPortTaken,
  logErr,
  logInfo,
  log
} from '../src/utils';

const defaultBuild = {
  pkg: '',
  dest: ''
};

test.serial('filterBuilds', t => {
  const fooBuild = [{ pkg: 'foo', dest: '/foo' }];
  const barBuild = [{ pkg: 'bar', dest: '/bar' }];
  const fooBarBuild = [...fooBuild, ...barBuild];

  t.deepEqual(filterBuilds([]), []);
  t.deepEqual(filterBuilds([defaultBuild]), [defaultBuild]);
  t.deepEqual(filterBuilds(fooBuild), fooBuild);
  t.deepEqual(filterBuilds(fooBarBuild), fooBarBuild);
});

test.serial('getConfig', async t => {
  const conf = await getConfig();
  t.snapshot(conf);
});

test.serial('loadEnv on production', async t => {
  const production = await loadEnv(__dirname, false);

  t.snapshot(production);
});

test.serial('loadEnv on dev mode', async t => {
  const dev = await loadEnv(__dirname, true);
  t.snapshot(dev);
});

test.serial(
  'getPort allows to map a new port with a meaningful gap',
  async t => {
    const p1 = await getPort();
    const p2 = await getPort();
    t.is(p2 - p1, 11);
  }
);

test('getNextPort grabs the next available port', async t => {
  const server = http.createServer(() => {});

  let p = await getNextPort(4000);
  t.is(p, 4000);

  server.listen(4000);
  await once(server, 'listening').then(() => {});

  p = await getNextPort(4000);
  t.is(p, 4001);
  server.close();
});

test('isPortTaken detects TCP ports already in use', async t => {
  const server = http.createServer(() => {});
  const port = 1312;
  let p = await isPortTaken(port);
  t.is(p, false);

  server.listen(port);
  await once(server, 'listening').then(() => {});

  p = await isPortTaken(port);
  t.is(p, true);
  server.close();
});

test.serial('logErr', t => {
  t.snapshot(logErr('foo'));
});

test.serial('log', t => {
  t.snapshot(log('foo'));
});

test.serial('spawn executes a common shell command', async t => {
  const original = join(__dirname, 'fixtures/file.txt');
  const target = join(__dirname, 'fixtures/file_new.txt');
  try {
    await fs.remove(target);
  } catch (error) {}

  // @ts-ignore
  await spawn('cp', [original, target]);
  const file = fs.lstat(target);

  t.true((await file).isFile());
  await fs.remove(target);
});
