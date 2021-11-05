const path = require('path');
const fs = require('fs');
const chalk = require('chalk');

const log = (...message) => {
  console.log(chalk.magenta('build') + ' -', ...message);
};

const err = (...message) => {
  console.error(chalk.red('Proxima') + ' -', ...message);
};

module.exports = {
  log,
  err
};
