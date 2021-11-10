import type { Arguments, CommandBuilder } from 'yargs';
import express from 'express';
import { ALL_APPS } from '../constants';
import {
  isPortTaken,
  getConfig,
  getNextPort,
  filterBuilds,
  logInfo,
  logErr,
  log,
  logBold,
  loadEnv,
  shouldUpdate
} from '../utils';
import createChildProcess from '../child';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { STATIC_USE, NODE_USE } from '../constants';

import { createHttpTerminator } from 'http-terminator';

export const command = 'dev';
export const aliases: Array<string> = ['d'];

export type DevOptions = {
  debug?: boolean;
  config?: string;
  apps?: string[];
  port?: number;
};

export const devOptions = {
  debug: { type: 'boolean', alias: 'd', default: false },
  config: { type: 'string', alias: 'c', default: undefined },
  port: { type: 'number', alias: 'p', default: 3000 },
  apps: { type: 'array', alias: 'a', default: [ALL_APPS] }
} as const;

export type DevHandler = (argv: Arguments<DevOptions>) => PromiseLike<void>;

const timeout = 2000;

const mapPort = async (p: number) => {
  const nextPort = await getNextPort(p);
  logInfo(`Port ${p} was taken. Using ${nextPort} instead`);
  return nextPort;
};

export const builder: CommandBuilder = yargs =>
  yargs
    .options({
      ...devOptions
    })
    .example([
      ['$0 vostok dev'],
      ['$0 vostok dev --debug'],
      ['$0 vostok dev --config=../vostok.config.js']
    ]);

export const handler: DevHandler = async argv => {
  const { debug, config, apps = [ALL_APPS], port = 3000 } = argv;
  try {
    await shouldUpdate();
  } catch (error) {}
  const clp = await import('clipboardy').then(m => m.default);

  try {
    const vostokConfig = await getConfig(config);
    const { builds: rawBuilds = [] } = vostokConfig;
    if (rawBuilds.length === 0) {
      process.stderr.write(
        logErr(
          `Yikes! There are no builds specified inside your \`vostok.config.js\``
        )
      );
      process.exit(0);
    }

    const builds = filterBuilds(rawBuilds, apps);
    if (builds.length > 0 && apps[0] !== ALL_APPS) {
      process.stderr.write(
        logInfo(`
          \nStarting Vostok with : ${apps
            .map(subapp => subapp.trim())
            .join(', ')}
        `)
      );
    }
    const isTaken = await isPortTaken(port);
    const env = loadEnv(process.cwd(), true);
    const NODE_ENV = 'development';
    let rootPort = isTaken ? await mapPort(port) : port;

    // Config is set spin up the server
    const server = express();
    const address = `http://localhost:${rootPort}`;
    let msg = log('Vostok launched. 🛰️');
    msg += `Booting and running at: ${log(address)}\n`;

    const spawnOpts = {
      env: {
        ...process.env,
        ...env,
        NODE_ENV
      }
    };

    const buildsInfo = await Promise.all(
      builds.map(build => {
        return createChildProcess({ server, build, spawnOpts });
      })
    );

    const router = buildsInfo.reduce((acc, build) => {
      const { port, dest = '', subdomain = '', use = NODE_USE } = build;
      let reroute = `localhost:${rootPort}${dest}`;

      if (use === NODE_USE) {
        if (subdomain) {
          reroute = `${subdomain}.localhost:${rootPort}${dest}`;
        }
        return { ...acc, [reroute]: `http://localhost:${port}` };
      }

      return { ...acc };
    }, {}) as any;

    await server.use(
      createProxyMiddleware({
        ws: true, // proxy websockets for local development
        logLevel: debug ? 'debug' : 'silent',
        router,
        xfwd: true,
        changeOrigin: true,
        onClose: async (res, socket, head) => {
          clp.write('closing');
        }
      })
    );

    buildsInfo.forEach(buildInfo => {
      msg += `${logBold(
        `- /${buildInfo.pkg} -> ${
          //   @ts-ignore
          buildInfo?.use === STATIC_USE
            ? 'Serving static content'
            : buildInfo.port
        }`
      )}`;
    });

    try {
      await clp.write(address);
      msg += `\n\n${logInfo('Copied local address to clipboard!')}`;
    } catch (err) {
      process.stderr.write(
        // @ts-ignore
        logErr(`Cannot copy to clipboard: ${err?.message}`)
      );
    }
    process.stderr.write(msg);
    const instance = server.listen(rootPort);

    const httpTerminator = createHttpTerminator({
      gracefulTerminationTimeout: timeout,
      server: instance
    });

    const shutdown = () => {
      return httpTerminator.terminate();
    };

    let logged = false;
    process.on('SIGINT', () => {
      shutdown().then(() => {
        if (!logged) {
          console.log(logInfo(`\n\nClosing Vostok ...\n\n`));
          logged = true;
        }
      });
    });
  } catch (e) {
    throw e;
  }
};
