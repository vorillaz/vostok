const {existsSync, lstatSync} = require('fs-extra');
const {join} = require('path');
const {logErr, spawn} = require('./utils');

const hasYarn = pkg =>
  existsSync(join(process.cwd(), 'yarn.lock')) ||
  existsSync(join(process.cwd(), pkg, 'yarn.lock'));

const isDir = dirPath =>
  existsSync(dirPath) && lstatSync(dirPath).isDirectory();
const isFile = filePath => existsSync(filePath) && lstatSync(filePath).isFile();

const run = async ({pkg, command, opts}) => {
  const pkgPath = join(process.cwd(), pkg);

  if (!isDir(pkgPath)) {
    logErr(`${pkg} should be a directory`);
    process.exit(0);
  }

  const pkgPackagePath = join(pkgPath, 'package.json');
  if (!isFile(pkgPackagePath)) {
    logErr(`${pkg}/package.json does not exist!`);
    process.exit(0);
  }
  const pkgJson = require(pkgPackagePath);

  const {scripts = null} = pkgJson;
  if (scripts === null) {
    logErr(`${pkg}/package.json does not have any scripts!`);
    process.exit(0);
  }

  if (!scripts[command]) {
    logErr(`${command} script is not registered within ${pkg}/package.json`);
    process.exit(0);
  }
  const isYarnAvailable = hasYarn(pkg);

  if (isYarnAvailable) {
    spawn('yarn', ['--ignore-engines', '--cwd', pkgPath, 'run', command], opts);
  } else {
    spawn('npm', ['run', command], opts);
  }
};

module.exports = run;
