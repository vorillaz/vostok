const test = require('ava');
const constants = require('../src/constants');

test('vostok constants', t => {
  t.snapshot(constants);
});
