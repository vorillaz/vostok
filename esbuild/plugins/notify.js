const { log, err } = require('./utils.js');

const notify = {
  name: 'notify',
  setup(build) {
    let start;
    const precision = 3;
    build.onStart(() => {
      start = process.hrtime();
      log('Build started');
    });
    build.onEnd(result => {
      const elapsed = process.hrtime(start)[1] / 1000000;
      if (result.errors.length > 0) {
        err('Error on build');
      } else {
        log(
          `Build ended with ${result.errors.length} errors in ${elapsed.toFixed(
            precision
          )}ms`
        );
      }
    });
  }
};

module.exports = notify;
