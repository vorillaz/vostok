#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import handleError from './handleError';

yargs(hideBin(process.argv))
  .strict()
  .command(
    '$0',
    'Vostok usage',
    () => undefined,
    () => {
      yargs.showHelp();
    }
  )
  .command('dev', 'Running Vostok on dev/watch mode', require('./commands/dev'))
  .alias({ h: 'help' })
  .epilogue('For more information, visit https://github.com/vorillaz/vostok')
  .fail(handleError).argv;
