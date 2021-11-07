import path from 'path';
import { Application } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { NODE_USE, STATIC_USE } from './constants';
import { getPort, logErr } from './utils';
import express from 'express';
import run from './run';
import { VostokBuild } from '../vostok';
const createChildServer = async ({
  server,
  build,
  debug,
  spawnOpts = {}
}: {
  server: Application;
  build: VostokBuild;
  debug?: boolean;
  spawnOpts: { [key: string]: any };
}) => {
  const {
    use = NODE_USE,
    pkg = '',
    port: buildPort,
    dest = '/',
    env: buildEnv = {},
    pathRewrite = {},
    router = {}
  } = build;

  const port = buildPort ? buildPort : await getPort();

  if (pkg === null) {
    process.stderr.write(logErr(`There is a build with no \`pkg\` defined.`));
  }
  const { env = {} } = spawnOpts;

  const opts = {
    cwd: path.join(process.cwd(), pkg),
    ...spawnOpts,
    env: { ...env, ...buildEnv, PORT: port }
  };

  if (use === STATIC_USE) {
    await server.use(dest, express.static(path.join(process.cwd(), pkg)));
  }

  if (use === NODE_USE) {
    await server.use(
      dest,
      createProxyMiddleware({
        target: `http://localhost:${port}`,
        ws: true, // proxy websockets for local development
        logLevel: debug ? 'debug' : 'silent',
        router,
        pathRewrite
      })
    );

    run({ pkg, opts, command: 'dev' });
  }
  return { pkg, port };
};

export default createChildServer;
