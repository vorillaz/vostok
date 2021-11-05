import { existsSync, lstatSync } from 'fs-extra';
import { join } from 'path';
import { logErr, spawn } from './utils';
import { SpawnOptions } from 'child_process';

const hasYarn = (pkg: string) =>
  existsSync(join(process.cwd(), 'yarn.lock')) ||
  existsSync(join(process.cwd(), pkg, 'yarn.lock'));

const isDir = (dirPath?: string) =>
  dirPath && existsSync(dirPath) && lstatSync(dirPath).isDirectory();

const isFile = (filePath?: string) =>
  filePath && existsSync(filePath) && lstatSync(filePath).isFile();

const run = async ({
  pkg,
  command,
  opts
}: {
  pkg: string;
  command: string;
  opts: SpawnOptions;
}) => {
  const pkgPath = join(process.cwd(), pkg) as string;

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

  const { scripts = null } = pkgJson;
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
  return { pkg, opts };
};

export default run;
