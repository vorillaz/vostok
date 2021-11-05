import chalk from 'chalk';
import { EOL } from 'os';
import crossSpawn from 'cross-spawn';
import { SpawnOptions } from 'child_process';
import http from 'http';
import https from 'https';
import path from 'path';
import { readFileSync, existsSync } from 'fs-extra';
import { ALL_APPS, Usage, NODE_USE, STATIC_USE } from './constants';
import dotenv from 'dotenv';
import { gt } from 'semver';
import { version as currentVersion } from '../package.json';

export type Build = {
  name?: string;
  dest?: string;
  use?: Usage;
  pkg?: string;
  port?: number;
  src?: string;
  env?: { [key: string]: string };
};

const registry = 'https://api.npms.io/v2/package/vostok';

export const isTest = process.env.NODE_ENV === 'test';

const chalkErr = chalk.bold.red;
const chalkSuccess = chalk.bold.green;
const chalkRedBg = chalk.bgRed;
const chalkInfo = chalk.keyword('orange');
const chalkInfoBold = chalkInfo.bold;

export const logErr = (e: string) => chalkErr(e) + EOL;
export const log = (message: string) => chalkSuccess(message) + EOL;
export const logInfo = (message: string) => chalkInfo(message) + EOL;
export const logRedAlert = (message: string) => chalkRedBg(message) + EOL;
export const logBold = (message: string) => chalkInfoBold(message) + EOL;

//   http utils
let portsRange = 4000;
export const isPortTaken = (port: number) => {
  const tester = http.createServer(() => {});
  let isTaken = false;
  return new Promise((resolve, reject) => {
    tester.on('listening', () => {
      isTaken = false;
      tester.close();
    });

    tester.on('close', () => {
      resolve(isTaken);
    });

    tester.on('error', () => {
      tester.close();
      isTaken = true;
    });

    tester.listen(port);
  });
};

export const getNextPort = async (p = 3000) => {
  let port = p;
  let isTaken = await isPortTaken(port);
  while (isTaken) {
    port = port + 1;
    isTaken = await isPortTaken(port);
  }

  return port;
};

export const getPort = async () => {
  portsRange = portsRange + 11;
  const p = getNextPort(portsRange);
  return p;
};
const isFn = (fn?: () => {}) => !!(fn && fn.constructor && fn.call && fn.apply);

export const getConfig = async (config: string = 'vostok.config.js') => {
  if (isTest) {
    return {};
  }

  try {
    const confPath = path.join(process.cwd(), config);
    if (!existsSync(confPath)) {
      process.stderr.write(
        chalkErr('Yikes! you need a vostok.config.js in place!\n')
      );
      throw new Error();
    }
    const conf = require(confPath);
    const confContents = isFn(conf) ? await conf() : conf;
    return confContents;
  } catch (err) {
    process.exit(1);
  }
};

export const filterBuilds = (builds: Build[], apps: string[] = [ALL_APPS]) => {
  if (apps[0] === ALL_APPS) {
    //   @ts-ignore
    return builds.sort((a, b) => {
      //   @ts-ignore
      return b?.dest?.localeCompare(a?.dest);
    });
  }

  const mappedApps = Array.isArray(apps) ? apps : [apps];

  const passedApps = mappedApps.map(app => app.trim());
  return (
    builds
      .filter(({ name = '__/GIBBERISH/__', pkg = '__/GIBBERISH/__' }) => {
        return (
          passedApps.indexOf(name.trim()) > -1 ||
          passedApps.indexOf(pkg.trim()) > -1
        );
      })
      //   @ts-ignore
      .sort((a, b) => {
        //   @ts-ignore
        return b?.dest?.localeCompare(a?.dest);
      })
  );
};

const checkFile = (file: string) => existsSync(file);

export const loadEnv = (dest: string, dev = false) => {
  const rootEnv = path.join(dest, '.env');
  const localEnv = path.join(dest, '.env.local');

  const hasEnv = checkFile(rootEnv);
  const hasLocalEnv = checkFile(localEnv) && dev;

  if (hasEnv) {
    process.stderr.write(logInfo(`\n.env found and passed across all apps`));
  }

  if (hasLocalEnv) {
    process.stderr.write(
      logInfo(`.env.local found and passed across all apps`)
    );
  }

  const env = hasEnv ? dotenv.parse(readFileSync(rootEnv)) : {};
  const local = hasLocalEnv ? dotenv.parse(readFileSync(localEnv)) : {};

  return { ...env, ...local };
};

export const spawn = (
  command: string = '',
  args: string[] = [],
  opts: SpawnOptions = {}
) => {
  return new Promise((resolve, reject) => {
    const stderrLogs = [];
    opts = {
      stdio: 'inherit',
      ...opts
    };
    const child = crossSpawn(command, args, opts);

    // @ts-ignore
    if (opts?.stdio === 'pipe' && child.stderr) {
      child.stderr.on('data', data => stderrLogs.push(data));
    }

    child.on('error', reject);
    child.once('close', (code, signal) => {
      return resolve(signal);
    });
  });
};
const getJson = (url: string) =>
  new Promise((resolve, reject) => {
    https
      .get(url, resp => {
        let data = '';

        // A chunk of data has been recieved.
        resp.on('data', chunk => {
          data += chunk;
        });

        // The whole response has been received. Print out the result.
        resp.on('end', () => {
          let d;
          try {
            d = JSON.parse(data);
          } catch (ignore) {
            d = {};
          }
          resolve(d);
        });
      })
      .on('error', err => {
        reject(err);
      });
  });

let hasBeenChecked = false;
export const shouldUpdate = () => {
  if (hasBeenChecked) {
    return Promise.reject();
  }
  return new Promise((resolve, reject) => {
    hasBeenChecked = true;
    getJson(registry)
      .then((data = {}) => {
        const { collected = {} } = data as any;
        const { metadata = {} } = collected;
        const { version = false } = metadata;
        if (!version) {
          reject();
          return;
        }

        if (!gt(version, currentVersion)) {
          reject();
          return;
        }

        process.stderr.write(
          log(`There is a new version of Vostok available: v${version}`)
        );
        return resolve(version);
      })
      .catch(e => {
        reject(e);
      });
  });
};
