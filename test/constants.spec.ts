import anyTest, { TestInterface } from 'ava';
const test = anyTest as TestInterface<{}>;

import * as constants from '../src/constants';

test('vostok constants', t => {
  t.snapshot(constants);
});
