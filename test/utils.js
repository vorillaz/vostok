const test = require('ava');
const {join} = require('path');
const {once} = require('events');
const http = require('http');
const fs = require('fs-extra');

const {
  spawn,
  getConfig,
  getArgs,
  getPort,
  getNextPort,
  chalkErr,
  chalkSuccess,
  chalkInfo,
  loadEnv,
  isPortTaken
} = require('../src/utils');

test('getConfig', t => {
  t.snapshot(getConfig());
});

test('loadEnv on production', async t => {
  const production = await loadEnv(__dirname, false);

  t.snapshot(production);
});

test('loadEnv on dev mode', async t => {
  const dev = await loadEnv(__dirname, true);
  t.snapshot(dev);
});

test('getPort allows to map a new port with a meaningful gap', async t => {
  const p1 = await getPort();
  const p2 = await getPort();
  t.is(p2 - p1, 211);
});

test('getNextPort grabs the next available port', async t => {
  const server = http.createServer(() => {});
  server.listen(4000);
  await once(server, 'listening').then(() => {});

  const p = await getNextPort(4000);
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

test('chalkErr', t => {
  t.is(chalkErr('foo'), 'foo');
});

test('chalkSuccess', t => {
  t.is(chalkSuccess('foo'), 'foo');
});

test('chalkInfo', t => {
  t.is(chalkInfo('foo'), 'foo');
});

test('getArgs maps the default arguments', async t => {
  const args = await getArgs();
  t.snapshot(args);
});

test('getArgs with passed arguments', async t => {
  const args = await getArgs({l: true, port: 8000});
  t.snapshot(args);
});

test.serial('getArgs with cli arguments', async t => {
  const oldArgv = process.argv;
  const injectedArgv = [...oldArgv.slice(0, 2), '-p', 1333, '-l', true];
  process.argv = [...injectedArgv];
  const args = await getArgs();
  process.argv = oldArgv;
  t.snapshot(args);
});

test.serial('spawn executes a common shell command', async t => {
  const original = join(__dirname, 'fixtures/file.txt');
  const target = join(__dirname, 'fixtures/file_new.txt');
  try {
    await fs.remove(target);
  } catch (error) {}

  await spawn('cp', [original, target]);
  const file = fs.lstat(target);

  t.true((await file).isFile());
  await fs.remove(target);
});
