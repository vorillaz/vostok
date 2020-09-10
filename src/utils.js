const crossSpawn = require('cross-spawn');
const path = require('path');
const http = require('http');
const https = require('https');
const {gt} = require('semver');
const chalk = require('chalk');
const dotenv = require('dotenv');
const minimist = require('minimist');
const {readFileSync, existsSync} = require('fs-extra');
const {args, portGap, registry, allApps} = require('./constants');

const isTest = process.env.NODE_ENV === 'test';

const getJson = url =>
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
        reject();
      });
  });

const isFn = fn => !!(fn && fn.constructor && fn.call && fn.apply);

const chalkErr = chalk.bold.red;
const chalkSuccess = chalk.bold.green;
const chalkRedBg = chalk.bgRed;
const chalkInfo = chalk.keyword('orange');

const logErr = e => console.error(chalkErr(e));
const log = msg => console.log(chalkSuccess(msg));
const logInfo = msg => console.log(chalkInfo(msg));
const logRedAlert = msg => console.log(chalkRedBg(msg));

let portsRange = portGap;

const getConfig = async () => {
  if (isTest) {
    return {};
  }

  try {
    const conf = require(path.join(process.cwd(), 'vostok.config.js'));
    const confContents = isFn(conf) ? await conf() : conf;
    return confContents;
  } catch (ingore) {}

  logErr('\nYikes! you need a vostok.config.js in place!\n');
  process.exit(0);
};

const filterBuilds = (builds, apps = allApps) => {
  if (apps === allApps) {
    return builds;
  }

  const passedApps = apps.split(',').map(app => app.trim());
  return builds.filter(
    ({name = '__/GIBBERISH/__', pkg = '__/GIBBERISH/__'}) => {
      return (
        passedApps.indexOf(name.trim()) > -1 ||
        passedApps.indexOf(pkg.trim()) > -1
      );
    }
  );
};

const spawn = (command = '', args = [], opts = {}) => {
  return new Promise((resolve, reject) => {
    const stderrLogs = [];
    opts = {
      stdio: 'inherit',
      ...opts
    };
    const child = crossSpawn(command, args, opts);

    if (opts.stdio === 'pipe' && child.stderr) {
      child.stderr.on('data', data => stderrLogs.push(data));
    }

    child.on('error', reject);

    child.once('close', (code, signal) => {
      return resolve(signal);
    });
  });
};

const getArgs = passedArgs => {
  const argv = passedArgs || minimist(process.argv.slice(2));
  const defaultArgs = Object.keys(args).reduce(
    (prev, curr) => ({...prev, [curr]: args[curr]['default']}),
    {}
  );
  let found;

  const filteredArgs = Object.keys(argv).reduce((prev, curr) => {
    found = Object.keys(args).find(key => args[key].options.indexOf(curr) > -1);
    return found ? {...prev, [found]: argv[curr]} : prev;
  }, defaultArgs);

  return filteredArgs;
};

const checkFile = file => existsSync(file);

const loadEnv = (dest, dev = false) => {
  const rootEnv = path.join(dest, '.env');
  const localEnv = path.join(dest, '.env.local');

  const hasEnv = checkFile(rootEnv);
  const hasLocalEnv = checkFile(localEnv) && dev;

  if (hasEnv) {
    logInfo(`\n.env found and passed across all apps\n`);
  }

  if (hasLocalEnv) {
    logInfo(`.env.local found and passed across all apps\n`);
  }

  const env = hasEnv ? dotenv.parse(readFileSync(rootEnv)) : {};
  const local = hasLocalEnv ? dotenv.parse(readFileSync(localEnv)) : {};

  return {...env, ...local};
};

const isPortTaken = port => {
  const tester = http.createServer(() => {});
  let isTaken;
  return new Promise((resolve, reject) => {
    tester.on('listening', e => {
      isTaken = false;
      tester.close();
    });

    tester.on('close', e => {
      resolve(isTaken);
    });

    tester.on('error', e => {
      tester.close();
      isTaken = true;
    });

    tester.listen(port);
  });
};

const getNextPort = async (p = 3000) => {
  let port = p;
  let isTaken = await isPortTaken(port);
  while (isTaken) {
    port = port + 1;
    isTaken = await isPortTaken(port);
  }

  return port;
};

const getPort = async () => {
  portsRange = portsRange + 11;
  const p = getNextPort(portsRange);
  return p;
};

let hasBeenChecked = false;
const shouldUpdate = currentVersion => {
  if (hasBeenChecked) {
    return Promise.reject();
  }
  return new Promise((resolve, reject) => {
    hasBeenChecked = true;
    getJson(registry.url)
      .then((data = {}) => {
        const {collected = {}} = data;
        const {metadata = {}} = collected;
        const {version = false} = metadata;
        if (!version) {
          reject();
          return;
        }

        if (!gt(version, currentVersion)) {
          reject();
          return;
        }

        resolve(version);
      })
      .catch(e => {
        reject();
      });
  });
};

module.exports = {
  logRedAlert,
  spawn,
  getConfig,
  getArgs,
  isTest,
  filterBuilds,
  logErr,
  log,
  getPort,
  chalkErr,
  getNextPort,
  chalkSuccess,
  chalkInfo,
  logInfo,
  loadEnv,
  isPortTaken,
  shouldUpdate
};
